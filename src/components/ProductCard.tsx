import React from "react";
import { Star, ShoppingCart, Sparkles, Eye } from "lucide-react";
import { Product, Category } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  categoryName: string;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, color: string, size: string) => void;
}

export default function ProductCard({ product, categoryName, onSelect, onAddToCart }: ProductCardProps) {
  const discountAmount = product.regularPrice && product.salePrice 
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100) 
    : 0;

  const currentPrice = product.salePrice !== null ? product.salePrice : product.regularPrice;
  const originalPrice = product.salePrice !== null ? product.regularPrice : null;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default to the first color and size option if available
    const color = product.colors ? product.colors.split(",")[0].trim() : "Standard";
    const size = product.sizes ? product.sizes.split(",")[0].trim() : "Standard";
    onAddToCart(product, 1, color, size);
  };

  const isOutOfStock = product.stockCount <= 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-brand-green/30 hover:shadow-xl group cursor-pointer transition-all-custom duration-300 relative flex flex-col h-full"
      id={`product-card-${product.id}`}
    >
      {/* 1. Image Holder & Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 shrink-0">
        {/* Hover zoom */}
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Quick view overlay icon */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <span className="bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-4 h-4 text-brand-green" /> Quick View
          </span>
        </div>

        {/* Discount Badge */}
        {discountAmount > 0 && (
          <span className="absolute top-3 left-3 bg-brand-orange text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm z-20">
            -{discountAmount}% OFF
          </span>
        )}

        {/* Flash Sale Tag */}
        {product.isFlashSale && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-md shadow-sm flex items-center gap-0.5 z-20">
            <Sparkles className="w-3 h-3 fill-current animate-pulse" /> Flash Deal
          </span>
        )}

        {/* Out Of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-20">
            <span className="bg-red-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg tracking-widest uppercase shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* 2. Card Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Category Name & Brand/Circuit Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black text-[#ff8717] bg-[#ff8717]/5 px-1.5 py-0.5 rounded uppercase tracking-widest">
              {categoryName || "Product"}
            </span>
            {product.brand && (
              <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                {product.brand}
              </span>
            )}
            {product.subCategory && (
              <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded uppercase">
                {product.subCategory}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-800 text-sm leading-snug tracking-tight group-hover:text-brand-green line-clamp-2 h-10 transition-colors">
            {product.title}
          </h3>

          {/* Star Ratings */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3 h-3 ${
                    idx < Math.floor(product.rating || 4.5) ? "fill-current" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-bold">({product.rating || 4.5})</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Pricing Row */}
          <div className="flex items-baseline gap-2">
            <span className="text-brand-green font-extrabold text-base md:text-lg">
              Rs. {currentPrice.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-slate-400 line-through text-xs font-medium">
                Rs. {originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock remaining progress bar (for Flash Sales) */}
          {product.isFlashSale && !isOutOfStock && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Stock Remaining:</span>
                <span className="text-brand-orange">{product.flashSaleProgress || 20}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-orange h-full rounded-full transition-all duration-1000"
                  style={{ width: `${product.flashSaleProgress || 20}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Add To Cart Button */}
          <button
            disabled={isOutOfStock}
            onClick={handleAddToCartClick}
            className={`w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all-custom flex items-center justify-center gap-2 shadow-sm ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-brand-green hover:bg-brand-green-hover text-white hover:shadow-md hover:scale-[1.02] active:scale-95"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? "Sold Out" : "Add To Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
