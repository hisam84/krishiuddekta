import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

const SITE_NAME = process.env.SITE_NAME || "Krishi Uddokta";

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <>
      {/* Ghorer Bazar Style Top Announcement Bar */}
      <div className="bg-emerald-700 text-white text-xs py-2 px-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-medium">
          <div className="flex items-center gap-4">
            <span>📞 Helpline: <strong className="font-bold">01700-000000</strong></span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">🚚 Nationwide Cash on Delivery Available</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded bg-emerald-800 px-2 py-0.5 text-[11px] hover:bg-emerald-900 transition font-semibold">
              Admin Login ➔
            </Link>
          </div>
        </div>
      </div>

      <nav className="relative flex items-center justify-between p-4 lg:px-6 border-b border-emerald-100 bg-white/95 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur">
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
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>
          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
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
