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
  const helpline = settings.header_helpline || "01700-000000";
  const announcement = settings.header_announcement || "Nationwide Cash on Delivery Available";
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
    <>
      {/* Dynamic Announcement Bar */}
      <div className={`${getAnnouncementBgClass()} text-xs py-2 px-4 shadow-xs relative z-50`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between font-medium">
          <div className="flex items-center gap-4">
            <span>Helpline: <strong className="font-bold">{helpline}</strong></span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">{announcement}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded bg-black/20 px-2 py-0.5 text-[11px] hover:bg-black/40 transition font-semibold">
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Navbar with z-50 Stacking Context */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 lg:px-6 border-b border-emerald-100 bg-white/95 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur shadow-xs">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-center">
          <div className="flex w-full md:w-1/3">
            <Link
              href="/"
              prefetch={true}
              className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
            >
              {siteLogo ? (
                <div className="h-9 w-auto max-w-[160px] overflow-hidden flex items-center">
                  <img src={siteLogo} alt={siteName} className="h-full w-auto object-contain" />
                </div>
              ) : (
                <>
                  <LogoSquare />
                  <div className="ml-2 flex-none text-sm font-bold uppercase tracking-tight md:hidden lg:block text-neutral-900 dark:text-white">
                    {siteName}
                  </div>
                </>
              )}
            </Link>
            {menu.length ? (
              <ul className="hidden gap-6 text-sm md:flex md:items-center">
                {menu.map((item: Menu) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      prefetch={true}
                      className="text-neutral-600 font-medium underline-offset-4 hover:text-emerald-700 hover:underline dark:text-neutral-400 dark:hover:text-emerald-400"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="hidden justify-center md:flex md:w-1/3">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          <div className="flex justify-end md:w-1/3">
            <CartModal />
          </div>
        </div>
      </nav>
    </>
  );
}
