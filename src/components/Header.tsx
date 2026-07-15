import React, { useState } from "react";
import { Search, ShoppingCart, User, PhoneCall, Truck, ChevronDown, Menu, Store, ShieldAlert } from "lucide-react";
import { Category, Product, BannerSettings } from "../types";
// @ts-ignore
import nephLogo from "../assets/images/neph_logo_1783194516887.jpg";

interface HeaderProps {
  categories: Category[];
  products: Product[];
  cartCount: number;
  banners: BannerSettings | null;
  onCartClick: () => void;
  onAdminClick: () => void;
  onTrackClick: () => void;
  onCategorySelect: (slug: string) => void;
  onSubCategorySelect?: (subCat: string) => void;
  onBrandSelect?: (brand: string) => void;
  onSearch: (query: string) => void;
  selectedCategorySlug: string;
}

export default function Header({
  categories,
  products,
  cartCount,
  banners,
  onCartClick,
  onAdminClick,
  onTrackClick,
  onCategorySelect,
  onSubCategorySelect,
  onBrandSelect,
  onSearch,
  selectedCategorySlug
}: HeaderProps) {
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const phone = banners?.contactInfo?.phone || "+92 300 1234567";

  return (
    <header className="w-full bg-[#ff8717] sticky top-0 z-40 shadow-md" id="store-header">
      {/* 1. Top Utility Bar */}
      <div className="bg-[#d66500] text-white text-[11px] py-1.5 px-4 border-b border-[#bf5600]" id="top-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-4 font-medium w-full sm:w-auto justify-between sm:justify-start">
            <span 
              onDoubleClick={onAdminClick}
              className="flex items-center gap-1.5 hover:text-amber-100 transition-colors cursor-pointer select-none"
              title="Double click for Admin Access"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              <span>Customer Care: {phone}</span>
            </span>
            <span className="hidden md:inline text-amber-700">|</span>
            <span className="hidden md:inline text-amber-100 max-w-[280px] lg:max-w-[420px] overflow-hidden">
              {/* @ts-ignore */}
              <marquee 
                direction={banners?.announcementDirection || "right"} 
                scrollamount={banners?.announcementSpeed || 6}
                className="whitespace-nowrap block"
              >
                {banners?.announcementText || "Free delivery on orders above Rs. 5,000!"}
              </marquee>
            </span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span 
              onClick={onTrackClick}
              className="flex items-center gap-1 hover:text-amber-100 transition-colors cursor-pointer select-none"
            >
              <Truck className="w-3.5 h-3.5 text-white" />
              <span>Track Your Order</span>
            </span>
            <span className="hidden text-amber-700">|</span>
            <button 
              onClick={onAdminClick} 
              className="hidden"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" id="main-header">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0 select-none" 
          onClick={() => onCategorySelect("all")}
          onDoubleClick={onAdminClick}
          title="Double click for Admin Access"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ff8717] bg-white flex items-center justify-center shadow-md shrink-0">
            <img src={nephLogo} alt="NEPH Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-white flex items-center leading-none">
              <span>NEPH</span>
            </h1>
            <p className="text-[9px] uppercase font-bold text-white tracking-wider hidden md:block mt-0.5 opacity-100 leading-tight">
              Numan Electric & Pneumatic House
            </p>
          </div>
        </div>

        {/* Instant Search Bar (High Density Style) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative bg-white rounded overflow-hidden shadow-sm border border-[#d66500]" id="search-form">
          <input
            type="text"
            placeholder="Search for smartwatches, wireless earbuds, accessories..."
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              onSearch(val);
            }}
            className="w-full bg-white py-2 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#d66500] hover:bg-[#b55500] text-white px-6 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3 md:gap-4" id="header-actions">
          {/* Mobile Search/Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-amber-100 bg-[#d66500]/40 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* User Profile / Access Admin Panel shortcut */}
          <button 
            onClick={onAdminClick}
            className="p-2 text-white hover:text-amber-100 rounded transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            title="Access Admin Dashboard"
          >
            <User className="w-4.5 h-4.5 text-white" />
            <span className="hidden sm:inline">Account</span>
          </button>

          {/* Shopping Cart Trigger */}
          <button 
            onClick={onCartClick}
            className="relative p-2 text-white hover:bg-[#d66500]/60 bg-[#d66500]/30 rounded border border-[#d66500]/50 transition-all flex items-center justify-center group"
            id="cart-trigger-button"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#ff8717] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-[#ff8717]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Category Navigation Menu (Mega Menu Style) */}
      <div className="bg-white border-b border-slate-200 py-0 relative" id="nav-mega-menu" onMouseLeave={() => setHoveredCategory(null)}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                onCategorySelect("all");
                setHoveredCategory(null);
              }}
              onMouseEnter={() => setHoveredCategory(null)}
              className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                selectedCategorySlug === "all"
                  ? "text-[#ff8717] border-[#ff8717] bg-[#ff8717]/5 font-extrabold"
                  : "text-slate-600 border-transparent hover:text-[#ff8717] hover:border-[#ff8717]/40"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => {
              const isHovered = hoveredCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategorySelect(cat.slug);
                    setHoveredCategory(null);
                  }}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    selectedCategorySlug === cat.slug || isHovered
                      ? "text-[#ff8717] border-[#ff8717] bg-[#ff8717]/5 font-extrabold"
                      : "text-slate-600 border-transparent hover:text-[#ff8717] hover:border-[#ff8717]/40"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% Genuine Pakistani Stores</span>
          </div>
        </div>

        {/* Mega Dropdown Panel for Hovered Category */}
        {hoveredCategory && (() => {
          // Extract products belonging to the hovered category
          const catProducts = products.filter(p => !p.isDraft && p.categoryId === hoveredCategory.id);
          
          // Subcategories (Circuit Types)
          const baseSubCats = Array.from(new Set(catProducts.map(p => p.subCategory).filter(Boolean) as string[]));
          if (!baseSubCats.includes("AC")) baseSubCats.push("AC");
          if (!baseSubCats.includes("DC")) baseSubCats.push("DC");
          const subCats = baseSubCats.sort();

          return (
            <div className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-slate-800">
                
                {/* Column 1: Category Details & Call to Action */}
                <div className="space-y-3 border-r border-slate-100 pr-6 flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-150 bg-slate-50 flex items-center justify-center p-2 shadow-sm mb-2">
                      <img 
                        src={hoveredCategory.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=150&q=80"} 
                        alt={hoveredCategory.name} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{hoveredCategory.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1">
                      Explore our premium range of {hoveredCategory.name.toLowerCase()} electrical equipment, designed for ultimate safety and performance.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onCategorySelect(hoveredCategory.slug);
                      setHoveredCategory(null);
                    }}
                    className="bg-[#ff8717] hover:bg-[#d66500] text-white py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer shadow-sm w-full"
                  >
                    View All Products →
                  </button>
                </div>

                {/* Columns 2 & 3: Subcategories and their Brands */}
                <div className="col-span-2 grid grid-cols-2 gap-6">
                  {subCats.map((sub) => {
                    // Extract Brands under this category & subcategory
                    const subProducts = catProducts.filter(p => p.subCategory?.toLowerCase() === sub.toLowerCase());
                    const brandsInSub = Array.from(new Set(subProducts.map(p => p.brand).filter(Boolean) as string[])).sort();
                    
                    // Fallback brands if none found
                    const displayBrands = brandsInSub.length > 0 ? brandsInSub : ["Schneider", "ABB", "Terasaki", "Siemens", "Hager"];

                    return (
                      <div key={sub} className="space-y-2.5">
                        <button
                          onClick={() => {
                            if (onSubCategorySelect) onSubCategorySelect(sub);
                            onCategorySelect(hoveredCategory.slug);
                            setHoveredCategory(null);
                          }}
                          className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 hover:text-[#ff8717] transition-colors text-left"
                        >
                          <span className="text-sky-600">⚡</span>
                          <span>{sub} Circuit</span>
                        </button>
                        <div className="flex flex-col gap-1.5 pl-3 border-l border-slate-100">
                          {displayBrands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => {
                                if (onSubCategorySelect) onSubCategorySelect(sub);
                                if (onBrandSelect) onBrandSelect(brand);
                                onCategorySelect(hoveredCategory.slug);
                                setHoveredCategory(null);
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-[#ff8717] hover:pl-1 transition-all text-left uppercase tracking-wide"
                            >
                              ★ {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column 4: Trending / Popular items in the hovered Category */}
                <div className="border-l border-slate-100 pl-6 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trending Items</h4>
                  <div className="space-y-3">
                    {catProducts.slice(0, 2).map((prod) => {
                      const price = prod.salePrice !== null && prod.salePrice !== undefined ? prod.salePrice : prod.regularPrice;
                      return (
                        <div 
                          key={prod.id} 
                          className="flex items-center gap-2.5 group cursor-pointer"
                          onClick={() => {
                            onCategorySelect(hoveredCategory.slug);
                            setHoveredCategory(null);
                          }}
                        >
                          <div className="w-10 h-10 rounded border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                            <img 
                              src={prod.imageUrl} 
                              alt={prod.title} 
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 truncate group-hover:text-[#ff8717] transition-colors">
                              {prod.title}
                            </p>
                            <p className="text-[9px] font-mono font-black text-slate-400 mt-0.5">
                              Rs. {Number(price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {catProducts.length === 0 && (
                      <p className="text-[10px] text-slate-400 font-bold italic">
                        No products in this category yet.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </div>

      {/* Mobile Drawer Menu (Search & Categories combo) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 p-4 space-y-4 shadow-lg absolute w-full left-0">
          <form onSubmit={handleSearchSubmit} className="flex relative rounded overflow-hidden border border-slate-300">
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                onSearch(val);
              }}
              className="w-full bg-slate-50 py-2 px-3 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-[#ff8717] text-white px-4">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Shop Categories</h4>
            <button
              onClick={() => {
                onCategorySelect("all");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-sm font-semibold text-slate-700 hover:bg-[#ff8717]/5 hover:text-[#ff8717]"
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategorySelect(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded text-sm font-semibold text-slate-700 hover:bg-[#ff8717]/5 hover:text-[#ff8717] block"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
