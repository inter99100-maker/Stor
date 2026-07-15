import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowRight, PhoneCall, Heart, Sparkles, Star, Store, ShieldAlert,
  Search, ChevronRight, CheckCircle2, ShoppingBag, Bell, MessageCircle,
  Truck, Clock, ClipboardList, X, MapPin
} from "lucide-react";

import Header from "./components/Header";
import HomeSlider from "./components/HomeSlider";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutForm from "./components/CheckoutForm";
import AdminPanel from "./components/AdminPanel";

import { Category, Product, Order, BannerSettings, StoreData } from "./types";
// @ts-ignore
import nephLogo from "./assets/images/neph_logo_1783194516887.jpg";

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export default function App() {
  // Store lists from server
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<BannerSettings | null>(null);

  // Dynamic maximum price calculated based on catalog items
  const dynamicMaxPrice = useMemo(() => {
    if (products.length === 0) return 35000;
    const maxProductPrice = Math.max(
      ...products.map((p) => {
        const price = p.salePrice !== null && p.salePrice !== undefined && p.salePrice !== "" ? p.salePrice : p.regularPrice;
        return Number(price) || 0;
      })
    );
    return Math.max(35000, Math.ceil(maxProductPrice / 5000) * 5000);
  }, [products]);

  // Interface UI states
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"home" | "checkout" | "admin">("home");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(35000);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Automatically update maxPriceFilter default on products loading
  useEffect(() => {
    if (products.length > 0) {
      setMaxPriceFilter(dynamicMaxPrice);
    }
  }, [products, dynamicMaxPrice]);

  // Order Tracking UI states
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackedOrderResult, setTrackedOrderResult] = useState<Order | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Reset sub-filters when main category is changed
  useEffect(() => {
    setSelectedBrand("all");
    setSelectedSubCategory("all");
    if (selectedCategorySlug !== "all") {
      setMaxPriceFilter(dynamicMaxPrice);
    }
  }, [selectedCategorySlug, dynamicMaxPrice]);

  // In-app Notification / Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Promo Popup state
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [promoTimer, setPromoTimer] = useState(10);

  // Trigger popup when banners data is first loaded
  useEffect(() => {
    if (banners?.promoPopup?.enabled && banners.promoPopup.imageUrl) {
      setShowPromoPopup(true);
      setPromoTimer(banners.promoPopup.autoCloseSeconds || 10);
    }
  }, [banners]);

  // Flash Sale Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: "03", minutes: "42", seconds: "19" });

  useEffect(() => {
    const endTimeStr = banners?.flashSaleEndTime;
    if (!endTimeStr) {
      return;
    }

    const updateTimer = () => {
      const difference = +new Date(endTimeStr) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0")
      });
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [banners?.flashSaleEndTime]);

  // Countdown timer for auto-close
  useEffect(() => {
    if (!showPromoPopup || promoTimer <= 0) return;

    const interval = setInterval(() => {
      setPromoTimer((prev) => {
        if (prev <= 1) {
          setShowPromoPopup(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPromoPopup, promoTimer]);

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("neph_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync Cart with LocalStorage
  useEffect(() => {
    localStorage.setItem("neph_cart", JSON.stringify(cart));
  }, [cart]);

  // Load store data on mount
  const fetchStoreData = async () => {
    try {
      const res = await fetch("/api/data");
      const data: StoreData = await res.json();
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setBanners(data.banners || null);
    } catch (err) {
      console.error("Error loading NEPH store metadata", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();

    // Secret Admin keyboard shortcut (Ctrl + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveView("admin");
        triggerToast("Secret Shortcut: Welcome to Admin Portal Gate!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Quick helper to show Toast Alerts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, color: string, size: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedColor === color && 
          item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty <= product.stockCount) {
          updated[existingIdx].quantity = newQty;
          triggerToast(`Updated ${product.title} quantity in basket!`);
        } else {
          triggerToast(`Cannot exceed total available stock (${product.stockCount} units).`);
        }
        return updated;
      } else {
        triggerToast(`Added ${product.title} to shopping basket!`);
        return [...prevCart, { product, quantity, selectedColor: color, selectedSize: size }];
      }
    });
  };

  const handleUpdateCartQuantity = (idx: number, val: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const item = updated[idx];
      const nextQty = item.quantity + val;

      if (nextQty <= 0) {
        // Remove item
        triggerToast(`Removed ${item.product.title} from basket.`);
        return prevCart.filter((_, i) => i !== idx);
      } else if (nextQty <= item.product.stockCount) {
        item.quantity = nextQty;
        return updated;
      } else {
        triggerToast(`Cannot exceed total available stock (${item.product.stockCount} units).`);
        return prevCart;
      }
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prevCart) => {
      triggerToast(`Removed ${prevCart[idx].product.title} from basket.`);
      return prevCart.filter((_, i) => i !== idx);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Interactive filtering variables
  const activeCategoryId = categories.find((c) => c.slug === selectedCategorySlug)?.id;

  // Extract all unique brands from products in current category (or all if "all" category)
  const availableBrands = useMemo(() => {
    const activeProducts = products.filter((p) => {
      if (p.isDraft) return false;
      if (selectedCategorySlug === "all") return true;
      if (selectedCategorySlug === "flash-sale") return p.isFlashSale;
      return p.categoryId === activeCategoryId;
    });
    const brandsSet = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand.trim());
    });
    return Array.from(brandsSet).sort();
  }, [products, selectedCategorySlug, activeCategoryId]);

  // Extract all unique sub-categories from products in current category (or all if "all" category)
  const availableSubCategories = useMemo(() => {
    const activeProducts = products.filter((p) => {
      if (p.isDraft) return false;
      if (selectedCategorySlug === "all") return true;
      if (selectedCategorySlug === "flash-sale") return p.isFlashSale;
      return p.categoryId === activeCategoryId;
    });
    const subSet = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.subCategory) subSet.add(p.subCategory.trim());
    });
    return Array.from(subSet).sort();
  }, [products, selectedCategorySlug, activeCategoryId]);

  const filteredProducts = products.filter((prod) => {
    if (prod.isDraft) return false;
    const matchesCategory = 
      selectedCategorySlug === "all" || 
      (selectedCategorySlug === "flash-sale" ? prod.isFlashSale : prod.categoryId === activeCategoryId);
    
    const matchesBrand = 
      selectedBrand === "all" || 
      (prod.brand ? prod.brand.toLowerCase() === selectedBrand.toLowerCase() : false);

    const matchesSubCategory = 
      selectedSubCategory === "all" || 
      (prod.subCategory ? prod.subCategory.toLowerCase() === selectedSubCategory.toLowerCase() : false);

    const actualPrice = Number(prod.salePrice !== null && prod.salePrice !== undefined && prod.salePrice !== "" ? prod.salePrice : prod.regularPrice);
    const matchesPrice = actualPrice <= Number(maxPriceFilter);

    const matchesSearch = 
      searchQuery === "" || 
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.brand ? prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (prod.subCategory ? prod.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) : false);

    return matchesCategory && matchesBrand && matchesSubCategory && matchesSearch && matchesPrice;
  });

  const isAnyFilterActive = searchQuery !== "" || selectedBrand !== "all" || selectedSubCategory !== "all" || maxPriceFilter < dynamicMaxPrice;

  const flashSaleProducts = products.filter((p) => !p.isDraft && p.isFlashSale && p.stockCount > 0);

  // Triggering order completed refreshes server lists
  const handleOrderPlacementComplete = () => {
    fetchStoreData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ff8717] animate-pulse flex items-center justify-center bg-white shadow-lg">
          <img src={nephLogo} alt="NEPH Logo" className="w-full h-full object-cover animate-spin duration-3000" />
        </div>
        <h2 className="text-sm font-bold text-slate-600 font-display uppercase tracking-widest animate-pulse">
          Loading NEPH Marketplace...
        </h2>
      </div>
    );
  }

  // View 1: Admin Panel Gate
  if (activeView === "admin") {
    return (
      <AdminPanel
        categories={categories}
        products={products}
        orders={orders}
        banners={banners}
        onRefreshData={fetchStoreData}
        onBackToStore={() => setActiveView("home")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col" id="store-main-app">
      {/* Dynamic Toast Notice */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 border border-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top duration-300">
          <div className="w-2 h-2 rounded-full bg-brand-orange animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header element */}
      <Header
        categories={categories}
        products={products}
        cartCount={cart.reduce((acc, it) => acc + it.quantity, 0)}
        banners={banners}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => setActiveView("admin")}
        onTrackClick={() => {
          setIsTrackModalOpen(true);
          setTrackOrderId("");
          setTrackedOrderResult(null);
          setTrackSearched(false);
        }}
        onCategorySelect={(slug) => {
          setSelectedCategorySlug(slug);
          setSelectedSubCategory("all");
          setSelectedBrand("all");
          setSearchQuery(""); // Reset search on category swap
          setActiveView("home");
        }}
        onSubCategorySelect={(sub) => {
          setSelectedSubCategory(sub);
          setSelectedBrand("all");
          setSearchQuery("");
          setActiveView("home");
        }}
        onBrandSelect={(brand) => {
          setSelectedBrand(brand);
          setSearchQuery("");
          setActiveView("home");
        }}
        onSearch={(query) => {
          setSearchQuery(query);
          setSelectedCategorySlug("all");
          setActiveView("home");
        }}
        selectedCategorySlug={selectedCategorySlug}
      />

      {/* VIEW 2: CHECKOUT WIZARD VIEW */}
      {activeView === "checkout" ? (
        <main className="flex-1 bg-slate-50">
          <CheckoutForm
            cart={cart}
            onBack={() => setActiveView("home")}
            onOrderCompleted={handleOrderPlacementComplete}
            onClearCart={handleClearCart}
          />
        </main>
      ) : (
        /* VIEW 3: MAIN FRONTEND MARKETPLACE STORE */
        <main className="flex-1 pb-16 max-w-7xl mx-auto px-4 py-6 min-h-[75vh]" id="marketplace-main-view">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar Column (High Density style) */}
            <aside className="hidden lg:flex flex-col w-full bg-white border border-slate-200 rounded-lg shrink-0 lg:sticky lg:top-[165px] lg:max-h-[calc(100vh-185px)] overflow-y-auto shadow-sm" id="sidebar-category-list">
              <div className="bg-[#ff8717] text-white px-4 py-3 font-extrabold uppercase text-xs tracking-wider flex items-center justify-between">
                <span>Browse Categories</span>
                <span>☰</span>
              </div>
              <div className="flex flex-col text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <button
                  onClick={() => {
                    setSelectedCategorySlug("all");
                    setSelectedSubCategory("all");
                    setSelectedBrand("all");
                    setSearchQuery("");
                    setActiveView("home");
                  }}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-[#ff8717]/5 hover:text-[#ff8717] transition-all flex justify-between items-center ${
                    selectedCategorySlug === "all" ? "bg-[#ff8717]/10 text-[#ff8717]" : ""
                  }`}
                >
                  <span>All Categories</span>
                  <span>›</span>
                </button>
                {categories.map((cat) => {
                  const isCatActive = selectedCategorySlug === cat.slug;
                  
                  // Extract Level 1: Subcategories (Circuit Types like AC, DC) for this category from actual products
                  const catProducts = products.filter(p => p.categoryId === cat.id);
                  const baseSubCats = Array.from(new Set(catProducts.map(p => p.subCategory).filter(Boolean) as string[]));
                  if (!baseSubCats.includes("AC")) baseSubCats.push("AC");
                  if (!baseSubCats.includes("DC")) baseSubCats.push("DC");
                  const subCats = baseSubCats.sort();

                  return (
                    <div key={cat.id} className="border-b border-slate-100 flex flex-col">
                      <button
                        onClick={() => {
                          setSelectedCategorySlug(cat.slug);
                          setSelectedSubCategory("all");
                          setSelectedBrand("all");
                          setSearchQuery("");
                          setActiveView("home");
                        }}
                        className={`w-full text-left px-4 py-3.5 hover:bg-[#ff8717]/5 hover:text-[#ff8717] transition-all flex justify-between items-center ${
                          isCatActive ? "bg-[#ff8717]/5 text-[#ff8717]" : ""
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className={`text-[9px] transition-transform duration-200 ${isCatActive ? 'rotate-90 text-[#ff8717]' : 'text-slate-400'}`}>
                          ▶
                        </span>
                      </button>

                      {/* Level 1 Subcategories List */}
                      {isCatActive && subCats.length > 0 && (
                        <div className="bg-slate-50/50 py-1 pl-3 border-l-2 border-[#ff8717]/30 ml-4 my-1 flex flex-col gap-0.5">
                          <button
                            onClick={() => {
                              setSelectedSubCategory("all");
                              setSelectedBrand("all");
                              setSearchQuery("");
                              setActiveView("home");
                            }}
                            className={`text-left px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider transition-all flex items-center justify-between ${
                              selectedSubCategory === "all"
                                ? "text-[#ff8717] font-black bg-[#ff8717]/5"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                            }`}
                          >
                            <span>All {cat.name}</span>
                            {selectedSubCategory === "all" && <span className="w-1.5 h-1.5 bg-[#ff8717] rounded-full" />}
                          </button>

                          {subCats.map((sub) => {
                            const isSubActive = selectedSubCategory.toLowerCase() === sub.toLowerCase();
                            
                            // Extract Level 2: Brands for this category + subcategory
                            const subCatProducts = catProducts.filter(p => p.subCategory?.toLowerCase() === sub.toLowerCase());
                            const brandsInSub = Array.from(new Set(subCatProducts.map(p => p.brand).filter(Boolean) as string[])).sort();

                            return (
                              <div key={sub} className="flex flex-col">
                                <button
                                  onClick={() => {
                                    setSelectedSubCategory(sub);
                                    setSelectedBrand("all");
                                    setSearchQuery("");
                                    setActiveView("home");
                                  }}
                                  className={`text-left px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider transition-all flex items-center justify-between ${
                                    isSubActive
                                      ? "text-[#ff8717] font-black bg-[#ff8717]/5"
                                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/50"
                                  }`}
                                >
                                  <span>⚡ {sub} Circuit</span>
                                  <span className={`text-[8px] transition-transform ${isSubActive ? 'rotate-90 text-[#ff8717]' : 'text-slate-400'}`}>
                                    ▶
                                  </span>
                                </button>

                                {/* Level 2 Subcategories List (Brands under Subcategory) */}
                                {isSubActive && brandsInSub.length > 0 && (
                                  <div className="pl-3 border-l border-slate-200 ml-3 my-0.5 flex flex-col gap-0.5">
                                    <button
                                      onClick={() => {
                                        setSelectedBrand("all");
                                        setSearchQuery("");
                                        setActiveView("home");
                                      }}
                                      className={`text-left px-2 py-1.5 rounded-md text-[9px] uppercase tracking-widest transition-all flex items-center justify-between ${
                                        selectedBrand === "all"
                                          ? "text-[#ff8717] font-black bg-[#ff8717]/5"
                                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/30"
                                      }`}
                                    >
                                      <span>All Brands</span>
                                      {selectedBrand === "all" && <span className="w-1 h-1 bg-[#ff8717] rounded-full" />}
                                    </button>

                                    {brandsInSub.map((b) => {
                                      const isBrandActive = selectedBrand.toLowerCase() === b.toLowerCase();
                                      return (
                                        <button
                                          key={b}
                                          onClick={() => {
                                            setSelectedBrand(b);
                                            setSearchQuery("");
                                            setActiveView("home");
                                          }}
                                          className={`text-left px-2 py-1.5 rounded-md text-[9px] uppercase tracking-widest transition-all flex items-center justify-between ${
                                            isBrandActive
                                              ? "text-[#ff8717] font-extrabold bg-[#ff8717]/5"
                                              : "text-[#ff8717] font-semibold text-slate-500 hover:text-slate-850 hover:bg-[#ff8717]/5"
                                          }`}
                                        >
                                          <span>★ {b}</span>
                                          {isBrandActive && <span className="w-1.5 h-1.5 bg-[#ff8717] rounded-full" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Main Specifications Filter Panel */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4" id="desktop-specifications-filter">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-[11px] font-black uppercase text-slate-850 tracking-wider flex items-center gap-1.5">
                    <span>🎛️ Filter Options</span>
                  </span>
                  {(selectedSubCategory !== "all" || selectedBrand !== "all" || maxPriceFilter < dynamicMaxPrice) && (
                    <button
                      onClick={() => {
                        setSelectedSubCategory("all");
                        setSelectedBrand("all");
                        setMaxPriceFilter(dynamicMaxPrice);
                        setSearchQuery("");
                      }}
                      className="text-[9px] font-extrabold text-[#ff8717] hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* AC / DC Circuit Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex justify-between">
                    <span>Circuit Type</span>
                    {selectedSubCategory !== "all" && <span className="text-sky-700 font-black">⚡ {selectedSubCategory}</span>}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => {
                        setSelectedSubCategory("all");
                        setSearchQuery("");
                      }}
                      className={`py-1.5 px-1 text-[10px] font-black uppercase tracking-wider rounded border text-center transition-all cursor-pointer ${
                        selectedSubCategory === "all"
                          ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubCategory("AC");
                        setSearchQuery("");
                      }}
                      className={`py-1.5 px-1 text-[10px] font-black uppercase tracking-wider rounded border text-center transition-all cursor-pointer ${
                        selectedSubCategory.toLowerCase() === "ac"
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      AC
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubCategory("DC");
                        setSearchQuery("");
                      }}
                      className={`py-1.5 px-1 text-[10px] font-black uppercase tracking-wider rounded border text-center transition-all cursor-pointer ${
                        selectedSubCategory.toLowerCase() === "dc"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      DC
                    </button>
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex justify-between">
                    <span>Select Brand</span>
                    {selectedBrand !== "all" && <span className="text-[#ff8717] font-black">★ {selectedBrand}</span>}
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSearchQuery("");
                    }}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-[#ff8717] cursor-pointer"
                  >
                    <option value="all">All Brands</option>
                    {(selectedCategorySlug === "all"
                      ? Array.from(new Set(products.map(p => p.brand).filter(Boolean) as string[])).sort()
                      : availableBrands
                    ).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      Max Price
                    </label>
                    <span className="text-[11px] font-mono font-black text-slate-800">
                      Rs. {maxPriceFilter.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max={dynamicMaxPrice}
                    step="500"
                    value={maxPriceFilter}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxPriceFilter(val);
                      if (activeView !== "home") {
                        setActiveView("home");
                      }
                    }}
                    className="w-full accent-[#ff8717] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => {
                        setMaxPriceFilter(5000);
                        if (activeView !== "home") {
                          setActiveView("home");
                        }
                      }}
                      className={`px-2 py-1 text-[8px] font-black rounded border transition-all cursor-pointer ${
                        maxPriceFilter === 5000 ? "bg-[#ff8717] text-white border-[#ff8717]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      &lt; 5K
                    </button>
                    <button
                      onClick={() => {
                        setMaxPriceFilter(15000);
                        if (activeView !== "home") {
                          setActiveView("home");
                        }
                      }}
                      className={`px-2 py-1 text-[8px] font-black rounded border transition-all cursor-pointer ${
                        maxPriceFilter === 15000 ? "bg-[#ff8717] text-white border-[#ff8717]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      &lt; 15K
                    </button>
                    <button
                      onClick={() => {
                        setMaxPriceFilter(dynamicMaxPrice);
                        if (activeView !== "home") {
                          setActiveView("home");
                        }
                      }}
                      className={`px-2 py-1 text-[8px] font-black rounded border transition-all cursor-pointer ${
                        maxPriceFilter === dynamicMaxPrice ? "bg-[#ff8717] text-white border-[#ff8717]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Any Price
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border-t border-amber-100 flex flex-col gap-1.5">
                <h4 className="text-[#f57c00] font-extrabold text-[11px] uppercase tracking-wider">Free Shipping</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-snug">On orders over Rs. 5,000</p>
              </div>
              <div className="p-3 bg-sky-50 border-t border-sky-100 flex flex-col gap-1.5">
                <h4 className="text-[#0288d1] font-extrabold text-[11px] uppercase tracking-wider">7-Day Warranty</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-snug">Easy exchange & refunds</p>
              </div>
            </aside>

            {/* Main Content Column */}
            <div className="space-y-6 min-w-0">
              {/* Main Hero Sliders - Only show on Home All category, when not searching or filtering */}
              {selectedCategorySlug === "all" && !isAnyFilterActive && banners && (
                <HomeSlider
                  sliders={banners.heroSliders}
                  sideBanners={banners.sideBanners}
                  products={products}
                  categories={categories}
                  onSelectProduct={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  onSelectCategorySlug={setSelectedCategorySlug}
                />
              )}

              {/* Categories Quick rounded lists (shown on small screen sidebar collapse) */}
              {true && (
                <section className="lg:hidden bg-white p-4 rounded-lg border border-slate-200 shadow-sm" id="categories-round-grid">
                  <div className="text-center mb-4">
                    <h3 className="text-xs font-black text-[#ff8717] uppercase tracking-wider">Shop By Category</h3>
                  </div>
                  <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                    <div
                      onClick={() => setSelectedCategorySlug("all")}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm border ${
                        selectedCategorySlug === "all" ? "bg-[#ff8717] border-[#ff8717]" : "bg-slate-50 border-slate-200"
                      }`}>
                        <Store className={`w-5 h-5 ${selectedCategorySlug === "all" ? "text-white" : "text-slate-600"}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">All</span>
                    </div>

                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className="group flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <div className={`w-12 h-12 rounded-full overflow-hidden border flex items-center justify-center transition-all bg-white shadow-sm ${
                          selectedCategorySlug === cat.slug ? "border-[#ff8717] ring-2 ring-[#ff8717]/30" : "border-slate-200"
                        }`}>
                          <img src={cat.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=150&q=80"} alt={cat.name} className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FLASH SALES TIMER SECTION (Clean Compact Bento Panel) */}
              {selectedCategorySlug === "all" && !isAnyFilterActive && flashSaleProducts.length > 0 && (
                <section id="flash-sale-wrapper">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    {/* Sale Header & Countdown timer */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-sm font-extrabold text-[#ff8717] uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 fill-current text-[#ff8717]" />
                          <span>Flash Sale</span>
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                           <span>Ending In:</span>
                           <span className="bg-slate-800 text-[#ff8717] px-1.5 py-0.5 rounded font-mono text-[10px]">{timeLeft.hours}</span>:
                           <span className="bg-slate-800 text-[#ff8717] px-1.5 py-0.5 rounded font-mono text-[10px]">{timeLeft.minutes}</span>:
                           <span className="bg-slate-800 text-[#ff8717] px-1.5 py-0.5 rounded font-mono text-[10px]">{timeLeft.seconds}</span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedCategorySlug("flash-sale")} className="text-[#ff8717] text-xs font-bold hover:underline">
                        View All
                      </button>
                    </div>

                    {/* Flash Products list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {flashSaleProducts.slice(0, 3).map((prod) => {
                        const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Smart Gadget";
                        return (
                          <ProductCard
                             key={prod.id}
                             product={prod}
                             categoryName={catName}
                             onSelect={setSelectedProduct}
                             onAddToCart={handleAddToCart}
                          />
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* CATALOG GRID */}
              <section id="product-catalog-grid-wrapper" className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm min-h-[550px] flex flex-col justify-start">
                <div className="space-y-3.5 mb-4 border-b border-slate-100 pb-4">
                  
                  {/* Elegant Interactive Breadcrumbs Path */}
                  <div className="flex items-center flex-wrap gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest" id="breadcrumb-navigation">
                    <button 
                      onClick={() => {
                        setSelectedCategorySlug("all");
                        setSelectedSubCategory("all");
                        setSelectedBrand("all");
                      }}
                      className="hover:text-[#ff8717] transition-colors flex items-center gap-1"
                    >
                      <span>🏪 Store</span>
                    </button>
                    {selectedCategorySlug !== "all" && (
                      <>
                        <span className="text-slate-300 font-sans text-xs">/</span>
                        <button 
                          onClick={() => {
                            setSelectedSubCategory("all");
                            setSelectedBrand("all");
                          }}
                          className={`hover:text-[#ff8717] transition-colors ${selectedSubCategory === "all" ? "text-[#ff8717]" : ""}`}
                        >
                          {categories.find(c => c.slug === selectedCategorySlug)?.name || selectedCategorySlug}
                        </button>
                      </>
                    )}
                    {selectedCategorySlug !== "all" && selectedSubCategory !== "all" && (
                      <>
                        <span className="text-slate-300 font-sans text-xs">/</span>
                        <button 
                          onClick={() => {
                            setSelectedBrand("all");
                          }}
                          className={`hover:text-[#ff8717] transition-colors ${selectedBrand === "all" ? "text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded" : ""}`}
                        >
                          ⚡ {selectedSubCategory} Circuit
                        </button>
                      </>
                    )}
                    {selectedCategorySlug !== "all" && selectedSubCategory !== "all" && selectedBrand !== "all" && (
                      <>
                        <span className="text-slate-300 font-sans text-xs">/</span>
                        <span className="text-[#ff8717] bg-[#ff8717]/5 px-1.5 py-0.5 rounded font-black">
                          ★ {selectedBrand}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-[10px] font-black text-[#ff8717] uppercase tracking-widest">
                        {searchQuery ? "Search Results" : (selectedCategorySlug === "all" ? "Explore Store" : selectedCategorySlug === "flash-sale" ? "Flash Deals" : selectedCategorySlug)}
                      </h3>
                      <h2 className="text-sm font-bold text-slate-800 leading-none">
                        {searchQuery ? `Searching for "${searchQuery}"` : (selectedCategorySlug === "all" ? "Trending Marketplace Listings" : selectedCategorySlug === "flash-sale" ? "All Active Flash Sale Deals" : `All ${categories.find(c => c.slug === selectedCategorySlug)?.name}`)}
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Found <span className="font-mono text-[#ff8717] font-bold">{filteredProducts.length}</span> Products
                    </span>
                  </div>

                  {/* Active Brand & Circuit Type filter tags */}
                  {(selectedBrand !== "all" || selectedSubCategory !== "all" || maxPriceFilter < dynamicMaxPrice) && (
                    <div className="flex flex-wrap gap-1.5 pt-1" id="active-filters-row">
                      {selectedBrand !== "all" && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-[#ff8717]/20 text-[#ff8717] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <span>Brand: {selectedBrand}</span>
                          <button
                            onClick={() => setSelectedBrand("all")}
                            className="hover:text-red-500 font-sans text-xs ml-1.5 leading-none focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedSubCategory !== "all" && (
                        <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <span>Circuit: {selectedSubCategory} Power</span>
                          <button
                            onClick={() => setSelectedSubCategory("all")}
                            className="hover:text-red-500 font-sans text-xs ml-1.5 leading-none focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {maxPriceFilter < dynamicMaxPrice && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <span>Max Price: Rs. {maxPriceFilter.toLocaleString()}</span>
                          <button
                            onClick={() => setMaxPriceFilter(dynamicMaxPrice)}
                            className="hover:text-red-500 font-sans text-xs ml-1.5 leading-none focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedBrand("all");
                          setSelectedSubCategory("all");
                          setMaxPriceFilter(35000);
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-[#ff8717] underline uppercase tracking-wider ml-1"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}

                  {/* Mobile horizontal pill filter sliders (Only visible on small/medium layouts) */}
                  <div className="lg:hidden flex flex-col gap-2.5 pt-2 bg-slate-50 p-3 rounded-lg border border-slate-100" id="mobile-horizontal-filters">
                    {/* Level 1: Circuit Type selector on Mobile */}
                    {availableSubCategories.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                          <span>1. Select Circuit Type</span>
                          {selectedSubCategory !== "all" && <span className="text-sky-600">⚡ {selectedSubCategory} Active</span>}
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                          <button
                            onClick={() => {
                              setSelectedSubCategory("all");
                              setSelectedBrand("all");
                            }}
                            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border transition-all ${
                              selectedSubCategory === "all"
                                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            All Circuits
                          </button>
                          {availableSubCategories.map((sub) => (
                            <button
                              key={sub}
                              onClick={() => {
                                setSelectedSubCategory(sub);
                                setSelectedBrand("all");
                              }}
                              className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border transition-all whitespace-nowrap ${
                                selectedSubCategory.toLowerCase() === sub.toLowerCase()
                                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              ⚡ {sub} Power
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Level 2: Brand selector on Mobile (Dynamically computed based on selected Circuit type if any) */}
                    {availableBrands.length > 0 && (
                      <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                          <span>2. Select Brand</span>
                          {selectedBrand !== "all" && <span className="text-[#ff8717]">★ {selectedBrand} Active</span>}
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                          <button
                            onClick={() => setSelectedBrand("all")}
                            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border transition-all ${
                              selectedBrand === "all"
                                ? "bg-[#ff8717] text-white border-[#ff8717] shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            All Brands
                          </button>
                          {/* Filter mobile available brands according to selected subcategory to maintain true hierarchy */}
                          {availableBrands.filter(b => {
                            if (selectedSubCategory === "all") return true;
                            // check if there's any product with this brand and selected subcategory
                            return products.some(p => {
                              const matchesCat = selectedCategorySlug === "all" || p.categoryId === activeCategoryId;
                              return matchesCat && p.brand?.toLowerCase() === b.toLowerCase() && p.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase();
                            });
                          }).map((b) => (
                            <button
                              key={b}
                              onClick={() => setSelectedBrand(b)}
                              className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border transition-all whitespace-nowrap ${
                                selectedBrand.toLowerCase() === b.toLowerCase()
                                  ? "bg-[#ff8717] text-white border-[#ff8717] shadow-sm"
                                  : "bg-white text-slate-600 border-[#ff8717]/30 hover:bg-slate-100"
                              }`}
                            >
                              ★ {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Level 3: Price Filter on Mobile */}
                    <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                        <span>3. Max Price Limit</span>
                        <span className="text-rose-600 font-mono font-bold">Rs. {maxPriceFilter.toLocaleString()}</span>
                      </span>
                      <div className="space-y-1.5 px-1 py-0.5">
                        <input
                          type="range"
                          min="1000"
                          max={dynamicMaxPrice}
                          step="500"
                          value={maxPriceFilter}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMaxPriceFilter(val);
                            if (activeView !== "home") {
                              setActiveView("home");
                            }
                          }}
                          className="w-full accent-[#ff8717] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                        />
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                          <button
                            onClick={() => {
                              setMaxPriceFilter(5000);
                              if (activeView !== "home") {
                                setActiveView("home");
                              }
                            }}
                            className={`px-3 py-1 text-[9px] font-black uppercase rounded-md border transition-all whitespace-nowrap ${
                              maxPriceFilter === 5000 ? "bg-[#ff8717] text-white border-[#ff8717]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            &lt; 5K
                          </button>
                          <button
                            onClick={() => {
                              setMaxPriceFilter(15000);
                              if (activeView !== "home") {
                                setActiveView("home");
                              }
                            }}
                            className={`px-3 py-1 text-[9px] font-black uppercase rounded-md border transition-all whitespace-nowrap ${
                              maxPriceFilter === 15000 ? "bg-[#ff8717] text-white border-[#ff8717]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            &lt; 15K
                          </button>
                          <button
                            onClick={() => {
                              setMaxPriceFilter(dynamicMaxPrice);
                              if (activeView !== "home") {
                                setActiveView("home");
                              }
                            }}
                            className={`px-3 py-1 text-[9px] font-black uppercase rounded-md border transition-all whitespace-nowrap ${
                              maxPriceFilter === dynamicMaxPrice ? "bg-[#ff8717] text-white border-[#ff8717]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Any Price
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 space-y-3 max-w-sm mx-auto">
                    <ShoppingBag className="w-12 h-12 text-slate-200 stroke-[1.5] mx-auto" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-700 text-xs">No listings found</h3>
                      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        We couldn't locate products matching your search context. Try adjusting filters or select another category from the mega-menu.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategorySlug("all");
                        setSearchQuery("");
                      }}
                      className="bg-[#ff8717] hover:bg-[#e06d00] text-white text-xs font-bold px-4 py-2 rounded-full transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="products-interactive-grid">
                    {filteredProducts.map((prod) => {
                      const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Smart Accessories";
                      return (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          categoryName={catName}
                          onSelect={setSelectedProduct}
                          onAddToCart={handleAddToCart}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      )}

      {/* FOOTER BLOCK (Matching NEPH) */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800" id="store-footer">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-display flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center border border-slate-700 shrink-0">
                <img src={nephLogo} alt="NEPH Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span>NEPH</span>
            </h4>
            <p className="leading-relaxed font-semibold">
              Numan Electric and Pneumatic House (NEPH) is Pakistan's leading engineering supplier of premium electric, electronic, and high-fidelity pneumatic equipment and components.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-display">Quick Menu</h4>
            <ul className="space-y-2 font-bold uppercase tracking-wider text-[10px]">
              <li><button onClick={() => { setSelectedCategorySlug("all"); setActiveView("home"); }} className="hover:text-[#ff8717] transition-colors">Browse Products</button></li>
              <li><button onClick={() => { setSelectedCategorySlug("smart-watches"); setActiveView("home"); }} className="hover:text-[#ff8717] transition-colors">Pneumatics</button></li>
              <li><button onClick={() => { setSelectedCategorySlug("wireless-earbuds"); setActiveView("home"); }} className="hover:text-[#ff8717] transition-colors">Electric Goods</button></li>
              <li><button onClick={() => setActiveView("admin")} className="text-[#ff8717] hover:underline transition-colors flex items-center gap-1"><span>Admin Console</span></button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-display">Customer Relations</h4>
            <ul className="space-y-2 font-semibold">
              <li className="hover:text-white transition-colors cursor-pointer">Cash on Delivery Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">7-Day Return and Exchange</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms and Conditions</li>
              <li className="hover:text-white transition-colors cursor-pointer">Shipping Coverage Zones</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-display">Contact Us</h4>
            <p className="leading-relaxed font-semibold">
              Phone Support: <span className="text-white font-bold">{banners?.contactInfo?.phone || "+92 300 1234567"}</span><br />
              Email: <span className="text-white font-bold">{banners?.contactInfo?.email || "support@neph.pk"}</span><br />
              Karachi Office: <span className="text-white font-bold">{banners?.contactInfo?.address || "Karachi, Pakistan"}</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-800 text-center font-bold text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 NEPH (Numan Electric and Pneumatic House). Built with maximum fidelity. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Karachi</span>
            <span>|</span>
            <span>Lahore</span>
            <span>|</span>
            <span>Islamabad</span>
            <span>|</span>
            <span>Faisalabad</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer element */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutClick={() => {
          setIsCartOpen(false);
          setActiveView("checkout");
        }}
      />

      {/* Detail modal popup element */}
      <ProductDetailModal
        product={selectedProduct}
        categoryName={selectedProduct ? (categories.find((c) => c.id === selectedProduct.categoryId)?.name || "Smart Accessory") : ""}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${(banners?.contactInfo?.phone || "+923000624021").replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba5a] transition-all duration-300 cursor-pointer group animate-whatsapp-blink"
        title="Chat with us on WhatsApp"
        id="whatsapp-floating-button"
      >
        <MessageCircle className="w-8 h-8 fill-white stroke-[#25D366]" />
        {/* Tooltip on hover */}
        <span className="absolute right-16 scale-0 transition-all duration-200 rounded bg-slate-900 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white group-hover:scale-100 whitespace-nowrap font-black shadow-lg">
          Chat on WhatsApp
        </span>
      </a>

      {/* Promotional Popup Ad */}
      {showPromoPopup && banners?.promoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-300 animate-fade-in" id="promo-popup-modal">
          <div className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col items-center">
            
            {/* Top Close Bar & Countdown overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
              <span className="bg-slate-900/80 text-white font-mono text-[9px] px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 font-black tracking-wider shadow-md">
                CLOSING IN <span className="text-[#ff8717]">{promoTimer}S</span>
              </span>
              <button
                onClick={() => setShowPromoPopup(false)}
                className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer font-bold text-sm"
                title="Close ad"
                id="close-promo-ad-btn"
              >
                ✕
              </button>
            </div>

            {/* Promo Image */}
            <div className="w-full relative bg-white flex items-center justify-center p-2 min-h-[300px]">
              <img
                src={banners.promoPopup.imageUrl}
                alt="Exclusive Promo"
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom info banner */}
            <div className="p-4 w-full text-center bg-slate-50 border-t border-slate-100 flex flex-col gap-1">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">🔥 EXCLUSIVE INDUSTRIAL OFFERS 🔥</h4>
              <p className="text-[10px] text-slate-500 font-bold">Contact us on WhatsApp for bulk discounts & customized quotes!</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Track Your Order Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fade-in text-slate-700" id="order-tracking-modal">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#ff8717]/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#ff8717]" />
                </div>
                <div>
                  <h3 className="font-extrabold font-display text-slate-900 text-base">Track Your Order</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NEPH.pk Consignment Tracker</p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-slate-500 flex items-center justify-center hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Tracker Form */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
                <label className="font-extrabold text-slate-850 text-xs block">
                  Enter your Order ID (Check SMS/Email)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. ORD-17181313"
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff8717]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const trimmed = trackOrderId.trim();
                      const found = orders.find(o => o.id.toLowerCase() === trimmed.toLowerCase());
                      setTrackedOrderResult(found || null);
                      setTrackSearched(true);
                    }}
                    className="bg-[#ff8717] hover:bg-[#d66500] text-white font-extrabold uppercase px-6 rounded-xl transition-all tracking-wider shadow-sm flex items-center gap-2 cursor-pointer text-xs font-bold"
                  >
                    <Search className="w-4 h-4" />
                    <span>Track</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">
                  Your Order ID can be found on your invoice receipt or checkout confirmation message.
                </p>
              </div>

              {/* Search Results */}
              {trackSearched && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {trackedOrderResult ? (
                    <div className="space-y-6">
                      
                      {/* Order Metadata summary */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Tracking Reference</p>
                          <p className="text-sm font-mono font-black text-slate-900">{trackedOrderResult.id}</p>
                          <p className="text-[10px] text-slate-500 font-bold">Placed on {new Date(trackedOrderResult.orderDate).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 sm:text-right">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Billing Amount</p>
                          <p className="text-sm font-mono font-black text-brand-green">Rs. {trackedOrderResult.totalAmount.toLocaleString()}</p>
                          <span className="inline-block bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                            {trackedOrderResult.paymentMethod || "COD"} Payment
                          </span>
                        </div>
                      </div>

                      {/* Status timeline stepper */}
                      {trackedOrderResult.status === "Cancelled" ? (
                        <div className="bg-red-50 border border-red-200/80 p-4 rounded-2xl flex items-center gap-3 text-red-800">
                          <X className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-xs">This order has been cancelled.</p>
                            <p className="text-[10px] text-red-600/90 font-bold">Please contact customer support at {banners?.contactInfo?.phone || "+92 300 1234567"} for re-processing.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-4">
                          <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#ff8717]" />
                            <span>Real-Time Logistics Route</span>
                          </p>

                          {/* Stepper logic */}
                          <div className="grid grid-cols-4 gap-2 relative pt-2">
                            {/* Connector line */}
                            <div className="absolute top-[22px] left-[12%] right-[12%] h-[2px] bg-slate-100 z-0">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{
                                  width: 
                                    trackedOrderResult.status === "Pending" ? "0%" :
                                    trackedOrderResult.status === "Processed" ? "33.3%" :
                                    trackedOrderResult.status === "Shipped" ? "66.6%" : "100%"
                                }}
                              />
                            </div>

                            {[
                              { label: "Pending", title: "Placed", desc: "Awaiting approval", statusCheck: ["Pending", "Processed", "Shipped", "Delivered"] },
                              { label: "Processed", title: "Approved", desc: "Packed & verified", statusCheck: ["Processed", "Shipped", "Delivered"] },
                              { label: "Shipped", title: "Shipped", desc: "Dispatched", statusCheck: ["Shipped", "Delivered"] },
                              { label: "Delivered", title: "Delivered", desc: "Completed", statusCheck: ["Delivered"] },
                            ].map((step, idx) => {
                              const isActive = step.statusCheck.includes(trackedOrderResult.status);
                              return (
                                <div key={idx} className="flex flex-col items-center text-center z-10 relative">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                                    isActive 
                                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200" 
                                      : "bg-white text-slate-300 border-slate-200"
                                  }`}>
                                    {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                  </div>
                                  <p className={`font-black uppercase tracking-wider mt-2 text-[9px] ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                                    {step.title}
                                  </p>
                                  <p className="text-[8px] text-slate-400 mt-0.5 font-bold leading-tight hidden sm:block">
                                    {step.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Courier Tracking Section */}
                      {trackedOrderResult.status !== "Cancelled" && (
                        <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl space-y-3">
                          <p className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                            <Truck className="w-4 h-4 text-[#ff8717]" />
                            <span>Courier Assignment & Tracking Information</span>
                          </p>

                          {trackedOrderResult.trackingNumber ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold bg-white p-4 rounded-xl border border-amber-200/50">
                              <div className="space-y-1 text-slate-700">
                                <span className="text-[10px] text-slate-450 uppercase tracking-wide block">Courier Partner</span>
                                <p className="text-slate-900 font-extrabold uppercase text-sm">{trackedOrderResult.trackingCompany}</p>
                              </div>
                              <div className="space-y-1 text-slate-700">
                                <span className="text-[10px] text-slate-450 uppercase tracking-wide block">Consignment / Tracking No.</span>
                                <div className="flex items-center gap-2">
                                  <p className="text-slate-900 font-mono font-black text-sm">{trackedOrderResult.trackingNumber}</p>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(trackedOrderResult.trackingNumber || "");
                                      triggerToast("Tracking number copied to clipboard!");
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest cursor-pointer font-bold"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <div className="sm:col-span-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-bold leading-relaxed">
                                💡 Use the assignment details above to trace your delivery dispatch route directly on the <span className="font-extrabold text-[#ff8717]">{trackedOrderResult.trackingCompany}</span> website.
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-xl border border-amber-200/50 text-slate-500 font-bold leading-relaxed text-[11px]">
                              ⏳ Your package is currently being packaged in our central warehouse. Once shipped, the consignment tracking ID and courier details (TCS, Leopards, etc.) will be assigned here.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Consignee details & Item summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Consignee */}
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 space-y-2.5 text-slate-700">
                          <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Delivery Destination</span>
                          </p>
                          <div className="space-y-1.5 font-bold leading-relaxed">
                            <p><span className="text-slate-400 font-bold">Consignee Name:</span> <span className="font-extrabold text-slate-900">{trackedOrderResult.customerName}</span></p>
                            <p><span className="text-slate-400 font-bold">Contact Phone:</span> <span className="font-mono text-slate-900">{trackedOrderResult.customerPhone}</span></p>
                            <p><span className="text-slate-400 font-bold">Address:</span> <span className="text-slate-700">{trackedOrderResult.customerAddress}, {trackedOrderResult.customerCity}</span></p>
                          </div>
                        </div>

                        {/* Items ordered */}
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 space-y-2.5 text-slate-700">
                          <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                            <span>Package Summary</span>
                          </p>
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {trackedOrderResult.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-slate-600 font-bold text-[11px] leading-tight py-1 border-b border-slate-50 last:border-0">
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-slate-850 line-clamp-1">{item.productTitle}</p>
                                  <p className="text-[9px] text-slate-400">Qty: {item.quantity} | Specs: {item.selectedSize || "Default"}</p>
                                </div>
                                <p className="font-mono text-slate-700 whitespace-nowrap">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl text-center space-y-2">
                      <p className="font-black text-sm">Order Reference Not Found</p>
                      <p className="text-[11px] text-rose-600 font-bold max-w-md mx-auto leading-relaxed">
                        We couldn't locate any COD order record matching <span className="font-mono font-extrabold bg-rose-100 px-1.5 py-0.5 rounded text-rose-900">"{trackOrderId}"</span>.
                        Please check if the Order ID has been entered correctly (including prefix, e.g. "ORD-...") or try again.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
