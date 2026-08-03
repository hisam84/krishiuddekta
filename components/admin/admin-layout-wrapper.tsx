"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import LogoIcon from "components/icons/logo";
import { AdminLogoutButton } from "components/admin/logout-button";

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc] flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/media", label: "Media Library" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/shipping", label: "Shipping Classes" },
    { href: "/admin/settings", label: "Site Settings & Hero" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc]">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-50 flex h-12 w-full items-center justify-between bg-[#1d2327] px-4 text-xs text-white shadow">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center rounded p-1.5 text-neutral-300 hover:bg-[#2271b1] hover:text-white cursor-pointer"
            aria-label="Toggle Mobile Admin Menu"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              )}
            </svg>
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-white hover:text-emerald-400"
          >
            <LogoIcon className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Krishi Uddokta Admin</span>
            <span className="sm:hidden font-mono text-[11px]">Admin</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 text-neutral-300 hover:text-white sm:flex"
          >
            <span>Visit Store ↗</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-1 rounded bg-[#2271b1] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#135e96]"
          >
            <span>+ Add Product</span>
          </Link>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-48px)]">
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:block w-56 flex-none border-r border-[#2c3338] bg-[#1d2327] text-sm text-[#f0f6fc]">
          <div className="py-3">
            <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Admin Navigation
            </div>

            <nav className="space-y-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-2.5 font-medium transition ${
                      isActive
                        ? "bg-[#2271b1] text-white font-bold"
                        : "text-neutral-300 hover:bg-[#2271b1]/80 hover:text-white"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-64 flex-col bg-[#1d2327] p-4 text-white shadow-2xl z-50">
              <div className="mb-4 flex items-center justify-between border-b border-neutral-700 pb-2">
                <span className="font-bold text-sm text-emerald-400">Admin Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-neutral-400 hover:text-white font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-[#2271b1] text-white"
                          : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-neutral-800 pt-4">
                <Link
                  href="/"
                  target="_blank"
                  className="block text-center rounded border border-neutral-700 py-2 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  Visit Store Front ↗
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area (Responsive Padding & Scrollable Tables) */}
        <main className="flex-1 min-w-0 bg-[#f0f0f1] p-3 sm:p-6 text-[#2c3338] dark:bg-[#101517] dark:text-[#f0f6fc]">
          <div className="mx-auto max-w-6xl overflow-x-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
