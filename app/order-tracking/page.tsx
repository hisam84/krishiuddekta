"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "components/layout/navbar";
import Footer from "components/layout/footer";
import { toast } from "sonner";

interface TrackedOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  district: string;
  division?: string;
  total_amount: number;
  status: string;
  created_at?: string;
  public_notes?: string;
  status_history?: Array<{ status: string; timestamp: string; note?: string }>;
  consignment_id?: string;
  tracking_code?: string;
  steadfast_status?: string;
  items?: any[];
}

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const trackOrder = async (orderId: string, phone: string) => {
    if (!orderId.trim() || !phone.trim()) {
      toast.error("Please enter both Order ID and Phone Number");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setErrorMsg(data.message || "Order not found. Please double-check your Order ID and phone number.");
      }
    } catch (err) {
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qOrderId = searchParams.get("orderId");
    const qPhone = searchParams.get("phone");

    if (qOrderId) setOrderIdInput(qOrderId);
    if (qPhone) setPhoneInput(qPhone);

    if (qOrderId && qPhone) {
      trackOrder(qOrderId, qPhone);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(orderIdInput, phoneInput);
  };

  // Compute active step index for visual timeline
  const getStepIndex = (status: string) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Processing":
        return 2;
      case "Shipped":
        return 3;
      case "Delivered":
      case "Completed":
        return 4;
      case "Cancelled":
        return -1;
      default:
        return 1;
    }
  };

  const activeStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Search Header Card */}
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">
            Track Your Order Status
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Enter your Order ID and phone number below to get live delivery updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 max-w-xl mx-auto space-y-4 sm:space-y-0 sm:flex sm:gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. ORD-123456"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-mono"
              required
            />
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 01604649648"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-mono"
              required
            />
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </form>
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Tracked Order Result Card */}
      {order && (
        <div className="mt-8 space-y-6">
          {/* Timeline & Progress Stepper */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800 gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Order Found</span>
                <h2 className="text-xl font-bold font-mono text-neutral-900 dark:text-white">#{order.id}</h2>
              </div>
              <div className="text-xs text-neutral-500">
                Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { dateStyle: "medium" }) : "N/A"}
              </div>
            </div>

            {/* Status Timeline Stepper */}
            {activeStep === -1 ? (
              <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-center text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                This order has been Cancelled.
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-4 gap-2 text-center relative">
                {/* Connecting Bar */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-neutral-200 dark:bg-neutral-800 -z-0">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                {[
                  { step: 1, label: "Order Placed" },
                  { step: 2, label: "Processing" },
                  { step: 3, label: "Shipped" },
                  { step: 4, label: "Delivered" },
                ].map((s) => {
                  const isCompleted = activeStep >= s.step;
                  const isCurrent = activeStep === s.step;

                  return (
                    <div key={s.step} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                          isCompleted
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950"
                            : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {s.step}
                      </div>
                      <span className={`mt-2 text-[11px] font-bold ${isCurrent ? "text-emerald-700 dark:text-emerald-400" : "text-neutral-500"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Public Seller Notes */}
            {order.public_notes && (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs dark:border-amber-900/40 dark:bg-amber-950/30">
                <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">Message from Seller:</span>
                <p className="text-amber-800 dark:text-amber-200">{order.public_notes}</p>
              </div>
            )}

            {/* Steadfast Courier Parcel Info */}
            {order.consignment_id && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:border-blue-900/40 dark:bg-blue-950/30">
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-300">Shipped via Steadfast Courier</span>
                  <p className="text-blue-700 dark:text-blue-400 mt-0.5 font-mono">
                    Consignment ID: {order.consignment_id} {order.tracking_code ? `| Tracking: ${order.tracking_code}` : ""}
                  </p>
                </div>
                {order.tracking_code && (
                  <a
                    href={`https://steadfast.com.bd/t/${order.tracking_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    Track Parcel on Steadfast ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Order Details & Summary Card */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 pb-3 dark:border-neutral-800">
              Order Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700 dark:text-neutral-300">
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Customer Name</span>
                <span className="font-bold text-neutral-900 dark:text-white">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Phone Number</span>
                <span className="font-mono">{order.customer_phone}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Delivery Address</span>
                <span>{order.address}</span>
              </div>
            </div>

            {/* Line Items */}
            {order.items && order.items.length > 0 && (
              <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] font-bold uppercase mb-2">Items Ordered</span>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="py-2 flex justify-between">
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-white">{item.title || item.name || "Product"}</span>
                        <span className="text-neutral-500 block text-[11px]">Qty: {item.quantity || 1}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">
                        BDT {((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-sm text-neutral-900 dark:text-white dark:border-neutral-800">
              <span>Total Amount:</span>
              <span className="font-mono text-emerald-600">BDT {Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading Order Tracking...</div>}>
          <OrderTrackerContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
