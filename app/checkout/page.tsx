"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "components/cart/cart-context";
import LogoSquare from "components/logo-square";
import { Button } from "components/ui/button";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { cart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string } | null>(null);

  const totalAmount = Number(cart?.cost?.totalAmount?.amount || 0);
  const deliveryFee = totalAmount >= 1000 ? 0 : 60;
  const grandTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      toast.error("Please fill in your name, phone number, and delivery address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          address,
          district,
          total_amount: grandTotal,
          items: cart?.lines || [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess({ orderId: data.orderId });
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (err) {
      toast.error("Server error during order placement");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            🎉
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-neutral-500">
            Thank you for shopping with <strong>Krishi Uddokta</strong>. Your order ID is:
          </p>
          <div className="rounded-xl bg-emerald-50 py-3 text-lg font-mono font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            #{orderSuccess.orderId}
          </div>
          <p className="text-xs text-neutral-500">
            Our delivery agent will contact you shortly on <strong>{customerPhone}</strong>.
          </p>
          <Link href="/" className="block pt-4">
            <Button size="lg" className="w-full">
              Return to Store ➔
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Checkout Minimal Header */}
      <header className="border-b border-neutral-200 bg-white py-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoSquare />
            <span className="font-bold text-sm uppercase text-neutral-900 dark:text-white">
              Krishi Uddokta
            </span>
          </Link>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            🔒 Secure Checkout
          </span>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info Box */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-bold text-neutral-900 border-b pb-3 mb-4 dark:border-neutral-800 dark:text-white">
                1. Delivery Address & Customer Info
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abul Hossain"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01700000000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="Dhaka">Dhaka (ঢাকা)</option>
                    <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                    <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                    <option value="Khulna">Khulna (খুলনা)</option>
                    <option value="Sylhet">Sylhet (সিলেট)</option>
                    <option value="Barisal">Barisal (বরিশাল)</option>
                    <option value="Rangpur">Rangpur (রংপুর)</option>
                    <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                    <option value="Bogura">Bogura (বগুড়া)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Delivery Address *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="House / Village, Road, Upazila / Area details..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </form>
            </div>

            {/* Payment Options */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-bold text-neutral-900 border-b pb-3 mb-4 dark:border-neutral-800 dark:text-white">
                2. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <span>💵</span> Cash on Delivery
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Pay with cash when package is delivered</p>
                </div>

                <div
                  onClick={() => setPaymentMethod("bkash")}
                  className={`cursor-pointer rounded-2xl border p-4 transition opacity-80 ${
                    paymentMethod === "bkash"
                      ? "border-pink-600 bg-pink-50/60 dark:bg-pink-950/40"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-pink-600">
                    <span>📱</span> bKash Online
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Pay via bKash Merchant Gateway</p>
                </div>

                <div
                  onClick={() => setPaymentMethod("nagad")}
                  className={`cursor-pointer rounded-2xl border p-4 transition opacity-80 ${
                    paymentMethod === "nagad"
                      ? "border-amber-600 bg-amber-50/60 dark:bg-amber-950/40"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-amber-600">
                    <span>🟠</span> Nagad Online
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Pay via Nagad Merchant Gateway</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Order Summary Sidebar */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs h-fit space-y-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 border-b pb-3 dark:border-neutral-800 dark:text-white">
              Order Review
            </h2>

            <div className="space-y-3">
              {cart?.lines.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.merchandise.product.featuredImage?.url}
                      alt={item.merchandise.product.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold line-clamp-1 text-neutral-900 dark:text-white">
                        {item.merchandise.product.title}
                      </p>
                      <p className="text-[11px] text-neutral-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    BDT {Number(item.cost.totalAmount.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-xs text-neutral-600 dark:text-neutral-300 dark:border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold">BDT {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-emerald-600">
                  {deliveryFee === 0 ? "FREE" : `BDT ${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm font-extrabold text-neutral-900 dark:text-white dark:border-neutral-800">
                <span>Total Payable</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  BDT {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-4"
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? "Placing Order..." : "Confirm & Place Order ➔"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
