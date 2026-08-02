"use client";

import { usePathname } from "next/navigation";

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide storefront Navbar on /admin and /checkout pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  return <>{children}</>;
}
