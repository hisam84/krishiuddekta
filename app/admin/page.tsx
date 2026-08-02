import Link from "next/link";
import { getDbOrders, getDbProducts } from "lib/db/products";

export default async function AdminDashboard() {
  const products = await getDbProducts();
  const orders = await getDbOrders();

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          স্বাগতম, কৃষি উদ্যোক্তা এডমিন! 🌾
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          এখান থেকে আপনার ই-কমার্স স্টোরের পণ্য ও অর্ডার পরিচালনা করুন।
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase text-neutral-500">মোট পণ্য (Products)</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {products.length} টি
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-xs font-semibold text-emerald-600 hover:underline"
          >
            পণ্যগুলো দেখুন ➔
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase text-neutral-500">মোট অর্ডার (Orders)</p>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {orders.length} টি
          </p>
          <p className="mt-1 text-xs text-amber-600">পেন্ডিং অর্ডার: {pendingOrders} টি</p>
          <Link
            href="/admin/orders"
            className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
          >
            অর্ডারসমূহ দেখুন ➔
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase text-neutral-500">মোট সেলস (Revenue)</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
            ৳ {totalRevenue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">ক্যাশ অন ডেলিভারিসহ</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">🌱 নতুন পণ্য যোগ করুন</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            বীজ, সার বা কৃষি যন্ত্রপাতি যুক্ত করতে প্রোডাক্ট ম্যানেজার ব্যবহার করুন।
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            পণ্য ম্যানেজার খুলুন
          </Link>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900 dark:bg-blue-950/20">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">📦 কাস্টমার অর্ডার প্রসেস</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            কাস্টমারের ফোন নাম্বার, ঠিকানা ও ডেলিভারি স্ট্যাটাস চেক করুন।
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            অর্ডার ম্যানেজার খুলুন
          </Link>
        </div>
      </div>
    </div>
  );
}
