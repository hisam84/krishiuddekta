import Link from "next/link";
import { ReactNode } from "react";
import LogoIcon from "components/icons/logo";

export const metadata = {
  title: "এডমিন প্যানেল | কৃষি উদ্যোক্তা",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <LogoIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <Link href="/admin" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                কৃষি উদ্যোক্তা <span className="text-xs font-normal text-neutral-500">(এডমিন কন্ট্রোল)</span>
              </Link>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/admin/products"
              className="rounded-lg px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
            >
              🌱 পণ্যসমূহ
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-lg px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
            >
              📦 অর্ডারসমূহ
            </Link>
            <Link
              href="/"
              target="_blank"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              🌐 প্রধান ওয়েবসাইট
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
