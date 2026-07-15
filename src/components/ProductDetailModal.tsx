import React, { useState } from "react";
import { X, Star, ShoppingCart, Truck, Calendar, Sparkles, Check, ChevronRight } from "lucide-react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  categoryName: string;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color: string, size: string) => void;
}

export default function ProductDetailModal({ product, categoryName, onClose, onAddToCart }: ProductDetailModalProps) {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80");
  const [selectedSize, setSelectedSize] = useState(
    product.sizes ? product.sizes.split(",")[0].trim() : "Standard"
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors ? product.colors.split(",")[0].trim() : "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [shippingCity, setShippingCity] = useState("Karachi");
  const [shippingMessage, setShippingMessage] = useState("Delivery in 2-3 days! Cash on Delivery available.");

  const handleCityChange = (city: string) => {
    setShippingCity(city);
    if (city === "Karachi") {
      setShippingMessage("Express Delivery: 1-2 Days (Rs. 150 shipping, free above Rs. 5000!)");
    } else if (city === "Lahore" || city === "Islamabad") {
      setShippingMessage("Standard Shipping: 2-3 Days (Rs. 200 shipping)");
    } else {
      setShippingMessage("Regular Shipping: 3-5 Days (Rs. 250 shipping to remote areas)");
    }
  };

  const colorsList = product.colors ? product.colors.split(",").map((c) => c.trim()) : [];
  const sizesList = product.sizes ? product.sizes.split(",").map((s) => s.trim()) : [];

  // Gallery items (Main + Gallery Array)
  const imagesList = [product.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", ...(product.gallery || [])].filter(Boolean);

  const discountAmount = product.regularPrice && product.salePrice 
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100) 
    : 0;

  const currentPrice = product.salePrice !== null ? product.salePrice : product.regularPrice;
  const originalPrice = product.salePrice !== null ? product.regularPrice : null;

  const handleQuantityChange = (val: number) => {
    const updated = quantity + val;
    if (updated >= 1 && updated <= product.stockCount) {
      setQuantity(updated);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    onClose();
  };

  const isOutOfStock = product.stockCount <= 0;

  // Mock Reviews
  const mockReviews = [
    { author: "Arsalan K.", rating: 5, date: "June 25, 2026", comment: "Outstanding watch! Built quality is elite. Got exactly what was advertised. Battery life is solid 4 days on heavy use." },
    { author: "Hina M.", rating: 4, date: "June 18, 2026", comment: "Super fast shipping to Lahore! Packaging was nicely cushioned. The screen is extremely vibrant." }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto" id="product-detail-modal">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-full p-2.5 transition-all z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Gallery Section (Left Panel) */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col gap-4 border-r border-slate-100">
          {/* Main Large Image */}
          <div className="bg-slate-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center border border-slate-100 relative">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {discountAmount > 0 && (
              <span className="absolute top-4 left-4 bg-brand-orange text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md z-10">
                {discountAmount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 bg-slate-50 shrink-0 transition-all ${
                    activeImage === img ? "border-brand-green shadow-sm scale-95" : "border-slate-100 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Detail Options (Right Panel) */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between" id="product-detail-options">
          <div className="space-y-4">
            {/* Category Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Home</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 leading-tight">
              {product.title}
            </h2>

            {/* SKU and Rating */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < Math.floor(product.rating || 4.5) ? "fill-current" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-600">({product.rating || 4.5} Ratings)</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded">
                SKU: {product.sku}
              </span>
              {product.brand && (
                <span className="font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded uppercase">
                  🏷️ Brand: {product.brand}
                </span>
              )}
              {product.subCategory && (
                <span className="font-black text-sky-700 bg-sky-50 border border-sky-150 px-2 py-1 rounded uppercase">
                  ⚡ Circuit: {product.subCategory}
                </span>
              )}
            </div>

            {/* Price section */}
            <div className="bg-slate-50 p-4 rounded-xl flex items-baseline gap-3 border border-slate-100">
              <span className="text-2xl font-black text-brand-green font-display">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-slate-400 line-through text-sm font-semibold">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Color Variant Selector */}
            {colorsList.length > 0 && colorsList[0] !== "Standard" && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Color: <span className="text-slate-900 font-bold">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        selectedColor === color
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {selectedColor === color && <Check className="w-3.5 h-3.5 text-brand-orange" />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Variant Selector */}
            {sizesList.length > 0 && sizesList[0] !== "Standard" && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Size: <span className="text-slate-900 font-bold">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                        selectedSize === size
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {selectedSize === size && <Check className="w-3.5 h-3.5 text-brand-orange" />}
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Estimator Widget */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Truck className="w-4 h-4 text-brand-green" />
                  <span>Check Delivery Estimates:</span>
                </div>
                <select
                  value={shippingCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2.5 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-brand-green"
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {shippingMessage}
              </p>
            </div>

            {/* Tabbed Info Panel (Description vs Reviews) */}
            <div className="space-y-3">
              <div className="flex border-b border-slate-100 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-2.5 px-1 relative cursor-pointer ${
                    activeTab === "description" ? "text-brand-green font-black" : "text-slate-400"
                  }`}
                >
                  Description
                  {activeTab === "description" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2.5 px-4 relative cursor-pointer ${
                    activeTab === "reviews" ? "text-brand-green font-black" : "text-slate-400"
                  }`}
                >
                  Reviews ({mockReviews.length})
                  {activeTab === "reviews" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"></span>
                  )}
                </button>
              </div>

              {activeTab === "description" ? (
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  {product.description || "No additional detailed description is currently available."}
                </p>
              ) : (
                <div className="space-y-3">
                  {mockReviews.map((rev, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{rev.author}</span>
                        <span className="text-slate-400 font-medium">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-400 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <p className="text-slate-600 leading-normal font-medium">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-4 mt-6">
            {/* Quantity Controls */}
            {!isOutOfStock && (
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-3 py-2 text-sm transition-all"
                >
                  -
                </button>
                <span className="px-4 text-xs font-black text-slate-800 font-mono w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-3 py-2 text-sm transition-all"
                >
                  +
                </button>
              </div>
            )}

            {/* Stock indicator */}
            <div className="text-[10px] text-slate-400 shrink-0">
              <span className="font-extrabold text-slate-600 font-mono">{product.stockCount}</span> items available
            </div>

            {/* Confirm Add To Cart Button */}
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-brand-green hover:bg-brand-green-hover text-white hover:shadow-lg hover:scale-[1.01] active:scale-95"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Shopping Cart"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
