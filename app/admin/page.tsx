import Link from "next/link";
import { getDbOrders, getDbProducts } from "lib/db/products";

export default async function AdminDashboard() {
  const products = await getDbProducts();
  const orders = await getDbOrders();

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* WordPress Welcome Banner */}
      <div className="rounded-lg border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              ওয়ার্ডপ্রেস ড্যাশবোর্ডে স্বাগতম! 🌾
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              আমরা **কৃষি উদ্যোক্তা** ই-কমার্স স্টোর পরিচালনার জন্য আপনার সব টুলস প্রস্তুত করে রেখেছি।
            </p>
          </div>
          <Link
            href="/admin/products"
            className="inline-block rounded border border-[#2271b1] bg-[#2271b1] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#135e96]"
          >
            + নতুন কৃষি পণ্য যোগ করুন
          </Link>
        </div>
      </div>

      {/* WordPress Dashboard Grid Widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Widget 1: At a Glance (এক পলকে) */}
        <div className="rounded-lg border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3 font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
            📊 এক পলকে (At a Glance)
          </div>
          <div className="p-5">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="flex items-center gap-2">
                  <span>📦</span> <strong>মোট প্রডাক্ট (Products):</strong>
                </span>
                <span className="rounded bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {products.length} টি
                </span>
              </li>
              <li className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="flex items-center gap-2">
                  <span>🛒</span> <strong>মোট কাস্টমার অর্ডার:</strong>
                </span>
                <span className="rounded bg-blue-100 px-2.5 py-0.5 font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {orders.length} টি
                </span>
              </li>
              <li className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="flex items-center gap-2">
                  <span>🟡</span> <strong>পেন্ডিং অর্ডার (Pending):</strong>
                </span>
                <span className="rounded bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {pendingOrders} টি
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>💰</span> <strong>মোট রেভিনিউ (Revenue):</strong>
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  ৳ {totalRevenue.toFixed(2)}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Widget 2: Recent Activity (সাম্প্রতিক আপডেট) */}
        <div className="rounded-lg border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3 font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
            ⚡ সাম্প্রতিক অ্যাক্টিভিটি (Recent Orders)
          </div>
          <div className="p-5">
            {orders.length === 0 ? (
              <p className="text-sm text-neutral-500">এখনও কোনো অর্ডার আসেনি।</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 4).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-800/40"
                  >
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white">{o.customer_name}</p>
                      <p className="text-neutral-500">{o.customer_phone} - {o.district}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">৳ {Number(o.total_amount || 0).toFixed(2)}</p>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800 text-[10px]">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
