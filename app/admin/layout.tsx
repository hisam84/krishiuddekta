import Link from "next/link";
import { ReactNode } from "react";
import LogoIcon from "components/icons/logo";

export const metadata = {
  title: "ওয়ার্ডপ্রেস ড্যাশবোর্ড | কৃষি উদ্যোক্তা",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc]">
      {/* WordPress Classic Top Admin Bar */}
      <header className="sticky top-0 z-50 flex h-10 w-full items-center justify-between bg-[#1d2327] px-4 text-xs text-white shadow">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-white hover:text-emerald-400"
          >
            <LogoIcon className="h-4 w-4 text-emerald-400" />
            <span>কৃষি উদ্যোক্তা</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 text-neutral-300 hover:text-white sm:flex"
          >
            <span>🏠 ওয়েবসাইট দেখুন ↗</span>
          </Link>

          <Link
            href="/admin/products"
            className="hidden items-center gap-1 rounded bg-[#2271b1] px-2 py-0.5 font-medium text-white hover:bg-[#135e96] sm:flex"
          >
            <span>+ নতুন পণ্য</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-neutral-300">
            সালাম, <strong className="text-white">এডমিন 👤</strong>
          </span>
          <form action="/api/admin/login" method="DELETE">
            <button
              type="submit"
              className="text-neutral-400 hover:text-rose-400 hover:underline"
            >
              লগআউট (Logout)
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-40px)]">
        {/* WordPress Classic Dark Left Sidebar */}
        <aside className="w-56 flex-none border-r border-[#2c3338] bg-[#1d2327] text-sm text-[#f0f6fc]">
          <div className="py-2">
            <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              ওয়ার্ডপ্রেস নেভিগেশন
            </div>

            <nav className="space-y-0.5">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span className="text-base">📊</span>
                <span>ড্যাশবোর্ড</span>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span className="text-base">📦</span>
                <span>পণ্যসমূহ (Products)</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span className="text-base">🛒</span>
                <span>অর্ডারসমূহ (WooCommerce)</span>
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span className="text-base">🏷️</span>
                <span>ক্যাটাগরি (Categories)</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span className="text-base">⚙️</span>
                <span>সেটিংস (Settings)</span>
              </Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-[#2c3338] p-4 text-xs text-neutral-400">
            <p>ভার্সন: WordPress 6.7 / Neon Engine</p>
            <p className="mt-1">কৃষি উদ্যোক্তা v2.0</p>
          </div>
        </aside>

        {/* Main WordPress Content Area */}
        <main className="flex-1 bg-[#f0f0f1] p-6 text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc]">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
