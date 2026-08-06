"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  district: string;
  total_amount: number;
  status: string;
  items: string;
  consignment_id?: string;
  tracking_code?: string;
  steadfast_status?: string;
  steadfast_submitted_at?: string;
  created_at?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Send to Steadfast Modal State
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<OrderItem | null>(null);
  const [dispatchNote, setDispatchNote] = useState("");
  const [sendingToSteadfast, setSendingToSteadfast] = useState(false);

  // Track Delivery Modal State
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<OrderItem | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  // Order Items Detail Modal State
  const [selectedOrderForItems, setSelectedOrderForItems] = useState<OrderItem | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleSendToSteadfast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDispatch) return;

    setSendingToSteadfast(true);
    try {
      const res = await fetch("/api/admin/steadfast/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForDispatch.id,
          note: dispatchNote.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Order #${selectedOrderForDispatch.id} sent to Steadfast Courier!`);
        setSelectedOrderForDispatch(null);
        setDispatchNote("");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to send order to Steadfast Courier");
      }
    } catch (err) {
      toast.error("Server error while dispatching order");
    } finally {
      setSendingToSteadfast(false);
    }
  };

  const handleFetchTrackingStatus = async (order: OrderItem) => {
    setSelectedOrderForTracking(order);
    setTrackingLoading(true);
    setTrackingData(null);

    try {
      const res = await fetch(`/api/admin/steadfast/track?orderId=${order.id}&consignmentId=${order.consignment_id || ""}&trackingCode=${order.tracking_code || ""}`);
      const data = await res.json();

      if (data.success) {
        setTrackingData(data);
      } else {
        toast.error(data.message || "Failed to fetch Steadfast delivery status");
      }
    } catch (err) {
      toast.error("Error connecting to tracking service");
    } finally {
      setTrackingLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const parseOrderItems = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : statusFilter === "Steadfast"
      ? orders.filter((o) => Boolean(o.consignment_id))
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* Orders Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Order Management & Steadfast Delivery
          </h1>
          <p className="text-xs text-neutral-500">
            Process customer Cash on Delivery (COD) orders and manage Steadfast Courier dispatch.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 cursor-pointer self-start sm:self-auto"
        >
          Refresh Orders
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setStatusFilter("All")}
          className={`rounded px-3 py-1 cursor-pointer ${
            statusFilter === "All"
              ? "bg-[#2271b1] text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter("Pending")}
          className={`rounded px-3 py-1 cursor-pointer ${
            statusFilter === "Pending"
              ? "bg-amber-600 text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Pending ({orders.filter((o) => o.status === "Pending").length})
        </button>
        <button
          onClick={() => setStatusFilter("Processing")}
          className={`rounded px-3 py-1 cursor-pointer ${
            statusFilter === "Processing"
              ? "bg-blue-600 text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Processing ({orders.filter((o) => o.status === "Processing").length})
        </button>
        <button
          onClick={() => setStatusFilter("Steadfast")}
          className={`rounded px-3 py-1 cursor-pointer ${
            statusFilter === "Steadfast"
              ? "bg-indigo-600 text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Sent to Steadfast ({orders.filter((o) => Boolean(o.consignment_id)).length})
        </button>
        <button
          onClick={() => setStatusFilter("Completed")}
          className={`rounded px-3 py-1 cursor-pointer ${
            statusFilter === "Completed"
              ? "bg-emerald-600 text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Completed ({orders.filter((o) => o.status === "Completed").length})
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading customer orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No orders found for selected filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer Details</th>
                <th className="px-4 py-3">Address & District</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Steadfast Courier</th>
                <th className="px-4 py-3">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredOrders.map((o) => {
                const orderItemsList = parseOrderItems(o.items);
                const isSentToSteadfast = Boolean(o.consignment_id);

                return (
                  <tr key={o.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3 font-mono">
                      <p className="font-bold text-[#2271b1] dark:text-blue-400">#{o.id}</p>
                      <button
                        onClick={() => setSelectedOrderForItems(o)}
                        className="mt-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                      >
                        View {orderItemsList.length} items
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-neutral-900 dark:text-white">{o.customer_name}</p>
                      <p className="font-mono text-emerald-700 dark:text-emerald-400">{o.customer_phone}</p>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-neutral-600 dark:text-neutral-300">{o.address}</p>
                      <span className="mt-0.5 inline-block rounded bg-neutral-100 px-1.5 py-0.5 font-semibold text-neutral-600 text-[10px] dark:bg-neutral-800 dark:text-neutral-400">
                        District: {o.district}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      BDT {Number(o.total_amount || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      {isSentToSteadfast ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              {o.steadfast_status || "in_review"}
                            </span>
                          </div>
                          {o.tracking_code && (
                            <button
                              onClick={() => copyToClipboard(o.tracking_code!, "Tracking Code")}
                              title="Click to copy tracking code"
                              className="font-mono text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600 underline flex items-center gap-1 cursor-pointer"
                            >
                              CID: {o.consignment_id}
                            </button>
                          )}
                          <button
                            onClick={() => handleFetchTrackingStatus(o)}
                            className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition cursor-pointer dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          >
                            Track Delivery Process
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrderForDispatch(o);
                            setDispatchNote(`Order #${o.id} - ${o.customer_name}`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send to Steadfast
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL 1: SEND ORDER TO STEADFAST ================= */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dispatch Order #{selectedOrderForDispatch.id} to Steadfast
              </h3>
              <button
                onClick={() => setSelectedOrderForDispatch(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendToSteadfast} className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1.5 dark:bg-slate-800/60 dark:text-slate-300">
                <p><strong>Customer:</strong> {selectedOrderForDispatch.customer_name}</p>
                <p><strong>Phone:</strong> {selectedOrderForDispatch.customer_phone}</p>
                <p><strong>Delivery Address:</strong> {selectedOrderForDispatch.address}, {selectedOrderForDispatch.district}</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  <strong>COD Collect Amount:</strong> BDT {Number(selectedOrderForDispatch.total_amount).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
                  Delivery Instruction / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="Handle fragile seed items carefully"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDispatch(null)}
                  className="w-1/2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingToSteadfast}
                  className="w-1/2 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {sendingToSteadfast ? "Dispatching..." : "Confirm & Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TRACK STEADFAST DELIVERY PROCESS ================= */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Steadfast Delivery Process
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{selectedOrderForTracking.id} | Consignment #{selectedOrderForTracking.consignment_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {trackingLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Fetching live status from Steadfast Courier API...
              </div>
            ) : trackingData ? (
              <div className="space-y-4 text-xs">
                <div className="rounded-lg bg-blue-50/70 p-4 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Live Delivery Status:</span>
                    <span className="rounded bg-blue-600 px-2.5 py-1 font-bold text-white uppercase text-[11px]">
                      {trackingData.deliveryStatus || "In Review"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 space-y-1.5 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <p><strong>Tracking Code:</strong> <span className="font-mono font-semibold">{selectedOrderForTracking.tracking_code || "N/A"}</span></p>
                  <p><strong>Consignment ID:</strong> <span className="font-mono font-semibold">{selectedOrderForTracking.consignment_id || "N/A"}</span></p>
                  <p><strong>Recipient Name:</strong> {selectedOrderForTracking.customer_name}</p>
                  <p><strong>Recipient Phone:</strong> {selectedOrderForTracking.customer_phone}</p>
                  <p><strong>Address:</strong> {selectedOrderForTracking.address}, {selectedOrderForTracking.district}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 text-right dark:border-slate-800">
                  <button
                    onClick={() => setSelectedOrderForTracking(null)}
                    className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-red-500">
                Unable to load delivery status. Please verify your Steadfast API Keys in Admin Shipping settings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 3: VIEW ORDER ITEMS ================= */}
      {selectedOrderForItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Order Items — #{selectedOrderForItems.id}
              </h3>
              <button
                onClick={() => setSelectedOrderForItems(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              {parseOrderItems(selectedOrderForItems.items).map((item: any, idx: number) => (
                <div key={idx} className="pt-2 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.title || item.name || "Product"}</p>
                    <p className="text-slate-500">Qty: {item.quantity || 1} x BDT {item.price || 0}</p>
                  </div>
                  <p className="font-mono font-bold text-emerald-600">
                    BDT {((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3 flex justify-between font-bold text-xs dark:border-slate-800">
              <span className="text-slate-900 dark:text-white">Total Order Amount:</span>
              <span className="text-emerald-600 font-mono">BDT {Number(selectedOrderForItems.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
