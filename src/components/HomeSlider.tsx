import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Flame } from "lucide-react";
import { HeroSlider, SideBanner, Product, Category } from "../types";
import ProductCard from "./ProductCard";

interface HomeSliderProps {
  sliders: HeroSlider[];
  sideBanners: SideBanner[];
  products: Product[];
  categories: Category[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, color: string, size: string) => void;
  onSelectCategorySlug: (slug: string) => void;
}

export default function HomeSlider({
  sliders,
  sideBanners,
  products,
  categories,
  onSelectProduct,
  onAddToCart,
  onSelectCategorySlug,
}: HomeSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliders]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % sliders.length);
  };

  const handleSideBannerClick = (e: React.MouseEvent, banner: SideBanner) => {
    e.preventDefault();
    
    // If categoryId is set, open that category
    if (banner.categoryId) {
      const matchedCategory = categories.find((c) => c.id === banner.categoryId);
      if (matchedCategory) {
        onSelectCategorySlug(matchedCategory.slug);
        return;
      }
    }
    
    let matchedProduct: Product | undefined;
    
    // 1. Try to find product by specific ID if the link is a product ID or #prod-ID
    if (banner.link) {
      const cleanLink = banner.link.replace("#", "").trim();
      matchedProduct = products.find((p) => p.id === cleanLink || p.sku === cleanLink);
    }
    
    // 2. Fallback: match by Unsplash image ID if it is an Unsplash image
    if (!matchedProduct && banner.image) {
      const bannerUnsplashMatch = banner.image.match(/photo-[a-zA-Z0-9-]+/);
      if (bannerUnsplashMatch) {
        const bannerUnsplashId = bannerUnsplashMatch[0];
        matchedProduct = products.find((p) => {
          const prodUnsplashMatch = p.imageUrl.match(/photo-[a-zA-Z0-9-]+/);
          return prodUnsplashMatch && prodUnsplashMatch[0] === bannerUnsplashId;
        });
      }
    }
    
    // 3. Fallback: match if the banner image URL includes the product image URL or vice versa
    if (!matchedProduct && banner.image) {
      matchedProduct = products.find((p) => p.imageUrl && (banner.image.includes(p.imageUrl) || p.imageUrl.includes(banner.image)));
    }
    
    // 4. Fallback: hardcoded matches based on known image content IDs for standard seed data
    if (!matchedProduct && banner.image) {
      if (banner.image.includes("558494949")) {
        matchedProduct = products.find((p) => p.id === "prod-2");
      } else if (banner.image.includes("518770660")) {
        matchedProduct = products.find((p) => p.id === "prod-3");
      }
    }
    
    // 5. Ultimate Fallback: if we still can't match, pick the first product in the category or first product of all
    if (!matchedProduct && products.length > 0) {
      matchedProduct = products[0];
    }
    
    if (matchedProduct) {
      onSelectProduct(matchedProduct);
    }
  };

  if (!sliders || sliders.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full" id="home-sliders-grid">
      {/* 1. Large Main Hero Banner Slider */}
      <div className="lg:col-span-3 relative rounded-2xl overflow-hidden shadow-sm h-[220px] sm:h-[350px] bg-slate-900 group" id="main-carousel">
        {/* Sliders */}
        {sliders.map((slider, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Dark background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
            <img
              src={slider.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"}
              alt={slider.title}
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[6s]"
            />
            
            {/* Banner Information */}
            <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 z-20 max-w-lg text-white space-y-2 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-brand-orange text-slate-950 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase animate-pulse">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Special Discount
              </span>
              <h2 className="text-xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight drop-shadow-md">
                {slider.title}
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm drop-shadow-sm font-medium line-clamp-2">
                {slider.subtitle}
              </p>
              <button className="bg-brand-green hover:bg-brand-green-hover text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all-custom scale-100 hover:scale-105 active:scale-95">
                Shop Deals Now
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Arrow Buttons */}
        {sliders.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-full p-2.5 backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-full p-2.5 backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Indicator Dots */}
            <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
              {sliders.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeIndex ? "bg-brand-green w-6" : "bg-white/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Side Promo Cards (Right Side) */}
      <div className="hidden lg:grid grid-rows-2 gap-4 h-full lg:row-span-2" id="side-banners-grid">
        {sideBanners.map((banner, index) => {
          const matchedCat = banner.categoryId ? categories.find((c) => c.id === banner.categoryId) : null;
          return (
            <a
              href={banner.link || "#"}
              onClick={(e) => handleSideBannerClick(e, banner)}
              key={index}
              className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 bg-white group block transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-slate-950/25 group-hover:bg-slate-950/10 transition-colors z-10"></div>
              <img
                src={banner.image || "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&h=800&q=80"}
                alt={`Promotion Banner ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 z-20 text-white pr-4">
                <span className="bg-[#ff8717] text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm">
                  {matchedCat ? matchedCat.name : "NEPH SPECIAL"}
                </span>
                <p className="font-extrabold text-xs sm:text-sm drop-shadow mt-1 text-white uppercase tracking-wider line-clamp-1">
                  {matchedCat ? `EXPLORE ${matchedCat.name}` : "HOTTEST ACCESSORIES"}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* 3. Products Row (Left Side, directly under main-carousel) */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2" id="home-featured-products">
        {(products.filter((p) => !p.isFlashSale).length >= 3
          ? products.filter((p) => !p.isFlashSale).slice(0, 3)
          : products.slice(0, 3)
        ).map((prod) => {
          const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Smart Accessory";
          return (
            <ProductCard
              key={prod.id}
              product={prod}
              categoryName={catName}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          );
        })}
      </div>
    </div>
  );
}
