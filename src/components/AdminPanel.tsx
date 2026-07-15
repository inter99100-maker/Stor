import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, LayoutDashboard, FolderTree, Package, ShoppingCart, 
  Settings, LogOut, Plus, Edit, Trash2, CheckCircle2, TrendingUp, 
  AlertTriangle, Save, Loader2, RefreshCw, Eye, Gift, Truck,
  User, Calendar, DollarSign, Search, FileText, Printer, X, Percent, ChevronRight,
  Sparkles
} from "lucide-react";
import { Category, Product, Order, BannerSettings } from "../types";

interface AdminPanelProps {
  categories: Category[];
  products: Product[];
  orders: Order[];
  banners: BannerSettings | null;
  onRefreshData: () => void;
  onBackToStore: () => void;
}

export default function AdminPanel({
  categories,
  products,
  orders,
  banners,
  onRefreshData,
  onBackToStore
}: AdminPanelProps) {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Layout navigation state: supports full POS terminal tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "categories" | "products" | "orders" | "settings" | "pos-billing" | "pos-inventory" | "pos-credits" | "pos-reports" | "pos-expenses"
  >("dashboard");

  // POS Database States
  const [posTransactions, setPosTransactions] = useState<any[]>([]);
  const [posCustomers, setPosCustomers] = useState<any[]>([]);
  const [posExpenses, setPosExpenses] = useState<any[]>([]);
  const [posLoading, setPosLoading] = useState(false);

  // POS Billing Cart & Checkout States
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<"Cash" | "Credit" | "Card">("Cash");
  const [posSelectedCustomerId, setPosSelectedCustomerId] = useState<string>("");
  const [posCashReceived, setPosCashReceived] = useState<string>("");
  const [posSearchQuery, setPosSearchQuery] = useState("");
  const [posCustomerSearchQuery, setPosCustomerSearchQuery] = useState("");
  const [posLedgerCustomerSearchQuery, setPosLedgerCustomerSearchQuery] = useState("");
  const [posSelectedCategoryId, setPosSelectedCategoryId] = useState("");
  const [receiptModal, setReceiptModal] = useState<any | null>(null);

  // POS Manage Customer State
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [custPaymentAmount, setCustPaymentAmount] = useState("");
  const [custPaymentDesc, setCustPaymentDesc] = useState("");
  const [selectedCustForLedger, setSelectedCustForLedger] = useState<any | null>(null);

  // POS Expense State
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("Salary");
  const [expDate, setExpDate] = useState("");

  // POS Inventory Quick Update States
  const [quickStockUpdates, setQuickStockUpdates] = useState<{ [prodId: string]: string }>({});
  const [quickPriceUpdates, setQuickPriceUpdates] = useState<{ [prodId: string]: string }>({});

  // POS Billing Screen Quick Actions
  const [billingQuickEditProduct, setBillingQuickEditProduct] = useState<any | null>(null);
  const [billingQuickEditStock, setBillingQuickEditStock] = useState<string>("");
  const [billingQuickEditPrice, setBillingQuickEditPrice] = useState<string>("");
  const [billingQuickEditSalePrice, setBillingQuickEditSalePrice] = useState<string>("");
  const [billingQuickLedgerCustomer, setBillingQuickLedgerCustomer] = useState<any | null>(null);
  const [quickRecoveryAmount, setQuickRecoveryAmount] = useState("");
  const [quickRecoveryDesc, setQuickRecoveryDesc] = useState("");

  // POS Report Filters
  const [reportFilterInvoice, setReportFilterInvoice] = useState("");
  const [reportFilterDate, setReportFilterDate] = useState("");
  const [reportFilterCustomer, setReportFilterCustomer] = useState("");
  const [reportFilterItem, setReportFilterItem] = useState("");

  // CRUD & Form states
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Order Tracking Edits State
  const [orderTrackingEdits, setOrderTrackingEdits] = useState<Record<string, { trackingNumber: string; trackingCompany: string }>>({});

  // Category Form
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  // Product Form
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [productSku, setProductSku] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productRegularPrice, setProductRegularPrice] = useState("");
  const [productSalePrice, setProductSalePrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productSizes, setProductSizes] = useState("");
  const [productColors, setProductColors] = useState("");
  const [productIsFlash, setProductIsFlash] = useState(false);
  const [productFlashProgress, setProductFlashProgress] = useState("50");
  const [productMainImage, setProductMainImage] = useState("");
  const [productGalleryText, setProductGalleryText] = useState(""); // Comma separated
  const [productBrand, setProductBrand] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [productIsDraft, setProductIsDraft] = useState(false);

  // Bulk Product Import
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [bulkParsedProducts, setBulkParsedProducts] = useState<any[]>([]);
  const [bulkImportStatus, setBulkImportStatus] = useState<string>(""); // "", "parsed", "uploading", "success", "error"

  // Homepage / Banners Form
  const [heroSliders, setHeroSliders] = useState<any[]>(banners?.heroSliders || []);
  const [sideBanners, setSideBanners] = useState<any[]>(banners?.sideBanners || []);
  const [contactPhone, setContactPhone] = useState(banners?.contactInfo?.phone || "");
  const [contactEmail, setContactEmail] = useState(banners?.contactInfo?.email || "");
  const [contactAddress, setContactAddress] = useState(banners?.contactInfo?.address || "");

  // Announcement Marquee states
  const [announcementText, setAnnouncementText] = useState(banners?.announcementText || "Free delivery on orders above Rs. 5,000!");
  const [announcementSpeed, setAnnouncementSpeed] = useState<number>(banners?.announcementSpeed || 6);
  const [announcementDirection, setAnnouncementDirection] = useState<'left' | 'right'>(banners?.announcementDirection || 'right');

  // Promotional Popup settings state
  const [promoPopupEnabled, setPromoPopupEnabled] = useState(banners?.promoPopup?.enabled ?? true);
  const [promoPopupImage, setPromoPopupImage] = useState(banners?.promoPopup?.imageUrl || "");
  const [promoPopupTimer, setPromoPopupTimer] = useState<number | string>(banners?.promoPopup?.autoCloseSeconds || 10);

  // Flash Sale settings state
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(banners?.flashSaleEndTime || "");

  // ==========================================
  // 1. ADMIN LOGIN ACTION & POS DATA ENGINE
  // ==========================================
  const fetchPosData = async () => {
    setPosLoading(true);
    try {
      const res = await fetch("/api/pos/data");
      const data = await res.json();
      if (data.success) {
        setPosTransactions(data.transactions || []);
        setPosCustomers(data.customers || []);
        setPosExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error("Error loading POS data from database:", err);
    } finally {
      setPosLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
        // If logged in as POS, automatically navigate to POS Billing terminal
        if (username.toLowerCase() === "pos") {
          setActiveTab("pos-billing");
        } else {
          setActiveTab("dashboard");
        }
        
        // Refresh values on login
        if (banners) {
          setHeroSliders(banners.heroSliders || []);
          setSideBanners(banners.sideBanners || []);
          setContactPhone(banners.contactInfo?.phone || "");
          setContactEmail(banners.contactInfo?.email || "");
          setContactAddress(banners.contactInfo?.address || "");
          setPromoPopupEnabled(banners.promoPopup?.enabled ?? true);
          setPromoPopupImage(banners.promoPopup?.imageUrl || "");
          setPromoPopupTimer(banners.promoPopup?.autoCloseSeconds || 10);
          setAnnouncementText(banners.announcementText || "Free delivery on orders above Rs. 5,000!");
          setAnnouncementSpeed(banners.announcementSpeed || 6);
          setAnnouncementDirection(banners.announcementDirection || 'right');
          setFlashSaleEndTime(banners.flashSaleEndTime || "");
        }
        fetchPosData();
      } else {
        setLoginError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setLoginError("Failed to communicate with authentication server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (banners) {
      setHeroSliders(banners.heroSliders || []);
      setSideBanners(banners.sideBanners || []);
      setContactPhone(banners.contactInfo?.phone || "");
      setContactEmail(banners.contactInfo?.email || "");
      setContactAddress(banners.contactInfo?.address || "");
      setPromoPopupEnabled(banners.promoPopup?.enabled ?? true);
      setPromoPopupImage(banners.promoPopup?.imageUrl || "");
      setPromoPopupTimer(banners.promoPopup?.autoCloseSeconds || 10);
      setAnnouncementText(banners.announcementText || "Free delivery on orders above Rs. 5,000!");
      setAnnouncementSpeed(banners.announcementSpeed || 6);
      setAnnouncementDirection(banners.announcementDirection || 'right');
      setFlashSaleEndTime(banners.flashSaleEndTime || "");
    }
  }, [banners]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosData();
    }
  }, [isLoggedIn]);

  // ==========================================
  // 2. CATEGORY CRUD ACTIONS
  // ==========================================
  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryImage(cat.imageUrl);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategorySlug("");
    setCategoryImage("");
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionMessage("");

    try {
      const payload: any = {
        name: categoryName,
        slug: categorySlug.trim().toLowerCase().replace(/\s+/g, "-"),
        imageUrl: categoryImage
      };
      if (editingCategory) {
        payload.id = editingCategory.id;
      }

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        cancelEditCategory();
        onRefreshData();
        setActionMessage("Category saved successfully!");
      }
    } catch (err) {
      setActionMessage("Error saving category.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshData();
        setActionMessage("Category deleted.");
      }
    } catch (err) {
      setActionMessage("Error deleting category.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ==========================================
  // 3. PRODUCT CRUD ACTIONS
  // ==========================================
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductTitle(prod.title);
    setProductSku(prod.sku);
    setProductCategoryId(prod.categoryId);
    setProductRegularPrice(String(prod.regularPrice));
    setProductSalePrice(prod.salePrice ? String(prod.salePrice) : "");
    setProductStock(String(prod.stockCount));
    setProductDesc(prod.description);
    setProductSizes(prod.sizes);
    setProductColors(prod.colors);
    setProductIsFlash(prod.isFlashSale);
    setProductFlashProgress(String(prod.flashSaleProgress || 50));
    setProductMainImage(prod.imageUrl);
    setProductGalleryText(prod.gallery ? prod.gallery.join(",") : "");
    setProductBrand(prod.brand || "");
    setProductSubCategory(prod.subCategory || "");
    setProductIsDraft(prod.isDraft || false);
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
    setProductTitle("");
    setProductSku("");
    setProductCategoryId("");
    setProductRegularPrice("");
    setProductSalePrice("");
    setProductStock("");
    setProductDesc("");
    setProductSizes("");
    setProductColors("");
    setProductIsFlash(false);
    setProductFlashProgress("50");
    setProductMainImage("");
    setProductGalleryText("");
    setProductBrand("");
    setProductSubCategory("");
    setProductIsDraft(false);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionMessage("");

    try {
      const payload: any = {
        title: productTitle,
        sku: productSku,
        categoryId: productCategoryId,
        regularPrice: Number(productRegularPrice),
        salePrice: productSalePrice ? Number(productSalePrice) : null,
        stockCount: Number(productStock),
        description: productDesc,
        sizes: productSizes || "Standard",
        colors: productColors || "Standard",
        isFlashSale: productIsFlash,
        flashSaleProgress: Number(productFlashProgress),
        imageUrl: productMainImage,
        gallery: productGalleryText ? productGalleryText.split(",").map((g) => g.trim()) : [],
        brand: productBrand.trim(),
        subCategory: productSubCategory.trim(),
        isDraft: productIsDraft
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        cancelEditProduct();
        onRefreshData();
        setActionMessage("Product successfully updated.");
      }
    } catch (err) {
      setActionMessage("Error writing product.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ==========================================
  // BULK PRODUCT EXCEL/CSV IMPORT UTILITIES
  // ==========================================
  const downloadCsvTemplate = () => {
    const headers = [
      "title",
      "sku",
      "category",
      "regularPrice",
      "salePrice",
      "stockCount",
      "description",
      "brand",
      "subCategory",
      "imageUrl",
      "galleryUrls",
      "sizes",
      "colors",
      "isFlashSale"
    ];
    const rows = [
      [
        "ABB 40A Triple Pole MCB",
        "ABB-MCB-3P-40A",
        "Circuit Breakers",
        "4500",
        "3999",
        "50",
        "High quality ABB 40 Amps Triple Pole Miniature Circuit Breaker.",
        "ABB",
        "AC",
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        "",
        "Standard",
        "Grey",
        "FALSE"
      ],
      [
        "Schneider EasyPact 100A MCCB",
        "SCH-EZP-100A",
        "Circuit Breakers",
        "18500",
        "",
        "25",
        "Schneider EasyPact 100 Amps Molded Case Circuit Breaker.",
        "Schneider",
        "AC/DC",
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
        "",
        "Standard",
        "Black",
        "TRUE"
      ]
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ];
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "products_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsvText = (text: string) => {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentLine.push(currentField);
        currentField = "";
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField);
      lines.push(currentLine);
    }
    return lines;
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedData = parseCsvText(text);
        if (parsedData.length < 2) {
          alert("CSV is empty or missing data rows.");
          return;
        }

        const headers = parsedData[0].map(h => h.trim().toLowerCase());
        const productsToImport: any[] = [];

        for (let i = 1; i < parsedData.length; i++) {
          const row = parsedData[i];
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          const item: any = {};
          headers.forEach((header, index) => {
            const val = row[index] ? row[index].trim() : "";
            
            if (header.includes("title")) item.title = val;
            else if (header.includes("sku")) item.sku = val;
            else if (header.includes("sub") || header.includes("subcategory")) item.subCategory = val;
            else if (header.includes("category")) item.category = val;
            else if (header.includes("regular") || header === "price") item.regularPrice = Number(val) || 0;
            else if (header.includes("sale")) item.salePrice = val ? Number(val) : null;
            else if (header.includes("stock") || header.includes("count")) item.stockCount = Number(val) || 0;
            else if (header.includes("desc")) item.description = val;
            else if (header.includes("brand")) item.brand = val;
            else if (header.includes("image") && !header.includes("gallery")) item.imageUrl = val;
            else if (header.includes("gallery")) item.gallery = val ? val.split(",").map((g: string) => g.trim()) : [];
            else if (header.includes("sizes")) item.sizes = val;
            else if (header.includes("colors")) item.colors = val;
            else if (header.includes("flash")) item.isFlashSale = val.toLowerCase() === "true" || val === "1";
          });

          if (item.title || item.sku) {
            item.isDraft = true; // Default to draft
            productsToImport.push(item);
          }
        }

        setBulkParsedProducts(productsToImport);
        setBulkImportStatus("parsed");
      } catch (err) {
        console.error(err);
        alert("Failed to parse CSV file. Please verify formatting.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkParsedProducts.length === 0) return;
    setBulkImportStatus("uploading");

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: bulkParsedProducts })
      });
      const data = await res.json();
      if (data.success) {
        setBulkImportStatus("success");
        onRefreshData();
        setActionMessage(`Successfully imported ${data.count} draft products!`);
        setTimeout(() => {
          setIsBulkImportModalOpen(false);
          setBulkParsedProducts([]);
          setBulkImportStatus("");
        }, 1500);
      } else {
        setBulkImportStatus("error");
      }
    } catch (err) {
      console.error(err);
      setBulkImportStatus("error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshData();
        setActionMessage("Product removed.");
      }
    } catch (err) {
      setActionMessage("Error deleting product.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ==========================================
  // 4. ORDER CONTROL CENTER ACTIONS
  // ==========================================
  const handleOrderStatusUpdate = async (orderId: string, status?: string, trackingNumber?: string, trackingCompany?: string) => {
    setLoadingAction(true);
    try {
      const payload: any = {};
      if (status !== undefined) payload.status = status;
      if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
      if (trackingCompany !== undefined) payload.trackingCompany = trackingCompany;

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefreshData();
        setActionMessage(`Order #${orderId} successfully updated.`);
      }
    } catch (err) {
      setActionMessage("Error updating order tracking.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ==========================================
  // 5. BANNER / SETTINGS SUBMIT
  // ==========================================
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionMessage("");

    try {
      const payload = {
        heroSliders,
        sideBanners,
        contactInfo: {
          phone: contactPhone,
          email: contactEmail,
          address: contactAddress
        },
        promoPopup: {
          enabled: promoPopupEnabled,
          imageUrl: promoPopupImage,
          autoCloseSeconds: Math.max(3, Math.min(120, Number(promoPopupTimer) || 10))
        },
        announcementText,
        announcementSpeed: Number(announcementSpeed) || 15,
        announcementDirection,
        flashSaleEndTime
      };

      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        setActionMessage("Marketplace Banner Settings saved dynamically.");
      }
    } catch (err) {
      setActionMessage("Error writing settings.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateSliderUrl = (idx: number, field: string, val: string) => {
    const updated = heroSliders.map((slide, i) => {
      if (i === idx) {
        return { ...slide, [field]: val };
      }
      return slide;
    });
    setHeroSliders(updated);
  };

  const handleUpdateSideBannerField = (idx: number, field: string, val: string) => {
    const updated = sideBanners.map((side, i) => {
      if (i === idx) {
        return { ...side, [field]: val };
      }
      return side;
    });
    setSideBanners(updated);
  };

  // ==========================================
  // 6. POINT OF SALE (POS) ENGINE HANDLERS
  // ==========================================
  const handleAddToPosCart = (prod: Product) => {
    if (prod.stockCount <= 0) {
      alert("This product is Out of Stock!");
      return;
    }

    const existingIndex = posCart.findIndex((item) => item.productId === prod.id);
    if (existingIndex !== -1) {
      const currentQty = posCart[existingIndex].quantity;
      if (currentQty >= prod.stockCount) {
        alert(`Cannot add more. Only ${prod.stockCount} units available in stock.`);
        return;
      }
      const updated = [...posCart];
      updated[existingIndex].quantity += 1;
      setPosCart(updated);
    } else {
      const price = prod.salePrice ? prod.salePrice : prod.regularPrice;
      setPosCart([
        ...posCart,
        {
          productId: prod.id,
          productTitle: prod.title,
          sku: prod.sku,
          quantity: 1,
          price: price,
          stock: prod.stockCount
        }
      ]);
    }
  };

  const handleUpdatePosCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromPosCart(productId);
      return;
    }

    const updated = posCart.map((item) => {
      if (item.productId === productId) {
        if (newQty > item.stock) {
          alert(`Only ${item.stock} units available in stock.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setPosCart(updated);
  };

  const handleRemoveFromPosCart = (productId: string) => {
    setPosCart(posCart.filter((item) => item.productId !== productId));
  };

  // Place POS Sale checkout
  const handlePlacePosSale = async () => {
    if (posCart.length === 0) {
      alert("Your POS cart is empty!");
      return;
    }

    const cartSubtotal = posCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalAmount = Math.max(0, cartSubtotal - posDiscount);

    // Validate credit payment
    if (posPaymentMethod === "Credit") {
      if (!posSelectedCustomerId) {
        alert("Please select or register a Customer for Credit (Udhaari) payment!");
        return;
      }
    }

    const selectedCust = posCustomers.find((c) => c.id === posSelectedCustomerId);

    const payload = {
      items: posCart,
      totalAmount: finalAmount,
      discount: posDiscount,
      paymentMethod: posPaymentMethod,
      customerId: posSelectedCustomerId || null,
      customerName: selectedCust ? selectedCust.name : "Walk-in Customer",
      cashReceived: posPaymentMethod === "Cash" ? Number(posCashReceived || finalAmount) : null,
      changeGiven: posPaymentMethod === "Cash" ? Math.max(0, Number(posCashReceived || finalAmount) - finalAmount) : null
    };

    setLoadingAction(true);
    try {
      const res = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Show receipt modal
        setReceiptModal(data.transaction);
        // Refresh products and POS state
        onRefreshData();
        fetchPosData();
        // Reset POS Billing states
        setPosCart([]);
        setPosDiscount(0);
        setPosPaymentMethod("Cash");
        setPosSelectedCustomerId("");
        setPosCashReceived("");
        setActionMessage("POS Transaction successfully logged!");
      } else {
        alert(data.message || "Failed to log transaction.");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing POS transaction.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Create new POS customer for Udhaari ledger
  const handleCreatePosCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      alert("Please provide both name and phone number!");
      return;
    }

    setLoadingAction(true);
    try {
      const res = await fetch("/api/pos/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone })
      });
      const data = await res.json();
      if (data.success) {
        setNewCustName("");
        setNewCustPhone("");
        fetchPosData();
        setActionMessage(`Customer ${data.customer.name} registered successfully!`);
        // Auto select newly created customer
        setPosSelectedCustomerId(data.customer.id);
      }
    } catch (err) {
      console.error(err);
      alert("Error registering customer.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Submit payment/recovery for a customer credit account
  const handleCustomerPaymentSubmit = async (e: React.FormEvent, custId: string) => {
    e.preventDefault();
    const payAmt = Number(custPaymentAmount);
    if (!payAmt || payAmt <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/pos/customers/${custId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payAmt, description: custPaymentDesc || "Credit cleared" })
      });
      const data = await res.json();
      if (data.success) {
        setCustPaymentAmount("");
        setCustPaymentDesc("");
        // Reload POS Data
        fetchPosData();
        // If viewing ledger, update it
        if (selectedCustForLedger && selectedCustForLedger.id === custId) {
          setSelectedCustForLedger(data.customer);
        }
        setActionMessage("Udhaari recovery payment successfully recorded!");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging payment.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Expense/Salary Account Management
  const handleCreatePosExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expAmount);
    if (!expTitle || !amt || amt <= 0) {
      alert("Please fill in all details!");
      return;
    }

    setLoadingAction(true);
    try {
      const res = await fetch("/api/pos/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: expTitle,
          amount: amt,
          category: expCategory,
          date: expDate || new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setExpTitle("");
        setExpAmount("");
        setExpCategory("Salary");
        setExpDate("");
        fetchPosData();
        setActionMessage("Expense voucher successfully saved!");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding expense.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeletePosExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/pos/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosData();
        setActionMessage("Expense voucher deleted.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Quick product edits directly from Billing Terminal
  const handleBillingQuickProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingQuickEditProduct) return;
    
    setLoadingAction(true);
    try {
      const regP = Number(billingQuickEditPrice);
      const saleP = billingQuickEditSalePrice ? Number(billingQuickEditSalePrice) : null;
      const stock = Number(billingQuickEditStock);
      
      if (isNaN(regP) || regP <= 0) {
        alert("Invalid Regular Price!");
        return;
      }
      if (saleP !== null && (isNaN(saleP) || saleP <= 0)) {
        alert("Invalid Sale Price!");
        return;
      }
      if (isNaN(stock) || stock < 0) {
        alert("Invalid Stock Count!");
        return;
      }
      
      const payload = {
        ...billingQuickEditProduct,
        regularPrice: regP,
        salePrice: saleP,
        stockCount: stock
      };
      
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        setBillingQuickEditProduct(null);
        setActionMessage("Product stock & pricing successfully updated directly from Billing Terminal!");
      } else {
        alert(data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving quick product changes.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Quick recovery payment logging directly from Billing Terminal
  const handleBillingQuickCustomerPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingQuickLedgerCustomer) return;
    
    const amt = Number(quickRecoveryAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid payment amount!");
      return;
    }
    
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/pos/customers/${billingQuickLedgerCustomer.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          description: quickRecoveryDesc || "Cash recovery payment received"
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuickRecoveryAmount("");
        setQuickRecoveryDesc("");
        // Reload POS Data
        fetchPosData();
        // Update local state for modal
        setBillingQuickLedgerCustomer(data.customer);
        setActionMessage(`Successfully recorded PKR ${amt.toLocaleString()} payment for ${data.customer.name}!`);
      } else {
        alert(data.message || "Failed to record payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error recording payment.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Quick Stock Addition & Price Modification for easy physical store handling
  const handleQuickStockPriceSave = async (prodId: string, type: 'stock' | 'price', value: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setLoadingAction(true);
    try {
      const payload: any = { ...prod };
      if (type === 'stock') {
        const addedStock = Number(value);
        if (isNaN(addedStock) || addedStock < 0) {
          alert("Invalid stock number!");
          return;
        }
        payload.stockCount = prod.stockCount + addedStock;
      } else {
        const newPrice = Number(value);
        if (isNaN(newPrice) || newPrice <= 0) {
          alert("Invalid price number!");
          return;
        }
        payload.regularPrice = newPrice;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        // Clear quick update input
        if (type === 'stock') {
          setQuickStockUpdates({ ...quickStockUpdates, [prodId]: "" });
        } else {
          setQuickPriceUpdates({ ...quickPriceUpdates, [prodId]: "" });
        }
        setActionMessage(`${prod.title} updated successfully!`);
      }
    } catch (err) {
      console.error(err);
      alert("Error performing quick update.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ==========================================
  // CALCULATE ANALYTICS
  // ==========================================
  const salesPending = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const completedSales = orders
    .filter((o) => o.status === "Delivered")
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalOrders = orders.length;
  const activeProducts = products.length;
  const lowStockCount = products.filter((p) => p.stockCount <= 10).length;

  // ==========================================
  // GATE: RENDER ADMIN LOGIN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white" id="admin-login-screen">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-xl font-extrabold font-display tracking-tight text-white">NEPH.pk Admin Portal</h2>
            <p className="text-xs text-slate-400 font-bold">Authorized Personnel Only. Authenticate to Proceed.</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-bold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-bold text-slate-300">
            <div className="space-y-1.5">
              <label htmlFor="username">Admin Username</label>
              <input
                id="username"
                type="text"
                required
                placeholder="Default: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password">Security Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="Default: admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-slate-950 py-3.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Authenticate Session</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button onClick={onBackToStore} className="text-xs text-slate-400 hover:text-white underline transition-colors">
              Return to Marketplace Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans" id="admin-main-portal">
      {/* LEFT SIDEBAR PANEL */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col justify-between border-r border-slate-800" id="admin-sidebar">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black font-display text-white">NEPH Console</h2>
                <p className="text-[10px] text-slate-500 font-bold">NEPH.PK ADMIN v1.0</p>
              </div>
            </div>
            <button 
              onClick={onRefreshData} 
              className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
              title="Sync Database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1 text-xs font-bold uppercase tracking-wider" id="admin-navigation-list">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "dashboard" ? "bg-brand-orange text-slate-950 font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "categories" ? "bg-brand-orange text-slate-950 font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "products" ? "bg-brand-orange text-slate-950 font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "orders" ? "bg-brand-orange text-slate-950 font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders Control</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "settings" ? "bg-brand-orange text-slate-950 font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Homepage Slider</span>
            </button>

            <div className="pt-4 pb-1 px-4 border-t border-slate-800">
              <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase">POS Terminal</p>
            </div>

            <button
              onClick={() => setActiveTab("pos-billing")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pos-billing" ? "bg-emerald-600 text-white font-black shadow-md animate-pulse" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Billing Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab("pos-inventory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pos-inventory" ? "bg-emerald-600 text-white font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Inventory Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("pos-credits")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pos-credits" ? "bg-emerald-600 text-white font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Credit (Udhaari)</span>
            </button>

            <button
              onClick={() => setActiveTab("pos-reports")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pos-reports" ? "bg-emerald-600 text-white font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Sales Reports</span>
            </button>

            <button
              onClick={() => setActiveTab("pos-expenses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pos-expenses" ? "bg-emerald-600 text-white font-black shadow-md" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Expenses & Salary</span>
            </button>
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
          >
            <Eye className="w-4 h-4" />
            <span>Customer Store</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-red-900 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE MODULE */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen" id="admin-workspace">
        {/* POS Top Bar Sub-Navigation */}
        {activeTab.startsWith("pos-") && (
          <div className="mb-6 bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 shadow-lg flex flex-col xl:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-black font-display tracking-tight text-white uppercase">POS Terminal Workspace</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fast-access Store Operations Center</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
              <button
                onClick={() => setActiveTab("pos-billing")}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === "pos-billing" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Billing Terminal</span>
              </button>
              
              <button
                onClick={() => setActiveTab("pos-inventory")}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === "pos-inventory" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory Stock</span>
              </button>
              
              <button
                onClick={() => setActiveTab("pos-credits")}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === "pos-credits" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Credit Ledger</span>
              </button>
              
              <button
                onClick={() => setActiveTab("pos-expenses")}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === "pos-expenses" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Expense Book</span>
              </button>
              
              <button
                onClick={() => setActiveTab("pos-reports")}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === "pos-reports" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sales Reports</span>
              </button>
            </div>
          </div>
        )}

        {/* Header alert */}
        {actionMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="text-slate-400 hover:text-slate-900">✕</button>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-200" id="tab-dashboard">
            <div>
              <h1 className="text-2xl font-black font-display text-slate-900">Analytics Overview</h1>
              <p className="text-xs text-slate-500 font-bold mt-1">Real-time marketplace orders and store health metrics.</p>
            </div>

            {/* Widgets grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Widget: Sales volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Revenue (PKR)</p>
                  <p className="text-xl font-black text-slate-900 font-mono">Rs. {salesPending.toLocaleString()}</p>
                  <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Includes Pending COD
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Widget: Delivered Volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Delivered Cash</p>
                  <p className="text-xl font-black text-slate-900 font-mono">Rs. {completedSales.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Excludes pending order claims</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 text-brand-green flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Widget: Orders Volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Incoming Orders</p>
                  <p className="text-xl font-black text-slate-900 font-mono">{totalOrders}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{activeProducts} live items listed</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>

              {/* Widget: Low stock */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
                  <p className="text-xl font-black text-slate-900 font-mono">{lowStockCount}</p>
                  <p className="text-[9px] text-red-500 font-bold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Under 10 units
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Custom CSS Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart: Order claims status */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold font-display text-slate-800 text-sm">COD Fulfilment Delivery Pipeline</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Distribution of current order statuses.</p>
                </div>

                <div className="space-y-4 text-xs font-bold text-slate-500">
                  {["Pending", "Processed", "Shipped", "Delivered", "Cancelled"].map((stat) => {
                    const count = orders.filter((o) => o.status === stat).length;
                    const percent = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                    const barColor = 
                      stat === "Pending" ? "bg-amber-500" :
                      stat === "Processed" ? "bg-indigo-500" :
                      stat === "Shipped" ? "bg-blue-500" :
                      stat === "Delivered" ? "bg-emerald-500" : "bg-red-500";

                    return (
                      <div key={stat} className="space-y-1.5">
                        <div className="flex justify-between items-center text-slate-700">
                          <span>{stat} Claims</span>
                          <span className="font-mono text-slate-900">{count} orders ({Math.round(percent)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart: Low Stock quick lookup list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold font-display text-slate-800 text-sm">Critical Inventory Alert Index</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Products requiring immediate supplier replenishment.</p>
                </div>

                <div className="space-y-3.5 text-xs max-h-[240px] overflow-y-auto pr-2" id="low-stock-index">
                  {products.filter((p) => p.stockCount <= 15).length === 0 ? (
                    <p className="text-slate-400 font-medium py-6 text-center">All product inventory registers are safe.</p>
                  ) : (
                    products
                      .filter((p) => p.stockCount <= 15)
                      .sort((a, b) => a.stockCount - b.stockCount)
                      .map((prod) => (
                        <div key={prod.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
                          <div className="flex gap-2.5 items-center">
                            <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-semibold">{prod.sku}</span>
                            <span className="font-semibold text-slate-700 line-clamp-1 max-w-[160px]">{prod.title}</span>
                          </div>
                          <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-full ${
                            prod.stockCount === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                          }`}>
                            {prod.stockCount} left
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="space-y-8 animate-in fade-in duration-200" id="tab-categories">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black font-display text-slate-900">Product Categories</h1>
                <p className="text-xs text-slate-500 font-bold mt-1">Add, edit, or delete marketplace categories dynamically.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add/Edit Category Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm font-display">
                  {editingCategory ? "Update Category" : "Add New Category"}
                </h3>

                <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-bold text-slate-500">
                  <div className="space-y-1.5">
                    <label htmlFor="categoryName" className="uppercase tracking-wider">Category Name</label>
                    <input
                      id="categoryName"
                      type="text"
                      required
                      placeholder="e.g. Smart Watches"
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        if (!editingCategory) {
                          setCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="categorySlug" className="uppercase tracking-wider">Slug (Unique Path)</label>
                    <input
                      id="categorySlug"
                      type="text"
                      required
                      placeholder="e.g. smart-watches"
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-mono font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="categoryImage" className="uppercase tracking-wider">Icon Image URL (Optional)</label>
                    <input
                      id="categoryImage"
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={categoryImage}
                      onChange={(e) => setCategoryImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="flex-1 bg-brand-green hover:bg-brand-green-hover text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      {loadingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingCategory ? "Update" : "Save Category"}</span>
                    </button>
                    
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={cancelEditCategory}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-lg text-xs font-black uppercase"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Categories list table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="p-4 w-16">Preview</th>
                        <th className="p-4">Category Name</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200/50">
                              <img src={cat.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=150&q=80"} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{cat.name}</td>
                          <td className="p-4 font-mono text-slate-500">{cat.slug}</td>
                          <td className="p-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => startEditCategory(cat)}
                              className="bg-slate-100 hover:bg-brand-orange hover:text-slate-950 p-2 rounded-lg text-slate-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="bg-red-50 hover:bg-red-600 hover:text-white p-2 rounded-lg text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT MANAGEMENT */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-in fade-in duration-200" id="tab-products">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-100">
              <div>
                <h1 className="text-2xl font-black font-display text-slate-900">Products Catalog</h1>
                <p className="text-xs text-slate-500 font-bold mt-1">Manage active listings, prices, SKU references, inventory stock and variants.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>📥</span> Get Excel Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkImportModalOpen(true);
                    setBulkImportStatus("");
                    setBulkParsedProducts([]);
                  }}
                  className="bg-slate-950 hover:bg-slate-850 text-white py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>🚀</span> Bulk Excel Upload
                </button>
              </div>
            </div>

            {/* Combined form and list bento layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Product Form Side Panel */}
              <div className="xl:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm font-display">
                  {editingProduct ? "Edit Existing Product" : "Add Advanced Product"}
                </h3>

                <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-bold text-slate-500">
                  
                  {/* Title & SKU */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pTitle">Product Title</label>
                      <input
                        id="pTitle"
                        type="text"
                        required
                        placeholder="e.g. Smart Watch Ultra"
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pSku">SKU (Unique ID)</label>
                      <input
                        id="pSku"
                        type="text"
                        required
                        placeholder="e.g. SW-ULTRA"
                        value={productSku}
                        onChange={(e) => setProductSku(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-850 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Assignment & Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pCat">Category</label>
                      <select
                        id="pCat"
                        required
                        value={productCategoryId}
                        onChange={(e) => setProductCategoryId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      >
                        <option value="">Choose category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pStock">Stock Count</label>
                      <input
                        id="pStock"
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 50"
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-850 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pRegPrice">Regular Price (PKR)</label>
                      <input
                        id="pRegPrice"
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 4500"
                        value={productRegularPrice}
                        onChange={(e) => setProductRegularPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-850 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pSalePrice">Sale Price (Optional PKR)</label>
                      <input
                        id="pSalePrice"
                        type="number"
                        min="0"
                        placeholder="e.g. 2999"
                        value={productSalePrice}
                        onChange={(e) => setProductSalePrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-850 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Attributes (Sizes / Colors as lists) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pSizes">Size Tags (Comma separated)</label>
                      <input
                        id="pSizes"
                        type="text"
                        placeholder="e.g. M,L,XL or 49mm,45mm"
                        value={productSizes}
                        onChange={(e) => setProductSizes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pColors">Colors (Comma separated)</label>
                      <input
                        id="pColors"
                        type="text"
                        placeholder="e.g. Orange,Black,Silver"
                        value={productColors}
                        onChange={(e) => setProductColors(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Brand & Subcategory (e.g. AC/DC) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pBrand">Brand Name (e.g. Schneider)</label>
                      <input
                        id="pBrand"
                        type="text"
                        placeholder="e.g. Schneider, ABB, Terasaki"
                        value={productBrand}
                        onChange={(e) => setProductBrand(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pSubCat">Circuit / Sub-Category (e.g. AC/DC)</label>
                      <input
                        id="pSubCat"
                        type="text"
                        placeholder="e.g. AC, DC, AC/DC"
                        value={productSubCategory}
                        onChange={(e) => setProductSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Flash Sale triggers */}
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <input
                        id="pIsFlash"
                        type="checkbox"
                        checked={productIsFlash}
                        onChange={(e) => setProductIsFlash(e.target.checked)}
                        className="w-4 h-4 text-brand-green focus:ring-0 rounded"
                      />
                      <label htmlFor="pIsFlash" className="uppercase tracking-wider cursor-pointer">Include in Flash Sales</label>
                    </div>

                    {productIsFlash && (
                      <div className="space-y-1">
                        <label htmlFor="pFlashProg">Flash Stock progress bar remaining (%)</label>
                        <input
                          id="pFlashProg"
                          type="number"
                          min="0"
                          max="100"
                          value={productFlashProgress}
                          onChange={(e) => setProductFlashProgress(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-mono text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description Box */}
                  <div className="space-y-1.5">
                    <label htmlFor="pDesc">Product Description (Rich Content)</label>
                    <textarea
                      id="pDesc"
                      rows={3}
                      placeholder="Write high quality details..."
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  {/* Image Links (Main + Gallery) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pMainImg">Main Image URL (Optional)</label>
                      <input
                        id="pMainImg"
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={productMainImage}
                        onChange={(e) => setProductMainImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pGalleryText">Gallery Images (Comma separated)</label>
                      <input
                        id="pGalleryText"
                        type="text"
                        placeholder="URL1,URL2..."
                        value={productGalleryText}
                        onChange={(e) => setProductGalleryText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Draft Mode Toggle */}
                  <label className="flex items-start gap-2.5 p-3 bg-amber-50/40 border border-[#ff8717]/15 rounded-xl cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={productIsDraft}
                      onChange={(e) => setProductIsDraft(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#ff8717] focus:ring-[#ff8717]"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-850">Save as Draft Product</p>
                      <p className="text-[10px] text-slate-500 font-medium">Draft products are hidden from the store so you can publish them after verification.</p>
                    </div>
                  </label>

                  {/* Submission Row */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="flex-1 bg-brand-green hover:bg-brand-green-hover text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      {loadingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? "Update Product" : "Save Product Listing"}</span>
                    </button>
                    
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={cancelEditProduct}
                        className="bg-slate-150 hover:bg-slate-200 text-slate-700 py-3 px-5 rounded-lg text-xs font-black uppercase"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                </form>
              </div>

              {/* Product Inventory Table View */}
              <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="p-4 w-12">Image</th>
                        <th className="p-4">SKU / Item</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price (PKR)</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {products.map((p) => {
                        const cat = categories.find((c) => c.id === p.categoryId);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200/50 bg-slate-50">
                                <img src={p.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"} alt="" className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <p className="font-extrabold text-slate-900 leading-snug line-clamp-1">{p.title}</p>
                                <div className="flex flex-wrap items-center gap-1.5 font-bold text-[9px]">
                                  <span className="font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">SKU: {p.sku}</span>
                                  {p.brand && <span className="bg-amber-50 text-[#ff8717] px-1.5 py-0.5 rounded uppercase">★ {p.brand}</span>}
                                  {p.subCategory && <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded uppercase">⚡ {p.subCategory}</span>}
                                  {p.isDraft && <span className="bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-wider">DRAFT</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-500 font-semibold">{cat ? cat.name : "Unassigned"}</td>
                            <td className="p-4 font-mono font-bold text-slate-900">
                              {p.salePrice ? (
                                <div className="space-y-0.5">
                                  <p className="text-brand-green">Rs. {p.salePrice}</p>
                                  <p className="line-through text-[10px] text-slate-400 font-medium">Rs. {p.regularPrice}</p>
                                </div>
                              ) : (
                                <p>Rs. {p.regularPrice}</p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`font-mono px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                p.stockCount === 0 ? "bg-red-100 text-red-600" : (p.stockCount <= 10 ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600")
                              }`}>
                                {p.stockCount} left
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              {p.isDraft && (
                                <button
                                  onClick={async () => {
                                    setLoadingAction(true);
                                    try {
                                      const res = await fetch("/api/products", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ ...p, isDraft: false })
                                      });
                                      const d = await res.json();
                                      if (d.success) {
                                        onRefreshData();
                                        setActionMessage("Product published successfully!");
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    } finally {
                                      setLoadingAction(false);
                                    }
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg transition-all"
                                  title="Publish Live"
                                >
                                  Publish
                                </button>
                              )}
                              <button
                                onClick={() => startEditProduct(p)}
                                className="bg-slate-100 hover:bg-brand-orange hover:text-slate-950 p-2 rounded-lg text-slate-600 transition-colors"
                                title="Edit Item"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="bg-red-50 hover:bg-red-600 hover:text-white p-2 rounded-lg text-red-600 transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: ORDER CONTROL CENTER */}
        {activeTab === "orders" && (
          <div className="space-y-8 animate-in fade-in duration-200" id="tab-orders">
            <div>
              <h1 className="text-2xl font-black font-display text-slate-900">COD Orders Claims Manager</h1>
              <p className="text-xs text-slate-500 font-bold mt-1">Review active purchases, process packages, and adjust status levels to update inventory stock counts.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden" id="admin-orders-table">
              <div className="overflow-x-auto text-xs">
                {orders.length === 0 ? (
                  <p className="text-slate-400 font-medium py-12 text-center">No client orders placed yet.</p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Consignee Name</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4">Items Summary</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Courier & Tracking</th>
                        <th className="p-4 text-right">Actions / Transition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {orders.map((order) => {
                        const statusColor = 
                          order.status === "Pending" ? "bg-amber-100 text-amber-700" :
                          order.status === "Processed" ? "bg-indigo-100 text-indigo-700" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                          order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";

                        const orderDateFormatted = new Date(order.orderDate).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        });

                        return (
                          <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-900">{order.id}</td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="font-extrabold text-slate-900">{order.customerName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{orderDateFormatted}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5 font-mono">
                                <p>{order.customerPhone}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{order.customerEmail}</p>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800">{order.customerCity}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[150px]" title={order.customerAddress}>{order.customerAddress}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                {order.items.map((it, i) => (
                                  <div key={i} className="text-[10px] font-semibold text-slate-500 leading-none">
                                    {it.productTitle} x <span className="font-bold text-slate-800">{it.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 font-mono font-black text-brand-green">Rs. {order.totalAmount.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${statusColor}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 min-w-[180px]">
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Courier (e.g. TCS, Leopards)"
                                  value={orderTrackingEdits[order.id]?.trackingCompany ?? order.trackingCompany ?? ""}
                                  onChange={(e) => setOrderTrackingEdits(prev => ({
                                    ...prev,
                                    [order.id]: {
                                      trackingNumber: orderTrackingEdits[order.id]?.trackingNumber ?? order.trackingNumber ?? "",
                                      trackingCompany: e.target.value
                                    }
                                  }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-850 font-bold focus:outline-none focus:ring-1 focus:ring-brand-green"
                                />
                                <input
                                  type="text"
                                  placeholder="Tracking Number"
                                  value={orderTrackingEdits[order.id]?.trackingNumber ?? order.trackingNumber ?? ""}
                                  onChange={(e) => setOrderTrackingEdits(prev => ({
                                    ...prev,
                                    [order.id]: {
                                      trackingCompany: orderTrackingEdits[order.id]?.trackingCompany ?? order.trackingCompany ?? "",
                                      trackingNumber: e.target.value
                                    }
                                  }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-850 font-bold focus:outline-none focus:ring-1 focus:ring-brand-green"
                                />
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex flex-col gap-1.5 items-end">
                                {/* Status transitions selector */}
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green w-full max-w-[120px]"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processed">Processed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => {
                                    const edits = orderTrackingEdits[order.id];
                                    const tNumber = edits?.trackingNumber ?? order.trackingNumber ?? "";
                                    const tCompany = edits?.trackingCompany ?? order.trackingCompany ?? "";
                                    handleOrderStatusUpdate(order.id, order.status, tNumber, tCompany);
                                  }}
                                  className="bg-[#ff8717] hover:bg-[#d66500] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded transition-all tracking-wider shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>Save Info</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS / BANNER MANAGEMENT */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-200" id="tab-settings">
            <div>
              <h1 className="text-2xl font-black font-display text-slate-900">Store Settings & Slides</h1>
              <p className="text-xs text-slate-500 font-bold mt-1">Configure active homepage slider banners, side promotional banners, and contact settings.</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Homepage Hero sliders inputs */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-brand-orange" />
                    <span>Carousel Hero Slides (Cycle Banners)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Configure active sliding cards on customer homepage.</p>
                  <div className="mt-2 bg-amber-50 border border-amber-200/80 p-2.5 rounded-lg text-[10px] text-amber-800 font-bold leading-normal">
                    💡 Recommended Image Size: <span className="font-mono text-xs text-amber-900">1200 x 500 px</span> (Standard 2.4:1 Aspect Ratio) or <span className="font-mono text-xs text-amber-900">1920 x 800 px</span> for best visual quality.
                  </div>
                </div>

                {heroSliders.map((slide, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3.5 text-xs font-bold text-slate-500">
                    <p className="font-extrabold text-slate-900">Slider Slide #{idx + 1}</p>
                    <div className="space-y-1.5">
                      <label>Image URL (Optional)</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => handleUpdateSliderUrl(idx, "image", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label>Main Heading</label>
                        <input
                          type="text"
                          required
                          value={slide.title}
                          onChange={(e) => handleUpdateSliderUrl(idx, "title", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>Sub-text Caption</label>
                        <input
                          type="text"
                          required
                          value={slide.subtitle}
                          onChange={(e) => handleUpdateSliderUrl(idx, "subtitle", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo side banners & Contact settings */}
              <div className="space-y-8">
                {/* Promo side banners */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2 space-y-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-brand-orange" />
                        <span>Side Promotion Banners</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Configure static promotion banner images displayed to the right of the slider.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-[10px] text-slate-600 font-bold leading-relaxed space-y-1.5">
                      <div className="flex items-center gap-1 text-slate-800 font-black">
                        <span>💡 RECOMMENDED BANNER SIZE:</span>
                        <span className="font-mono text-[11px] text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded">16:10 Ratio</span>
                      </div>
                      <p>
                        For perfect alignment with the slider, generate images with an exact resolution of <span className="font-mono text-xs text-slate-900 font-black underline decoration-brand-orange decoration-2">800 x 500 px</span> (or <span className="font-mono text-xs text-slate-900 font-black">1600 x 1000 px</span>).
                      </p>
                      <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[9px] text-slate-400 font-normal select-all" title="Copy this prompt to use in Gemini/ChatGPT">
                        <span className="text-slate-500 font-black uppercase text-[8px] block mb-0.5">AI Prompt to copy:</span>
                        <span className="text-slate-800 font-semibold font-sans">"Generate a professional industrial electrical banner image with an aspect ratio of 16:10 and exact resolution 800x500 pixels"</span>
                      </div>
                    </div>
                  </div>

                  {sideBanners.map((side, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-150 bg-slate-50/40 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">SIDE BANNER #{idx + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                        <div className="space-y-1">
                          <label>Banner Image URL (Optional)</label>
                          <input
                            type="text"
                            value={side.image || ""}
                            onChange={(e) => handleUpdateSideBannerField(idx, "image", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-medium text-slate-850"
                            placeholder="https://example.com/image.png"
                          />
                        </div>

                        <div className="space-y-1">
                          <label>Fallback Link / Product ID</label>
                          <input
                            type="text"
                            value={side.link || ""}
                            onChange={(e) => handleUpdateSideBannerField(idx, "link", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-medium text-slate-850"
                            placeholder="#prod-id or #"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-brand-orange flex items-center gap-1">
                            <span>🔗 Linked Category (Priority Click Action)</span>
                          </label>
                          <select
                            value={side.categoryId || ""}
                            onChange={(e) => handleUpdateSideBannerField(idx, "categoryId", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#ff8717]"
                          >
                            <option value="">-- No Direct Category Link (Fallback link will trigger instead) --</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact information settings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-brand-orange" />
                      <span>Store Contact Coordinates</span>
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs font-bold text-slate-500">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="cPhone">Contact Support Hotline</label>
                        <input
                          id="cPhone"
                          type="text"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-850"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="cEmail">Official Store Email</label>
                        <input
                          id="cEmail"
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-850"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cAddr">Corporate Office / Karachi Hub Address</label>
                      <input
                        id="cAddr"
                        type="text"
                        required
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 font-medium text-slate-850"
                      />
                    </div>
                  </div>
                </div>

                {/* Homepage Promotion Popup Settings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-brand-orange" />
                        <span>Homepage Promotion Popup</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Show a timed announcement/offer image on front-end load.</p>
                    </div>
                    {/* Enable/Disable Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promoPopupEnabled}
                        onChange={(e) => setPromoPopupEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                      <span className="ml-2 text-xs font-black text-slate-600 uppercase">
                        {promoPopupEnabled ? "ENABLED" : "DISABLED"}
                      </span>
                    </label>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-[10px] text-slate-600 font-bold leading-relaxed space-y-1.5">
                    <div className="flex items-center gap-1 text-slate-800 font-black">
                      <span>💡 RECOMMENDED POPUP AD SIZE:</span>
                      <span className="font-mono text-[11px] text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded">1:1 Square</span>
                      <span className="text-slate-400 font-normal">or</span>
                      <span className="font-mono text-[11px] text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded">4:5 Vertical</span>
                    </div>
                    <p>
                      Since the popup centers in front of the screen, a square image of <span className="font-mono text-xs text-slate-900 font-black underline decoration-brand-orange decoration-2">800 x 800 px</span> or vertical image of <span className="font-mono text-xs text-slate-900 font-black">800 x 1000 px</span> works beautifully.
                    </p>
                    <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[9px] text-slate-400 font-normal select-all" title="Copy this prompt to use in Gemini/ChatGPT">
                      <span className="text-slate-500 font-black uppercase text-[8px] block mb-0.5">AI Prompt to copy:</span>
                      <span className="text-slate-800 font-semibold font-sans">"Generate a high-impact square advertisement poster image for an electric brand sale with an aspect ratio of 1:1 and resolution 800x800 pixels"</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-bold text-slate-500">
                    <div className="space-y-1.5">
                      <label htmlFor="promoImgUrl">Popup Image URL</label>
                      <input
                        id="promoImgUrl"
                        type="text"
                        required={promoPopupEnabled}
                        value={promoPopupImage}
                        onChange={(e) => setPromoPopupImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-850"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="promoTimerSec">Auto Close Timer (seconds)</label>
                      <div className="flex items-center gap-2">
                        <input
                          id="promoTimerSec"
                          type="number"
                          min="3"
                          max="120"
                          required={promoPopupEnabled}
                          value={promoPopupTimer}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPromoPopupTimer(val === "" ? "" : Number(val));
                          }}
                          onBlur={() => {
                            let parsed = Number(promoPopupTimer);
                            if (isNaN(parsed) || parsed < 3) {
                              setPromoPopupTimer(3);
                            } else if (parsed > 120) {
                              setPromoPopupTimer(120);
                            } else {
                              setPromoPopupTimer(parsed);
                            }
                          }}
                          className="w-32 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-850"
                        />
                        <span className="text-slate-450 font-bold text-[11px]">seconds (recommended: 10s)</span>
                      </div>
                    </div>

                    {promoPopupImage && (
                      <div className="pt-2">
                        <span className="block text-[10px] uppercase text-slate-400 font-black mb-1">Popup Banner Preview</span>
                        <div className="relative border border-slate-100 rounded-xl p-2 bg-slate-50/50 flex justify-center items-center max-h-[160px] overflow-hidden">
                          <img
                            src={promoPopupImage}
                            alt="Admin Preview"
                            className="max-h-[140px] rounded object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flash Sale Countdown Timer Settings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#ff8717]" />
                      <span>Flash Sale Countdown Timer Settings</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Define the exact target end date and time for the Flash Sale countdown.</p>
                  </div>

                  <div className="space-y-4 text-xs font-bold text-slate-500">
                    <div className="space-y-1.5">
                      <label htmlFor="flashSaleEndTime" className="uppercase tracking-wider">Select Flash Sale End Date & Time</label>
                      <input
                        id="flashSaleEndTime"
                        type="datetime-local"
                        required
                        value={flashSaleEndTime ? flashSaleEndTime.substring(0, 16) : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const date = new Date(val);
                            setFlashSaleEndTime(date.toISOString());
                          } else {
                            setFlashSaleEndTime("");
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#ff8717] focus:bg-white transition-all cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="uppercase tracking-wider text-slate-400 block">Quick Time Presets (relative to current time)</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date(Date.now() + 1 * 60 * 60 * 1000);
                            setFlashSaleEndTime(date.toISOString());
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ⚡ 1 Hour
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date(Date.now() + 4 * 60 * 60 * 1000);
                            setFlashSaleEndTime(date.toISOString());
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ⚡ 4 Hours
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date(Date.now() + 12 * 60 * 60 * 1000);
                            setFlashSaleEndTime(date.toISOString());
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ⚡ 12 Hours
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
                            setFlashSaleEndTime(date.toISOString());
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ⚡ 24 Hours (1 Day)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date(Date.now() + 72 * 60 * 60 * 1000);
                            setFlashSaleEndTime(date.toISOString());
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ⚡ 3 Days
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Bar Announcement Marquee Settings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-brand-orange" />
                      <span>Top Bar Scrolling Announcement (Marquee)</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Control the announcement message, its scroll direction, and speed.</p>
                  </div>

                  <div className="space-y-4 text-xs font-bold text-slate-500">
                    <div className="space-y-1.5">
                      <label htmlFor="announcementText" className="uppercase tracking-wider">Announcement Message</label>
                      <input
                        id="announcementText"
                        type="text"
                        required
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="e.g. Free delivery on orders above Rs. 5,000!"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="announcementSpeed" className="uppercase tracking-wider">Scroll Speed (lower is faster, recommended: 15-25)</label>
                        <div className="flex items-center gap-2">
                          <input
                            id="announcementSpeed"
                            type="number"
                            min="3"
                            max="60"
                            required
                            value={announcementSpeed}
                            onChange={(e) => setAnnouncementSpeed(Number(e.target.value) || 15)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-850"
                          />
                          <span className="text-slate-450 font-bold text-[10px] whitespace-nowrap">seconds / cycle</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="announcementDirection" className="uppercase tracking-wider">Scroll Direction</label>
                        <select
                          id="announcementDirection"
                          value={announcementDirection}
                          onChange={(e) => setAnnouncementDirection(e.target.value as 'left' | 'right')}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#ff8717]"
                        >
                          <option value="right">Left to Right (Default for Urdu/Arabic flow)</option>
                          <option value="left">Right to Left (Standard English flow)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big save triggers */}
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full bg-brand-green hover:bg-brand-green-hover text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  <span>Commit Dashboard Banner Configurations</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================== */}
        {/* POS TAB 1: BILLING TERMINAL (BILLING) */}
        {/* ========================================== */}
        {activeTab === "pos-billing" && (
          <div className="space-y-6" id="pos-billing-terminal">
            {/* Header Toolbar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div>
                <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <span>Point of Sale Billing Terminal</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Process instore customer purchases, calculate bills, & adjust stock counts.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchPosData}
                  disabled={posLoading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${posLoading ? 'animate-spin' : ''}`} />
                  <span>Sync POS DB</span>
                </button>
              </div>
            </div>

            {/* Main Billing Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Side: Products Catalog (8 Columns) */}
              <div className="xl:col-span-7 space-y-4">
                {/* Search & Category Filter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products by title, SKU, or brand..."
                      value={posSearchQuery}
                      onChange={(e) => setPosSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
                    />
                  </div>
                  <select
                    value={posSelectedCategoryId}
                    onChange={(e) => setPosSelectedCategoryId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products
                    .filter((prod) => {
                      const matchesSearch = 
                        prod.title.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                        prod.sku.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                        (prod.brand && prod.brand.toLowerCase().includes(posSearchQuery.toLowerCase()));
                      const matchesCategory = !posSelectedCategoryId || prod.categoryId === posSelectedCategoryId;
                      return matchesSearch && matchesCategory;
                    })
                    .map((prod) => {
                      const finalPrice = prod.salePrice ? prod.salePrice : prod.regularPrice;
                      const isLowStock = prod.stockCount > 0 && prod.stockCount <= 10;
                      const isOutOfStock = prod.stockCount <= 0;

                      return (
                        <div
                          key={prod.id}
                          onClick={() => !isOutOfStock && handleAddToPosCart(prod)}
                          className={`bg-white rounded-2xl p-3 border transition-all select-none cursor-pointer text-left flex flex-col justify-between ${
                            isOutOfStock 
                              ? 'border-red-100 opacity-60 bg-red-50/10 cursor-not-allowed' 
                              : 'border-slate-200/60 hover:border-emerald-500 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Product Image */}
                            <div className="aspect-square w-full rounded-xl bg-slate-50 overflow-hidden relative border border-slate-100">
                              <img
                                src={prod.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                  <span className="text-[9px] font-black uppercase text-white bg-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>
                                </div>
                              )}
                              {isLowStock && (
                                <div className="absolute top-1 right-1">
                                  <span className="text-[8px] font-black uppercase text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded shadow">Low Stock ({prod.stockCount})</span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-400 font-extrabold font-mono uppercase tracking-wider">{prod.sku}</p>
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 min-h-[32px]">{prod.title}</h4>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">PKR {finalPrice.toLocaleString()}</span>
                            <div className="flex items-center gap-1.5">
                              {!isOutOfStock && (
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                  Stock: {prod.stockCount}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBillingQuickEditProduct(prod);
                                  setBillingQuickEditStock(String(prod.stockCount));
                                  setBillingQuickEditPrice(String(prod.regularPrice));
                                  setBillingQuickEditSalePrice(prod.salePrice ? String(prod.salePrice) : "");
                                }}
                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-all"
                                title="Quick Edit Product Inventory"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Side: Cashier Bill Cart (5 Columns) */}
              <div className="xl:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span>Cashier Cart ({posCart.length} items)</span>
                    </h3>
                    {posCart.length > 0 && (
                      <button 
                        onClick={() => setPosCart([])}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {/* Cart Items List */}
                  {posCart.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">POS Cart is empty. Click catalog items to begin.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                      {posCart.map((item) => (
                        <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs font-bold text-slate-800">
                          <div className="flex-1 pr-2">
                            <h4 className="text-xs font-extrabold line-clamp-1">{item.productTitle}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">
                              SKU: {item.sku} | Price: PKR {item.price.toLocaleString()}
                            </p>
                          </div>
                          {/* Qty controller */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdatePosCartQty(item.productId, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-black hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdatePosCartQty(item.productId, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-black hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                          <div className="w-20 text-right font-mono text-slate-900 pr-1">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer Selector & Quick Creation */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <span className="block text-[10px] uppercase text-slate-400 font-black tracking-wider">Customer Information (Select for Udhaari / Ledger)</span>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search customer by name or mobile number..."
                          value={posCustomerSearchQuery}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPosCustomerSearchQuery(val);
                            if (val.trim().length >= 2) {
                              const q = val.toLowerCase();
                              const matched = posCustomers.find((c) => 
                                c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
                              );
                              if (matched) {
                                setPosSelectedCustomerId(matched.id);
                              }
                            } else if (val.trim().length === 0) {
                              setPosSelectedCustomerId("");
                            }
                          }}
                          className="pl-8 pr-3 py-1.5 w-full bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={posSelectedCustomerId}
                          onChange={(e) => setPosSelectedCustomerId(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 font-sans"
                        >
                          <option value="">Walk-in Customer (General / Cash)</option>
                          {posCustomers
                            .filter((c) => {
                              const q = posCustomerSearchQuery.toLowerCase();
                              return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
                            })
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.phone}) - Bal: PKR {(c.totalCredit || 0).toLocaleString()}
                              </option>
                            ))}
                        </select>

                        {posSelectedCustomerId && (
                          <button
                            type="button"
                            onClick={() => {
                              const selectedCust = posCustomers.find(c => c.id === posSelectedCustomerId);
                              if (selectedCust) {
                                setBillingQuickLedgerCustomer(selectedCust);
                              }
                            }}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Khata Ledger & Recovery Payment</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Register Form (Collapsible/Accordion style) */}
                    <details className="group border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <summary className="p-2 text-[10px] text-slate-500 font-black flex items-center justify-between cursor-pointer select-none">
                        <span>➕ REGISTER NEW CUSTOMER FOR CREDIT / UDHAAR</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-95" />
                      </summary>
                      <div className="p-3 border-t border-slate-150 space-y-2.5 bg-slate-50 text-xs font-bold text-slate-500">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label>Full Name</label>
                            <input
                              type="text"
                              value={newCustName}
                              onChange={(e) => setNewCustName(e.target.value)}
                              placeholder="e.g. Sajid Khan"
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label>Mobile No</label>
                            <input
                              type="text"
                              value={newCustPhone}
                              onChange={(e) => setNewCustPhone(e.target.value)}
                              placeholder="e.g. 03001234567"
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreatePosCustomer}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] py-1.5 rounded uppercase font-extrabold tracking-wider"
                        >
                          Save & Select Customer
                        </button>
                      </div>
                    </details>
                  </div>

                  {/* Billing Financial Calculations */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 font-bold text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Cart Subtotal</span>
                      <span className="font-mono">
                        PKR {posCart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Discount Input */}
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Flat Discount (PKR)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">PKR</span>
                        <input
                          type="number"
                          min="0"
                          value={posDiscount || ""}
                          onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                          placeholder="0"
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-mono text-slate-800 focus:outline-none focus:border-emerald-500 text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Payment Method</span>
                      <div className="flex gap-1">
                        {(["Cash", "Card", "Credit"] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPosPaymentMethod(method)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all border ${
                              posPaymentMethod === method 
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Net Payable block */}
                    {(() => {
                      const cartSub = posCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                      const netPay = Math.max(0, cartSub - posDiscount);
                      const currentSelectedCustomer = posCustomers.find(c => c.id === posSelectedCustomerId);

                      return (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between text-slate-900 text-sm font-black">
                            <span>NET PAYABLE</span>
                            <span className="font-mono text-emerald-700">PKR {netPay.toLocaleString()}</span>
                          </div>

                          {/* Cash change feedback */}
                          {posPaymentMethod === "Cash" && (
                            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-2">
                              <div className="flex justify-between items-center text-[11px] text-emerald-800 font-black">
                                <label className="font-black">CASH RECEIVED</label>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] text-emerald-600">PKR</span>
                                  <input
                                    type="number"
                                    value={posCashReceived || ""}
                                    onChange={(e) => setPosCashReceived(e.target.value)}
                                    placeholder={netPay.toString()}
                                    className="w-24 bg-white border border-emerald-200 rounded px-2 py-1 text-right font-mono text-emerald-900 focus:outline-none focus:border-emerald-600 font-bold"
                                  />
                                </div>
                              </div>
                              {Number(posCashReceived || netPay) >= netPay && (
                                <div className="flex justify-between items-center text-[11px] text-emerald-800 font-black">
                                  <span>CHANGE TO RETURN:</span>
                                  <span className="font-mono text-xs text-emerald-700 bg-white border border-emerald-100 px-2 py-0.5 rounded shadow-sm">
                                    PKR {(Number(posCashReceived || netPay) - netPay).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {posPaymentMethod === "Credit" && (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10px] font-bold text-amber-800 leading-relaxed space-y-1">
                              <p className="flex items-center gap-1 uppercase font-black">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>UDHAAR / CREDIT RECORD ALERT:</span>
                              </p>
                              <p>
                                This sale of PKR {netPay.toLocaleString()} will be automatically added to the outstanding balance of {currentSelectedCustomer ? currentSelectedCustomer.name : "the selected customer"} and logged in their khata ledger.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action buttons */}
                  <button
                    type="button"
                    onClick={handlePlacePosSale}
                    disabled={loadingAction || posCart.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
                  >
                    {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Complete Sale & Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK EDIT INVENTORY MODAL (STOCKS & PRICES) */}
            {billingQuickEditProduct && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 w-full max-w-md shadow-2xl space-y-4 text-xs font-bold text-slate-500 animate-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>Quick Inventory & Price Editor</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Modify stock level & selling prices directly</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBillingQuickEditProduct(null)}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase font-mono">Product: {billingQuickEditProduct.sku}</p>
                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{billingQuickEditProduct.title}</p>
                  </div>

                  <form onSubmit={handleBillingQuickProductSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label>Regular Price (PKR)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={billingQuickEditPrice}
                          onChange={(e) => setBillingQuickEditPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-bold font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label>Sale Price (PKR / Optional)</label>
                        <input
                          type="number"
                          min="0"
                          value={billingQuickEditSalePrice}
                          onChange={(e) => setBillingQuickEditSalePrice(e.target.value)}
                          placeholder="No discount price"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label>Current Stock Count</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={billingQuickEditStock}
                        onChange={(e) => setBillingQuickEditStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-bold font-mono"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBillingQuickEditProduct(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loadingAction}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs uppercase tracking-wider font-black flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {loadingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Update Stock</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* QUICK KHATA LEDGER & PAYMENTS RECOVERY MODAL */}
            {billingQuickLedgerCustomer && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 w-full max-w-2xl shadow-2xl space-y-4 text-xs font-bold text-slate-500 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>{billingQuickLedgerCustomer.name}'s Khata Ledger</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Manage customer credit (Udhaari) accounts & post recovery cash receipts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBillingQuickLedgerCustomer(null)}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer overview & Payment Recovery Form */}
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100/80 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-[10px] uppercase text-emerald-600 font-extrabold">Outstanding Balance</p>
                          <p className="text-xl font-black text-emerald-950 font-mono mt-0.5">PKR {(billingQuickLedgerCustomer.totalCredit || 0).toLocaleString()}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase font-black tracking-wider">
                          {(billingQuickLedgerCustomer.totalCredit || 0) > 0 ? "Credit Due" : "Clear"}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">Record Repayment Recovery</h4>
                        <form onSubmit={handleBillingQuickCustomerPaymentSubmit} className="space-y-3">
                          <div className="space-y-1">
                            <label>Recovery Cash Amount (PKR)</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={quickRecoveryAmount}
                              onChange={(e) => setQuickRecoveryAmount(e.target.value)}
                              placeholder="e.g. 5000"
                              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-bold font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label>Payment Description</label>
                            <input
                              type="text"
                              value={quickRecoveryDesc}
                              onChange={(e) => setQuickRecoveryDesc(e.target.value)}
                              placeholder="e.g. Cash payment on counter"
                              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-bold"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs uppercase font-black tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            {loadingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Receive & Record Cash</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Ledger History list */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">Ledger Statement History</h4>
                      
                      {!billingQuickLedgerCustomer.history || billingQuickLedgerCustomer.history.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-1">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs text-slate-400">No transactions recorded in this ledger yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto border border-slate-150 rounded-2xl bg-white p-3 space-y-1.5">
                          {billingQuickLedgerCustomer.history.map((row: any, i: number) => {
                            const isDebit = row.type === "credit_added" || row.type === "credit";
                            const dateFormatted = new Date(row.date).toLocaleString("en-US", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                            });
                            
                            return (
                              <div key={i} className="py-2 flex justify-between items-center text-[11px] font-bold">
                                <div>
                                  <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                                    isDebit ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                                  }`}>
                                    {isDebit ? "Credit (Udhaar)" : "Cash Recovery"}
                                  </span>
                                  <p className="text-slate-700 mt-1">{row.description}</p>
                                  <span className="text-[9px] text-slate-400 font-medium font-mono">{dateFormatted}</span>
                                </div>
                                <span className={`font-mono text-xs font-black ${isDebit ? 'text-red-500' : 'text-emerald-500'}`}>
                                  {isDebit ? '+' : '-'} PKR {row.amount.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setBillingQuickLedgerCustomer(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-colors"
                    >
                      Close Ledger View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* POS TAB 2: INVENTORY STOCK CONTROL */}
        {/* ========================================== */}
        {activeTab === "pos-inventory" && (
          <div className="space-y-6" id="pos-inventory-panel">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>POS Stock & Price Manager</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Rapidly add bulk stock and change selling prices directly in a single click.</p>
              </div>
              <div className="flex gap-2 text-xs font-bold text-slate-500">
                <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-center shadow-sm">
                  <p className="text-[10px] uppercase text-emerald-600">Total Store SKUs</p>
                  <p className="text-base font-black text-emerald-950 font-mono mt-0.5">{products.length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-center shadow-sm">
                  <p className="text-[10px] uppercase text-amber-600">Low Stock SKUs</p>
                  <p className="text-base font-black text-amber-950 font-mono mt-0.5">
                    {products.filter(p => p.stockCount <= 10).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stock manager table */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter products to add stock..."
                    value={posSearchQuery}
                    onChange={(e) => setPosSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-slate-700 font-medium">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="p-4">SKU Code</th>
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Original Price</th>
                      <th className="p-4">Current Stock</th>
                      <th className="p-4">Quick Add Stock</th>
                      <th className="p-4 text-right">Edit Selling Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold">
                    {products
                      .filter((p) => 
                        p.title.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(posSearchQuery.toLowerCase())
                      )
                      .map((p) => {
                        const isLow = p.stockCount <= 10;
                        const isOut = p.stockCount <= 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-extrabold text-slate-900">{p.sku}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.imageUrl} alt={p.title} className="w-9 h-9 object-cover rounded-lg border border-slate-150 shrink-0" referrerPolicy="no-referrer" />
                                <div>
                                  <h4 className="font-extrabold text-slate-900 leading-tight max-w-[220px] line-clamp-2">{p.title}</h4>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mt-0.5">{p.brand || "Unbranded"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono">
                              PKR {p.regularPrice.toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                isOut 
                                  ? "bg-red-100 text-red-700" 
                                  : isLow 
                                  ? "bg-amber-100 text-amber-700 animate-pulse" 
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {isOut ? "OUT OF STOCK" : `${p.stockCount} UNITS`}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="+ qty"
                                  value={quickStockUpdates[p.id] || ""}
                                  onChange={(e) => setQuickStockUpdates({ ...quickStockUpdates, [p.id]: e.target.value })}
                                  className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center font-mono text-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = quickStockUpdates[p.id];
                                    if (!val) return;
                                    handleQuickStockPriceSave(p.id, "stock", val);
                                  }}
                                  className="bg-slate-800 hover:bg-slate-950 text-white font-extrabold px-2 py-1 rounded text-[11px]"
                                >
                                  ADD
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-[10px] text-slate-400 font-mono">PKR</span>
                                <input
                                  type="number"
                                  placeholder={p.regularPrice.toString()}
                                  value={quickPriceUpdates[p.id] || ""}
                                  onChange={(e) => setQuickPriceUpdates({ ...quickPriceUpdates, [p.id]: e.target.value })}
                                  className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-mono text-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = quickPriceUpdates[p.id];
                                    if (!val) return;
                                    handleQuickStockPriceSave(p.id, "price", val);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded text-[11px]"
                                >
                                  SAVE
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* POS TAB 3: CREDIT (UDHAARI) LEDGER */}
        {/* ========================================== */}
        {activeTab === "pos-credits" && (
          <div className="space-y-6" id="pos-credits-ledger">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-600" />
                  <span>Instore Credit Ledger (Udhaar Khata)</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Maintain customer ledger accounts, track outstanding debits, & register cash recovery payments.</p>
              </div>
              <div className="bg-red-50 border border-red-100 px-5 py-2 rounded-xl text-center shadow-sm">
                <p className="text-[10px] uppercase text-red-600 font-extrabold">Total Store Udhaar Outstanding</p>
                <p className="text-lg font-black text-red-950 font-mono mt-0.5">
                  PKR {posCustomers.reduce((acc, c) => acc + (c.totalCredit || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Content Split: Customers list & selected ledger history */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Customers list (5 columns) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">Credit Profiles</h3>
                
                {/* Search Customer Ledger */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search profile by name or phone..."
                    value={posLedgerCustomerSearchQuery}
                    onChange={(e) => setPosLedgerCustomerSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {posCustomers
                    .filter((cust) => {
                      const q = posLedgerCustomerSearchQuery.toLowerCase();
                      return cust.name.toLowerCase().includes(q) || cust.phone.toLowerCase().includes(q);
                    })
                    .map((cust) => {
                    const isSelected = selectedCustForLedger?.id === cust.id;

                    return (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustForLedger(cust)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs font-bold text-slate-800 ${
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>{cust.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Phone: {cust.phone}</p>
                          </div>
                          <span className={`font-mono text-sm font-black ${(cust.totalCredit || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            PKR {(cust.totalCredit || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Customer Khata Details (7 columns) */}
              <div className="lg:col-span-7 space-y-4">
                {selectedCustForLedger ? (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-slate-900 text-base">{selectedCustForLedger.name} Ledger</h3>
                        <p className="text-[11px] text-slate-400 font-bold font-mono">Profile ID: {selectedCustForLedger.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-slate-400 font-extrabold">Current Khata Balance</p>
                        <p className="font-mono text-xl font-black text-red-600">PKR {(selectedCustForLedger.totalCredit || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Record Cash Recovery Payment Form */}
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs uppercase text-emerald-800 font-black tracking-wider">Log Cash Recovery Payment</h4>
                      <form onSubmit={(e) => handleCustomerPaymentSubmit(e, selectedCustForLedger.id)} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-bold text-slate-500">
                        <div className="sm:col-span-4 space-y-1">
                          <label>Recovery Amount</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={custPaymentAmount}
                            onChange={(e) => setCustPaymentAmount(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full bg-white border border-emerald-200 rounded-lg p-2 font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div className="sm:col-span-5 space-y-1">
                          <label>Description / Receipt Details</label>
                          <input
                            type="text"
                            value={custPaymentDesc}
                            onChange={(e) => setCustPaymentDesc(e.target.value)}
                            placeholder="e.g. Received partial cash by hand"
                            className="w-full bg-white border border-emerald-200 rounded-lg p-2 font-semibold text-slate-800"
                          />
                        </div>
                        <div className="sm:col-span-3 flex items-end">
                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg text-xs font-black uppercase tracking-wider shadow"
                          >
                            Save Recovery
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Khata History Ledger Transactions */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase text-slate-400 font-black tracking-wider">Khata History Ledger Rows</h4>
                      
                      {(!selectedCustForLedger.history || selectedCustForLedger.history.length === 0) ? (
                        <p className="text-xs font-bold text-slate-400 py-6 text-center bg-slate-50 rounded-xl">No historical ledger records found for this profile.</p>
                      ) : (
                        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto border border-slate-100 rounded-xl">
                          {selectedCustForLedger.history.map((row: any, i: number) => {
                            const isDebit = row.type === "credit_added" || row.type === "credit"; // udhaar added
                            const dateFormatted = new Date(row.date).toLocaleString("en-US", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                            });

                            return (
                              <div key={i} className="p-3 bg-slate-50/40 flex items-center justify-between text-xs font-bold">
                                <div className="space-y-0.5">
                                  <p className="text-slate-800 font-extrabold">{row.description}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{dateFormatted}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`font-mono text-sm font-black ${isDebit ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {isDebit ? `+ PKR ${row.amount.toLocaleString()}` : `- PKR ${row.amount.toLocaleString()}`}
                                  </span>
                                  <p className="text-[9px] text-slate-400 font-semibold">{isDebit ? "Udhaar Added" : "Payment Recv"}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center space-y-2 py-24">
                    <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-black text-slate-800">No Profile Selected</h3>
                    <p className="text-xs text-slate-400 font-semibold">Select a customer profile from the left sidebar list to review credit statement logs.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* POS TAB 4: SALES REPORTS & METRICS */}
        {/* ========================================== */}
        {activeTab === "pos-reports" && (
          <div className="space-y-6" id="pos-reports-dashboard">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>POS Sales & Profitability Reports</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Evaluate physical store metrics, calculate gross sales, and deduct recorded expenses in real-time.</p>
              </div>
              <button
                onClick={fetchPosData}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Financials</span>
              </button>
            </div>

            {/* Dynamic reports calculation card grid */}
            {(() => {
              const now = new Date();
              const todayStr = now.toDateString();
              const thisMonthStr = now.toLocaleString("en-US", { month: "long", year: "numeric" });
              const thisYearStr = now.getFullYear().toString();

              // Gross sales
              const salesToday = posTransactions
                .filter(t => new Date(t.date).toDateString() === todayStr)
                .reduce((acc, t) => acc + t.totalAmount, 0);

              const salesMonth = posTransactions
                .filter(t => {
                  const d = new Date(t.date);
                  return d.toLocaleString("en-US", { month: "long", year: "numeric" }) === thisMonthStr;
                })
                .reduce((acc, t) => acc + t.totalAmount, 0);

              const salesYear = posTransactions
                .filter(t => new Date(t.date).getFullYear().toString() === thisYearStr)
                .reduce((acc, t) => acc + t.totalAmount, 0);

              const salesTotalRevenue = posTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
              const totalExpenses = posExpenses.reduce((acc, e) => acc + e.amount, 0);
              const netProfit = salesTotalRevenue - totalExpenses;

              return (
                <div className="space-y-6">
                  {/* Financial Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Today's POS Sales</p>
                      <p className="text-lg font-black text-emerald-600 font-mono mt-1.5">PKR {salesToday.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Gross Instore Cash Today</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">This Month Sales</p>
                      <p className="text-lg font-black text-indigo-600 font-mono mt-1.5">PKR {salesMonth.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">{thisMonthStr}</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">This Year Sales</p>
                      <p className="text-lg font-black text-blue-600 font-mono mt-1.5">PKR {salesYear.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Calendar Year {thisYearStr}</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Shop Expenses</p>
                      <p className="text-lg font-black text-red-500 font-mono mt-1.5">PKR {totalExpenses.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Rent, Salaries, Bills, etc.</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Net Profit Ledger</p>
                      <p className={`text-lg font-black font-mono mt-1.5 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        PKR {netProfit.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Revenue minus Expenses</p>
                    </div>
                  </div>

                  {/* Transaction Log List */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      {(() => {
                        const filteredCount = [...posTransactions].filter((trans) => {
                          if (reportFilterInvoice.trim() && !trans.id.toLowerCase().includes(reportFilterInvoice.toLowerCase())) return false;
                          if (reportFilterCustomer.trim() && !(trans.customerName || "Walk-in Customer").toLowerCase().includes(reportFilterCustomer.toLowerCase())) return false;
                          if (reportFilterItem.trim()) {
                            const q = reportFilterItem.toLowerCase();
                            const hasItem = trans.items.some((it: any) => 
                              it.productTitle.toLowerCase().includes(q) || 
                              (it.sku && it.sku.toLowerCase().includes(q))
                            );
                            if (!hasItem) return false;
                          }
                          if (reportFilterDate) {
                            const dObj = new Date(trans.date);
                            const y = dObj.getFullYear();
                            const m = String(dObj.getMonth() + 1).padStart(2, "0");
                            const d = String(dObj.getDate()).padStart(2, "0");
                            const dateStr = `${y}-${m}-${d}`;
                            if (dateStr !== reportFilterDate) return false;
                          }
                          return true;
                        }).length;

                        return (
                          <div className="flex-1">
                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                              POS Daily Transaction History logs ({filteredCount} of {posTransactions.length} sales shown)
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Click any transaction row to open/print the original invoice receipt</p>
                          </div>
                        );
                      })()}

                      {(reportFilterInvoice || reportFilterDate || reportFilterCustomer || reportFilterItem) && (
                        <button
                          onClick={() => {
                            setReportFilterInvoice("");
                            setReportFilterDate("");
                            setReportFilterCustomer("");
                            setReportFilterItem("");
                          }}
                          className="text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider font-extrabold transition-all border border-red-150"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>

                    {/* Live Search & Filters Panel */}
                    <div className="p-5 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs font-bold text-slate-500">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                          <Search className="w-3.5 h-3.5 text-slate-450" />
                          <span>Search Invoice ID</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Search Invoice ID (e.g. TR-)..."
                          value={reportFilterInvoice}
                          onChange={(e) => setReportFilterInvoice(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                          <Calendar className="w-3.5 h-3.5 text-slate-450" />
                          <span>Filter by Date</span>
                        </label>
                        <input
                          type="date"
                          value={reportFilterDate}
                          onChange={(e) => setReportFilterDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500 shadow-sm font-sans"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                          <User className="w-3.5 h-3.5 text-slate-450" />
                          <span>Customer Name</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Search customer name..."
                          value={reportFilterCustomer}
                          onChange={(e) => setReportFilterCustomer(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                          <Package className="w-3.5 h-3.5 text-slate-450" />
                          <span>Purchased Item / SKU</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Search item name or SKU..."
                          value={reportFilterItem}
                          onChange={(e) => setReportFilterItem(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {(() => {
                      const filtered = [...posTransactions].filter((trans) => {
                        if (reportFilterInvoice.trim() && !trans.id.toLowerCase().includes(reportFilterInvoice.toLowerCase())) return false;
                        if (reportFilterCustomer.trim() && !(trans.customerName || "Walk-in Customer").toLowerCase().includes(reportFilterCustomer.toLowerCase())) return false;
                        if (reportFilterItem.trim()) {
                          const q = reportFilterItem.toLowerCase();
                          const hasItem = trans.items.some((it: any) => 
                            it.productTitle.toLowerCase().includes(q) || 
                            (it.sku && it.sku.toLowerCase().includes(q))
                          );
                          if (!hasItem) return false;
                        }
                        if (reportFilterDate) {
                          const dObj = new Date(trans.date);
                          const y = dObj.getFullYear();
                          const m = String(dObj.getMonth() + 1).padStart(2, "0");
                          const d = String(dObj.getDate()).padStart(2, "0");
                          const dateStr = `${y}-${m}-${d}`;
                          if (dateStr !== reportFilterDate) return false;
                        }
                        return true;
                      }).reverse();

                      if (filtered.length === 0) {
                        return (
                          <div className="py-16 text-center space-y-2">
                            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No matching transactions found</p>
                            <p className="text-[10px] text-slate-400 font-semibold max-w-xs mx-auto">Try clearing your filters or type a different query to find recorded sales invoices.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-slate-700 font-medium text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                                <th className="p-4">Invoice ID</th>
                                <th className="p-4">Time & Date</th>
                                <th className="p-4">Customer Name</th>
                                <th className="p-4">Payment Method</th>
                                <th className="p-4">Items Summary</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4 text-right">Net Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                              {filtered.map((trans) => {
                                const transDateFormatted = new Date(trans.date).toLocaleString("en-US", {
                                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                });

                                return (
                                  <tr 
                                    key={trans.id} 
                                    onClick={() => setReceiptModal(trans)}
                                    className="hover:bg-slate-50/80 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-emerald-500 group"
                                    title="Click to view full Invoice/Receipt"
                                  >
                                    <td className="p-4 font-mono font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                      <div className="flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                                        <span>{trans.id}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 text-slate-500 font-semibold">{transDateFormatted}</td>
                                    <td className="p-4 text-slate-900 font-extrabold">{trans.customerName || "Walk-in Customer"}</td>
                                    <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                        trans.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-850' :
                                        trans.paymentMethod === 'Card' ? 'bg-blue-100 text-blue-850' : 'bg-red-100 text-red-755'
                                      }`}>
                                        {trans.paymentMethod}
                                      </span>
                                    </td>
                                    <td className="p-4 text-slate-500 font-semibold">
                                      {trans.items.map((it: any, i: number) => (
                                        <div key={i} className="text-[10px] leading-tight font-medium text-slate-600">
                                          • {it.productTitle} <span className="font-bold text-slate-800">x{it.quantity}</span>
                                        </div>
                                      ))}
                                    </td>
                                    <td className="p-4 font-mono text-slate-450">
                                      {trans.discount > 0 ? `PKR ${trans.discount.toLocaleString()}` : "-"}
                                    </td>
                                    <td className="p-4 text-right font-mono text-slate-900 font-black">
                                      PKR {trans.totalAmount.toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================== */}
        {/* POS TAB 5: SALARIES & EXPENSES */}
        {/* ========================================== */}
        {activeTab === "pos-expenses" && (
          <div className="space-y-6" id="pos-expenses-registry">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Instore Expenses & Salaries</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Register staff salaries, utility payments, store rent, and custom cash payouts.</p>
              </div>
              <div className="bg-red-50 border border-red-100 px-5 py-2 rounded-xl text-center shadow-sm">
                <p className="text-[10px] uppercase text-red-600 font-extrabold">Total Expenses logged</p>
                <p className="text-lg font-black text-red-950 font-mono mt-0.5">
                  PKR {posExpenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Form (5 columns) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">Log Expense Voucher</h3>
                
                <form onSubmit={handleCreatePosExpense} className="space-y-4 text-xs font-bold text-slate-500">
                  <div className="space-y-1.5">
                    <label htmlFor="expTitleInput">Voucher Title / Recipient</label>
                    <input
                      id="expTitleInput"
                      type="text"
                      required
                      placeholder="e.g. Electric bill June, Sajid salary"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-850 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="expAmtInput">Amount (PKR)</label>
                    <input
                      id="expAmtInput"
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5000"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-mono font-medium text-slate-850 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="expCatSelect">Expense Category</label>
                    <select
                      id="expCatSelect"
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-700 font-bold focus:outline-none"
                    >
                      <option value="Salary">Staff Salary</option>
                      <option value="Rent">Shop Rent</option>
                      <option value="Utility">Utility Bills</option>
                      <option value="Stock Purchase">Stock Purchase</option>
                      <option value="Other">Other Payouts</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="expDateInput">Voucher Date</label>
                    <input
                      id="expDateInput"
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-medium text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="w-full bg-slate-800 hover:bg-slate-950 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Record Expense Voucher</span>
                  </button>
                </form>
              </div>

              {/* Right List (7 columns) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">Expenses Log Ledger</h3>
                
                {posExpenses.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold">No expenses logged in database yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-slate-700 font-medium text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                          <th className="p-3">Date</th>
                          <th className="p-3">Expense Voucher</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                        {[...posExpenses].reverse().map((exp) => {
                          const dateF = new Date(exp.date).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          });

                          return (
                            <tr key={exp.id} className="hover:bg-slate-50/50">
                              <td className="p-3 text-slate-450">{dateF}</td>
                              <td className="p-3">{exp.title}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700">
                                  {exp.category}
                                </span>
                              </td>
                              <td className="p-3 font-mono">PKR {exp.amount.toLocaleString()}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePosExpense(exp.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL: POS TRANSACTION BILL RECEIPT */}
        {/* ========================================== */}
        {receiptModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800 font-sans">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
              {/* Receipt Header */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-black font-display text-slate-900 uppercase tracking-tight">NEPH.PK POS INVOICE</h3>
                <p className="text-[10px] text-slate-400 font-bold">Instore Sales Terminal Receipt</p>
              </div>

              {/* Invoice Meta */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>INVOICE NO:</span>
                  <span className="text-slate-800">{receiptModal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE & TIME:</span>
                  <span className="text-slate-800">{new Date(receiptModal.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="text-slate-800">{receiptModal.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAY METHOD:</span>
                  <span className="text-slate-800 uppercase">{receiptModal.paymentMethod}</span>
                </div>
              </div>

              {/* Itemized List */}
              <div className="space-y-2 text-xs border-b border-dashed border-slate-200 pb-3 font-bold text-slate-800">
                <span className="block text-[10px] uppercase text-slate-400 font-black mb-1">Itemized Summary</span>
                {receiptModal.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="line-clamp-1 max-w-[180px]">{it.productTitle}</span>
                    <span className="font-mono font-normal">
                      {it.quantity} x PKR {it.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="space-y-1.5 font-bold text-xs text-slate-500 font-mono">
                {receiptModal.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-red-500">- PKR {receiptModal.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-900 font-black">
                  <span>TOTAL CHARGE:</span>
                  <span className="text-emerald-700">PKR {receiptModal.totalAmount.toLocaleString()}</span>
                </div>
                {receiptModal.paymentMethod === 'Cash' && receiptModal.cashReceived !== null && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Cash Received:</span>
                      <span className="text-slate-800">PKR {receiptModal.cashReceived.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-emerald-800">
                      <span>Change Given:</span>
                      <span>PKR {receiptModal.changeGiven.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => {
                    alert("Sending to printer queue... Done!");
                    window.print();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl flex items-center justify-center transition-all shadow"
                >
                  <span>Close Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL: BULK PRODUCT IMPORT */}
        {/* ========================================== */}
        {isBulkImportModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800 font-sans animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-4xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Bulk Product Importer</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Upload CSV / Excel generated template file to seed items as drafts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-2 space-y-4 min-h-[250px]">
                {bulkImportStatus === "" && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-200 hover:border-brand-green/40 rounded-2xl p-8 text-center bg-slate-50/50 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleBulkFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                        <span>📄</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">Drag & Drop or Click to Upload your completed template</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Accepts CSV files matching the template columns structure</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ff8717]" />
                        Quick Instructions
                      </h4>
                      <ul className="list-disc list-inside text-[10px] text-slate-500 font-medium space-y-1">
                        <li>Ensure you have clicked the <strong className="text-slate-700">"Get Excel Template"</strong> button on the top-right to download the proper column layout.</li>
                        <li>Fill in your product list. The column <strong className="text-slate-700">title</strong> and <strong className="text-slate-700">sku</strong> are required fields.</li>
                        <li>If the category name matches an existing catalog category (e.g. <em className="text-slate-700">Circuit Breakers</em>), it will auto-link!</li>
                        <li>All imported products will be saved in <strong className="text-slate-700">DRAFT</strong> mode by default. You can publish them live in 1-click.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {bulkImportStatus === "parsed" && (
                  <div className="space-y-4">
                    <div className="bg-amber-50/40 border border-[#ff8717]/15 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#ff8717] font-black text-xs">
                        ★
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-850">Parsed {bulkParsedProducts.length} Products Successfully!</p>
                        <p className="text-[10px] text-slate-500 font-medium">Verify the list below, then confirm below to save them into drafts.</p>
                      </div>
                    </div>

                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="overflow-x-auto max-h-[300px]">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-extrabold text-[9px]">
                              <th className="p-3">Product Name</th>
                              <th className="p-3">SKU</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Regular Price</th>
                              <th className="p-3">Sale Price</th>
                              <th className="p-3">Stock Count</th>
                              <th className="p-3">Brand</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {bulkParsedProducts.map((p, i) => {
                              const isMatchedCategory = categories.some(
                                (c) => c.name.toLowerCase() === (p.category || "").toLowerCase()
                              );
                              return (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3 font-bold text-slate-900">{p.title || "—"}</td>
                                  <td className="p-3 font-mono font-bold text-slate-500">{p.sku || "—"}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                                      isMatchedCategory ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    }`}>
                                      {p.category || "Unassigned"}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-bold">Rs. {p.regularPrice || 0}</td>
                                  <td className="p-3 font-mono font-bold text-slate-400">
                                    {p.salePrice ? `Rs. ${p.salePrice}` : "—"}
                                  </td>
                                  <td className="p-3 font-mono font-bold">{p.stockCount || 0}</td>
                                  <td className="p-3 uppercase text-[9px] text-slate-500">{p.brand || "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {bulkImportStatus === "uploading" && (
                  <div className="h-48 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-[#ff8717] animate-spin" />
                    <p className="text-xs font-black text-slate-700">Writing bulk listings to datastore... please wait</p>
                  </div>
                )}

                {bulkImportStatus === "success" && (
                  <div className="h-48 flex flex-col items-center justify-center space-y-2 text-center animate-in zoom-in duration-200">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Bulk Import Completed!</h4>
                    <p className="text-[10px] text-slate-400 font-bold">Your products list has been successfully added to drafts.</p>
                  </div>
                )}

                {bulkImportStatus === "error" && (
                  <div className="h-48 flex flex-col items-center justify-center space-y-2 text-center animate-in zoom-in duration-200">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight font-display">Upload Failed</h4>
                    <p className="text-[10px] text-slate-400 font-bold">An error occurred during database writing. Try re-formatting CSV.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-black uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkImportModalOpen(false);
                    setBulkParsedProducts([]);
                    setBulkImportStatus("");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-5 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                {bulkImportStatus === "parsed" && (
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    📥 Import {bulkParsedProducts.length} Draft Products
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
