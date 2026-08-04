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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
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
    { href: "/admin/shipping", label: "Shipping & Delivery" },
    { href: "/admin/settings", label: "Settings & Hero" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Modern SaaS Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            aria-label="Toggle Mobile Navigation"
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
            className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-90 transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <LogoIcon className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline text-sm">Krishi Uddokta Console</span>
            <span className="sm:hidden font-mono text-xs">Console</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 text-xs text-slate-400 hover:text-white transition sm:flex font-medium"
          >
            <span>Storefront</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition cursor-pointer"
          >
            <span>+ Add Product</span>
          </Link>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-60 flex-none border-r border-slate-800/80 bg-slate-900/60 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
            Navigation
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold border-l-2 border-emerald-500 pl-2.5 shadow-xs"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-64 flex-col bg-slate-900 p-5 text-slate-100 shadow-2xl z-50 border-r border-slate-800">
              <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-emerald-400">Admin Console</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
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
                      className={`block rounded-lg px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? "bg-slate-800 text-white font-bold border-l-2 border-emerald-500 pl-2.5"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-slate-800 pt-4">
                <Link
                  href="/"
                  target="_blank"
                  className="block text-center rounded-lg border border-slate-800 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  View Live Storefront ↗
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-slate-950 p-4 sm:p-6 text-slate-100">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
