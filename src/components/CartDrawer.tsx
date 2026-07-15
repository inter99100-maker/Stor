import React from "react";
import { X, Trash2, ShoppingBag, ShoppingCart, ArrowRight, ShieldCheck } from "lucide-react";
import { Product } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (index: number, val: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckoutClick: () => void;
}

export default function CartDrawer({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutClick
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.salePrice !== null ? item.product.salePrice : item.product.regularPrice;
    return acc + price * item.quantity;
  }, 0);

  // Delivery: Free over Rs. 5000, else Rs. 200
  const isFreeShipping = subtotal >= 5000 || subtotal === 0;
  const shippingCharge = isFreeShipping ? 0 : 200;
  const grandTotal = subtotal + shippingCharge;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end" id="cart-drawer-overlay">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Cart Container Drawer */}
      <div className="w-full max-w-md bg-white h-full relative z-10 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header section */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between" id="cart-drawer-header">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-green" />
            <h3 className="font-extrabold text-slate-900 text-base font-display">Your Shopping Basket</h3>
            <span className="bg-brand-orange/25 text-brand-orange-hover text-xs font-black px-2 py-0.5 rounded-full font-mono">
              {cart.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" id="cart-items-container">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-center text-slate-400 space-y-3">
              <ShoppingCart className="w-16 h-16 text-slate-200 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700 text-sm">Your basket is empty!</p>
                <p className="text-xs max-w-[240px] font-medium leading-relaxed">
                  Start adding high-fidelity Pakistani lifestyle products and smartwatch accessories to get started.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-5 py-2.5 rounded-full shadow transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const currentPrice = item.product.salePrice !== null ? item.product.salePrice : item.product.regularPrice;
              const hasVariants = item.selectedColor !== "Standard" || item.selectedSize !== "Standard";

              return (
                <div
                  key={`${item.product.id}-${index}`}
                  className="flex gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100/80 items-start"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200/50">
                    <img
                      src={item.product.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 leading-snug">
                      {item.product.title}
                    </h4>

                    {/* Color / Size Details */}
                    {hasVariants && (
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {item.selectedColor !== "Standard" && (
                          <span className="bg-white border border-slate-200/55 px-1.5 py-0.5 rounded">
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize !== "Standard" && (
                          <span className="bg-white border border-slate-200/55 px-1.5 py-0.5 rounded">
                            {item.selectedSize}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1.5">
                      {/* Price x Qty */}
                      <div className="text-[11px] font-bold text-slate-500">
                        <span className="text-brand-green font-extrabold text-xs">
                          Rs. {currentPrice.toLocaleString()}
                        </span>
                        <span> x {item.quantity}</span>
                      </div>

                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-slate-200 rounded bg-white">
                        <button
                          onClick={() => onUpdateQuantity(index, -1)}
                          className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-1.5 text-[10px] font-bold text-slate-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, 1)}
                          className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Trash Icon */}
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Delete from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Summary Area */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4" id="cart-summary-block">
            {/* Delivery threshold reminder */}
            {!isFreeShipping && (
              <div className="bg-brand-orange/10 border border-brand-orange/30 p-2.5 rounded-lg text-[10px] text-slate-700 font-medium text-center">
                Add <span className="font-bold text-slate-900">Rs. {(5000 - subtotal).toLocaleString()}</span> more to get <span className="font-extrabold text-brand-orange-hover">FREE DELIVERY</span>!
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Charge:</span>
                <span className="font-mono text-slate-900">
                  {isFreeShipping ? "FREE" : `Rs. ${shippingCharge.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-slate-200">
                <span className="font-display">Total Amount:</span>
                <span className="font-mono text-brand-green text-base">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="space-y-2">
              <button
                onClick={onCheckoutClick}
                className="w-full bg-brand-green hover:bg-brand-green-hover text-white py-3.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg scale-100 hover:scale-[1.01] active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-brand-orange" />
              </button>
              
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                <span>Genuine Products & Hassle-free Cash on Delivery</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
