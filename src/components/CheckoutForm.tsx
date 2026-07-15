import React, { useState } from "react";
import { Truck, ShieldCheck, CheckCircle, ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { Product } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface CheckoutFormProps {
  cart: CartItem[];
  onBack: () => void;
  onOrderCompleted: (orderId: string) => void;
  onClearCart: () => void;
}

export default function CheckoutForm({ cart, onBack, onOrderCompleted, onClearCart }: CheckoutFormProps) {
  // Input fields state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Karachi");

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.salePrice !== null ? item.product.salePrice : item.product.regularPrice;
    return acc + price * item.quantity;
  }, 0);

  // Delivery configuration: Free above Rs. 5000, else city-specific
  const isFreeShipping = subtotal >= 5000;
  const shippingCharge = isFreeShipping 
    ? 0 
    : (customerCity === "Karachi" ? 150 : (customerCity === "Lahore" || customerCity === "Islamabad" ? 200 : 250));
  const grandTotal = subtotal + shippingCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form validation
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError("Please fill out all billing and delivery information fields.");
      return;
    }

    // Phone number verification (Pakistani format 03xxxxxxxxx)
    const phoneClean = customerPhone.replace(/[-\s]/g, "");
    if (!/^03\d{9}$/.test(phoneClean) && !/^\+92\d{10}$/.test(phoneClean)) {
      setError("Please provide a valid Pakistani contact number starting with '03' or '+92' (11-13 digits total).");
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone: phoneClean,
        customerAddress,
        customerCity,
        items: cart.map((it) => ({
          productId: it.product.id,
          productTitle: it.product.title,
          sku: it.product.sku,
          quantity: it.quantity,
          price: it.product.salePrice !== null ? it.product.salePrice : it.product.regularPrice
        })),
        totalAmount: grandTotal
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const responseData = await res.json();
      if (responseData.success) {
        setSuccessOrder(responseData.order);
        onClearCart();
        onOrderCompleted(responseData.orderId);
      } else {
        setError(responseData.message || "An error occurred while routing your check. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please confirm backend server status and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // If order is placed successfully, display a beautiful success card!
  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300" id="checkout-success-view">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <span className="bg-brand-orange/20 text-brand-orange-hover text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
            Order Confirmed!
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display">Al-hamdu lillah! Your Order is Placed!</h2>
          <p className="text-xs text-slate-500 font-bold">
            Order Reference ID: <span className="font-mono text-slate-900 font-black">{successOrder.id}</span>
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 space-y-3 text-xs leading-normal">
          <p className="text-slate-600 font-medium">
            Dear <span className="font-bold text-slate-900">{successOrder.customerName}</span>, we have successfully received your purchase and are preparing it for shipment to <span className="font-semibold text-slate-900">{successOrder.customerCity}</span>.
          </p>
          <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">COD Total payable amount:</span>
            <span className="font-mono text-brand-green font-black text-sm">Rs. {successOrder.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-400 font-bold items-start bg-white p-2.5 rounded border border-slate-200/50 mt-1">
            <Truck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <span>Our support representatives will dial you soon at <span className="text-slate-700 font-mono font-extrabold">{successOrder.customerPhone}</span> to confirm delivery timing. Keep your cash ready!</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-brand-green hover:bg-brand-green-hover text-white px-8 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer block w-full"
        >
          Back to Storefront Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" id="checkout-form-wizard">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace Shopping</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: COD Billing/Shipping Details */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-green" />
              <span>Cash On Delivery Information</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Fill in accurate details. We only process deliveries within Pakistan. Pay when you receive.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-600">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="customerName" className="block text-xs uppercase tracking-wider">
                Consignee Name (Full Name) <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                placeholder="e.g. Zain Ali"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
              />
            </div>

            {/* Email & Phone side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="customerEmail" className="block text-xs uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  required
                  placeholder="e.g. zain@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="customerPhone" className="block text-xs uppercase tracking-wider">
                  Mobile Number (Active SIM) <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  required
                  placeholder="e.g. 03123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Complete Address */}
            <div className="space-y-1.5">
              <label htmlFor="customerAddress" className="block text-xs uppercase tracking-wider">
                Full Street Address (House No, Street, Sector, Area) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="customerAddress"
                required
                rows={3}
                placeholder="e.g. Apartment 4-C, Floor 2, Block D, Main Boulevard"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
              />
            </div>

            {/* City Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="customerCity" className="block text-xs uppercase tracking-wider">
                  City Selection <span className="text-red-500">*</span>
                </label>
                <select
                  id="customerCity"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green focus:bg-white transition-all"
                >
                  <option value="Karachi">Karachi (Rs. 150 Delivery)</option>
                  <option value="Lahore">Lahore (Rs. 200 Delivery)</option>
                  <option value="Islamabad">Islamabad (Rs. 200 Delivery)</option>
                  <option value="Rawalpindi">Rawalpindi (Rs. 200 Delivery)</option>
                  <option value="Faisalabad">Faisalabad (Rs. 250 Delivery)</option>
                  <option value="Peshawar">Peshawar (Rs. 250 Delivery)</option>
                  <option value="Quetta">Quetta (Rs. 250 Delivery)</option>
                  <option value="Multan">Multan (Rs. 250 Delivery)</option>
                  <option value="Sialkot">Sialkot (Rs. 250 Delivery)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider">Payment Method Offered</label>
                <div className="bg-emerald-50 text-brand-green border border-emerald-200 rounded-lg py-3 px-4 flex items-center gap-2.5 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-slate-950 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed scale-100 hover:scale-[1.01] active:scale-95"
              >
                {submitting ? "Placing Your Order..." : "Confirm & Place COD Order (Rs. " + grandTotal.toLocaleString() + ")"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary items preview */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 text-white space-y-6 shadow-md" id="checkout-summary-container">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <ShoppingBag className="w-5 h-5 text-brand-orange" />
            <h3 className="font-bold font-display text-base">Checkout Order Summary</h3>
          </div>

          {/* Cart items mini-grid */}
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2" id="checkout-summary-list">
            {cart.map((item, idx) => {
              const currentPrice = item.product.salePrice !== null ? item.product.salePrice : item.product.regularPrice;
              const lineTotal = currentPrice * item.quantity;
              return (
                <div key={idx} className="flex gap-3 justify-between items-start text-xs">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                      <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-200 line-clamp-1 max-w-[180px]">{item.product.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Qty: <span className="font-bold text-white">{item.quantity}</span> | Color: <span className="text-white">{item.selectedColor}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">Rs. {lineTotal.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {/* Checkout pricing sum */}
          <div className="space-y-2 border-t border-slate-800 pt-4 text-xs font-semibold text-slate-400">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-mono text-white">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges ({customerCity}):</span>
              <span className="font-mono text-white">
                {isFreeShipping ? "FREE" : `Rs. ${shippingCharge}`}
              </span>
            </div>
            
            {/* Free shipping banner inside sidebar */}
            {isFreeShipping && (
              <div className="bg-brand-green/20 border border-brand-green/30 text-emerald-400 p-2 text-[10px] font-bold rounded text-center my-1.5">
                Congratulations! Free Shipping Promo Applied!
              </div>
            )}

            <div className="flex justify-between text-white text-sm font-black border-t border-slate-800 pt-3 mt-3">
              <span className="font-display uppercase tracking-wider text-brand-orange">Grand Total Payable:</span>
              <span className="font-mono text-lg text-brand-orange font-black">Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2.5 text-[10px] leading-relaxed text-slate-400 font-bold">
            <div className="flex gap-1.5 items-center">
              <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
              <span className="text-slate-200">Safe Shopping Guarantee</span>
            </div>
            <p>Every NEPH transaction is backed by secure localized packaging. You pay zero online fees. Verify parcel before payment at your door!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
