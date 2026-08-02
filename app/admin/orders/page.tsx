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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      toast.error("অর্ডার রিড করতে সমস্যা হয়েছে");
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
        toast.success("অর্ডার স্ট্যাটাস আপডেট হয়েছে");
        fetchOrders();
      } else {
        toast.error("স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার এরর");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          📦 কাস্টমার অর্ডারসমূহ (Order Manager)
        </h1>
        <p className="text-sm text-neutral-500">
          গ্রাহকদের ফোন নম্বর, ডেলিভারি ঠিকানা এবং ক্যাশ অন ডেলিভারি অর্ডারের স্ট্যাটাস দেখুন
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          অর্ডারসমূহ লোড হচ্ছে...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">এখনও কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50">
                <tr>
                  <th className="px-6 py-4">অর্ডার আইডি</th>
                  <th className="px-6 py-4">গ্রাহকের নাম ও ফোন</th>
                  <th className="px-6 py-4">ঠিকানা ও জেলা</th>
                  <th className="px-6 py-4">মোট টাকা</th>
                  <th className="px-6 py-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {o.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900 dark:text-white">{o.customer_name}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">📞 {o.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 text-xs">{o.address}</p>
                      <span className="mt-0.5 inline-block rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        জেলা: {o.district}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ৳ {Number(o.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                      >
                        <option value="Pending">🟡 পেন্ডিং (Pending)</option>
                        <option value="Processing">🔵 প্রসেসিং (Processing)</option>
                        <option value="Completed">🟢 সম্পন্ন (Completed)</option>
                        <option value="Cancelled">🔴 বাতিল (Cancelled)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
