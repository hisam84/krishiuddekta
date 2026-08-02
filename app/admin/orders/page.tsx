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
  created_at?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");

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

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* Orders Page Header */}
      <div className="border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
          Orders
        </h1>
        <p className="text-xs text-neutral-500">
          Manage customer Cash on Delivery (COD) orders
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 text-xs font-semibold">
        <button
          onClick={() => setStatusFilter("All")}
          className={`rounded px-3 py-1 ${
            statusFilter === "All"
              ? "bg-[#2271b1] text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter("Pending")}
          className={`rounded px-3 py-1 ${
            statusFilter === "Pending"
              ? "bg-amber-600 text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Pending ({orders.filter((o) => o.status === "Pending").length})
        </button>
        <button
          onClick={() => setStatusFilter("Processing")}
          className={`rounded px-3 py-1 ${
            statusFilter === "Processing"
              ? "bg-blue-600 text-white"
              : "bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Processing ({orders.filter((o) => o.status === "Processing").length})
        </button>
        <button
          onClick={() => setStatusFilter("Completed")}
          className={`rounded px-3 py-1 ${
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
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No orders found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer & Phone</th>
                <th className="px-4 py-3">Address & District</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-mono font-bold text-[#2271b1] dark:text-blue-400">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-neutral-900 dark:text-white">{o.customer_name}</p>
                    <p className="text-emerald-700 dark:text-emerald-400">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 text-neutral-600 dark:text-neutral-300">{o.address}</p>
                    <span className="mt-0.5 inline-block rounded bg-neutral-100 px-1.5 py-0.5 font-semibold text-neutral-600 text-[10px] dark:bg-neutral-800 dark:text-neutral-400">
                      District: {o.district}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    BDT {Number(o.total_amount || 0).toFixed(2)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
