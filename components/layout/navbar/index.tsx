import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import { getDbSettings } from "lib/db/products";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

export async function Navbar() {
  const [menu, settings] = await Promise.all([
    getMenu("next-js-frontend-header-menu"),
    getDbSettings(),
  ]);

  const siteName = settings.site_name || process.env.SITE_NAME || "Krishi Uddokta";
  const siteLogo = settings.site_logo;
  const helpline = settings.header_helpline || "+880 1604-649648";
  const announcement = settings.header_announcement || "সারাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery Available)";
  const headerBgColor = settings.header_bg_color || "emerald";

  const getAnnouncementBgClass = () => {
    switch (headerBgColor) {
      case "dark":
        return "bg-neutral-900 text-white";
      case "navy":
        return "bg-slate-900 text-white";
      case "orange":
        return "bg-orange-600 text-white";
      default:
        return "bg-emerald-700 text-white";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs">
      {/* Top Announcement Bar */}
      <div className={`${getAnnouncementBgClass()} text-xs py-1.5 px-3 sm:px-6 relative z-50 border-b border-black/10`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between font-medium">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <span className="flex items-center gap-1.5 shrink-0">
              <svg className="h-3.5 w-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Helpline: <a href="tel:+8801604649648" className="hover:underline"><strong className="font-bold">{helpline}</strong></a></span>
            </span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="truncate text-[11px] sm:text-xs opacity-90">{announcement}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/order-tracking"
              className="text-[11px] sm:text-xs hover:underline opacity-95 transition font-bold text-amber-200"
            >
              ট্রাক অর্ডার (Track Order)
            </Link>
            <span className="text-white/40">|</span>
            <Link
              href="/pages/delivery-charge"
              className="text-[11px] sm:text-xs hover:underline opacity-90 transition font-medium hidden sm:inline"
            >
              ডেলিভারি চার্জ
            </Link>
            <span className="hidden sm:inline text-white/40">|</span>
            <Link
              href="/pages/refund-policy"
              className="text-[11px] sm:text-xs hover:underline opacity-90 transition font-medium hidden sm:inline"
            >
              রিফান্ড পলিসি
            </Link>
            <span className="hidden sm:inline text-white/40">|</span>
            <Link
              href="/admin"
              className="rounded bg-black/20 px-2 py-0.5 text-[10px] sm:text-[11px] hover:bg-black/40 transition font-semibold"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav className="border-b border-emerald-100 bg-white/95 px-3 py-2.5 sm:px-6 lg:py-3 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="block md:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={menu} />
              </Suspense>
            </div>

            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-2 font-bold shrink-0"
            >
              {siteLogo ? (
                <div className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[260px] overflow-hidden flex items-center">
                  <img src={siteLogo} alt={siteName} className="h-full w-auto object-contain" />
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <LogoSquare />
                  <span className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white">
                    {siteName}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            {menu.length > 0 && (
              <ul className="hidden md:flex md:items-center gap-5 ml-4 text-xs lg:text-sm font-medium">
                {menu.map((item: Menu) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      prefetch={true}
                      className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 transition"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Center: Search Bar for Desktop & Tablet */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-md mx-4">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>

          {/* Right: Cart Modal Trigger */}
          <div className="flex items-center gap-2">
            <CartModal />
          </div>
        </div>

        {/* Mobile Search Bar Row (Full width search on mobile screens) */}
        <div className="mt-2.5 block md:hidden w-full">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
