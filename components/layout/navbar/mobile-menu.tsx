"use client";

import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Menu } from "lib/shopify/types";

export default function MobileMenu({ menu }: { menu: Menu[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Open mobile navigation menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 cursor-pointer"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-xs"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-xs"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 top-0 flex h-full w-4/5 max-w-xs flex-col bg-white p-5 shadow-2xl dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <span className="font-bold text-base text-emerald-700 dark:text-emerald-400">
                  Menu Navigation
                </span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 cursor-pointer"
                  onClick={closeMobileMenu}
                  aria-label="Close mobile menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 flex-1 overflow-y-auto">
                {menu && menu.length > 0 ? (
                  <ul className="flex flex-col space-y-1">
                    {menu.map((item: Menu) => {
                      const isActive = pathname === item.path;
                      return (
                        <li key={item.title}>
                          <Link
                            href={item.path}
                            prefetch={true}
                            onClick={closeMobileMenu}
                            className={`block rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            }`}
                          >
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="py-4 text-xs text-neutral-400">No menu items configured.</div>
                )}
              </nav>

              <div className="mt-auto border-t border-neutral-200 pt-4 dark:border-neutral-800 space-y-2 text-xs">
                <Link
                  href="/search"
                  onClick={closeMobileMenu}
                  className="block rounded-lg bg-emerald-600 py-2.5 text-center font-bold text-white hover:bg-emerald-700 transition"
                >
                  Browse All Products
                </Link>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
