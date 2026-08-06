"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DbOrder } from "lib/db/schema";

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Form & action state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [publicNotes, setPublicNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setInternalNotes(data.order.internal_notes || "");
        setPublicNotes(data.order.public_notes || "");
      } else {
        toast.error("Order not found");
      }
    } catch (err) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote.trim() || `Status updated to ${newStatus}`,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setStatusNote("");
        fetchOrderDetail();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Server error while updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internal_notes: internalNotes,
          public_notes: publicNotes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Order notes saved successfully");
        fetchOrderDetail();
      } else {
        toast.error("Failed to save notes");
      }
    } catch (err) {
      toast.error("Server error while saving notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const parseItems = (rawItems: string) => {
    try {
      return JSON.parse(rawItems);
    } catch (e) {
      return [];
    }
  };

  const parseHistory = (rawHistory?: string): StatusHistoryItem[] => {
    if (!rawHistory) return [];
    try {
      return JSON.parse(rawHistory);
    } catch (e) {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-xs text-slate-500">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
        >
          ← Back to Orders List
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900">
          Order #{id} was not found.
        </div>
      </div>
    );
  }

  const items = parseItems(order.items);
  const statusHistory = parseHistory(order.status_history);
  const subtotal = order.subtotal || (Number(order.total_amount) - 60 > 0 ? Number(order.total_amount) - 60 : Number(order.total_amount));
  const deliveryCharge = order.delivery_charge !== undefined ? Number(order.delivery_charge) : 60;

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900",
    Processing: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900",
    Shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
    Delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
    Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
    Cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900",
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition dark:hover:text-white"
        >
          <span>← Back to Orders List</span>
        </Link>

        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Order #{order.id}
              </h1>
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusColors[order.status] || "bg-slate-100 text-slate-800"}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Placed on {order.created_at ? new Date(order.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
            </p>
          </div>

          {/* Quick Print Button */}
          <button
            onClick={() => window.print()}
            className="self-start sm:self-auto rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Print Invoice / Waybill
          </button>
        </div>
      </div>

      {/* Status Action Workflow Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Order Status Workflow
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {["Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              disabled={updatingStatus || order.status === st}
              onClick={() => handleStatusUpdate(st)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-40 ${
                order.status === st
                  ? "bg-slate-900 text-white shadow-xs dark:bg-emerald-600"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Mark as {st}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <input
            type="text"
            placeholder="Optional status change note (e.g. Handed to Steadfast rider)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            className="w-full max-w-lg rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ordered Line Items ({items.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item: any, idx: number) => {
                const itemQty = item.quantity || 1;
                const itemPrice = Number(item.price || 0);
                const lineTotal = itemQty * itemPrice;

                return (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {item.title || item.name || "Product Item"}
                      </h3>
                      {item.variant && (
                        <p className="text-slate-500 mt-0.5 font-medium">
                          Variant: {item.variant}
                        </p>
                      )}
                      <p className="text-slate-400 mt-0.5">
                        {itemQty} x BDT {itemPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900 dark:text-white">
                      BDT {lineTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-mono">BDT {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charge ({order.district === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                <span className="font-mono">BDT {deliveryCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 dark:text-white dark:border-slate-700">
                <span>Total Amount Payable</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  BDT {Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes Card */}
          <form onSubmit={handleSaveNotes} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Order Notes & Customer Updates
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Private Notes (Staff Only)
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record customer preferences, verification call details, etc."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public Notes (Visible to Customer on Order Tracking Page)
                </label>
                <textarea
                  rows={2}
                  value={publicNotes}
                  onChange={(e) => setPublicNotes(e.target.value)}
                  placeholder="Dispatch status, expected delivery date or courier instructions..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingNotes}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shadow-xs"
              >
                {savingNotes ? "Saving Notes..." : "Save Notes"}
              </button>
            </div>
          </form>

          {/* Status History Timeline Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Audit & Status History Log
            </h2>

            {statusHistory.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">No status logs recorded yet.</p>
            ) : (
              <div className="mt-4 space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                {statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{hist.status}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(hist.timestamp).toLocaleString("en-US", { dateStyle: "short", timeStyle: "medium" })}
                        </span>
                      </div>
                      {hist.note && (
                        <p className="mt-0.5 text-slate-600 dark:text-slate-400">{hist.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Customer Information
            </h2>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Customer Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Phone Number</span>
                <a href={`tel:${order.customer_phone}`} className="font-mono text-emerald-600 hover:underline font-bold">
                  {order.customer_phone}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Division & District</span>
                <span>{order.division || "Dhaka"} / {order.district}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Full Address</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  {order.address}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Payment Method</span>
                <span className="inline-block mt-1 rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {order.payment_method || "Cash on Delivery (COD)"}
                </span>
              </div>
            </div>
          </div>

          {/* Courier & Dispatch Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Steadfast Courier Dispatch
            </h2>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {order.consignment_id ? (
                <>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">Consignment ID</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{order.consignment_id}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">Tracking Code</span>
                    <span className="font-mono text-blue-600 font-bold">{order.tracking_code || "N/A"}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">Courier Status</span>
                    <span className="inline-block mt-1 rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase text-[10px]">
                      {order.steadfast_status || "In Review"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-2 text-slate-500">
                  This order has not been dispatched to Steadfast Courier yet.
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/admin/orders"
                  className="block text-center rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                >
                  Manage Dispatch on Orders Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
