"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import LogoIcon from "components/icons/logo";
import { AdminLogoutButton } from "components/admin/logout-button";

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc] flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc]">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-50 flex h-10 w-full items-center justify-between bg-[#1d2327] px-4 text-xs text-white shadow">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-white hover:text-emerald-400"
          >
            <LogoIcon className="h-4 w-4 text-emerald-400" />
            <span>Krishi Uddokta Admin</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 text-neutral-300 hover:text-white sm:flex"
          >
            <span>Visit Store</span>
          </Link>

          <Link
            href="/admin/products"
            className="hidden items-center gap-1 rounded bg-[#2271b1] px-2 py-0.5 font-medium text-white hover:bg-[#135e96] sm:flex"
          >
            <span>+ Add New Product</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-neutral-300">
            Howdy, <strong className="text-white">Admin</strong>
          </span>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-40px)]">
        {/* Dark Left Sidebar */}
        <aside className="w-56 flex-none border-r border-[#2c3338] bg-[#1d2327] text-sm text-[#f0f6fc]">
          <div className="py-2">
            <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Admin Menu
            </div>

            <nav className="space-y-0.5">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Products</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Orders</span>
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Categories</span>
              </Link>

              <Link
                href="/admin/pages"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Pages (Rich Text)</span>
              </Link>

              <Link
                href="/admin/shipping"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Shipping Classes</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-2.5 font-medium text-neutral-200 transition hover:bg-[#2271b1] hover:text-white"
              >
                <span>Site Settings & Hero</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#f0f0f1] p-6 text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc]">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
