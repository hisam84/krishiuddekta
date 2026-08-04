import type { Metadata } from "next";
import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { NavbarWrapper } from "components/layout/navbar-wrapper";
import { PageLoadingIndicator } from "components/layout/page-loading-bar";
import { WelcomeToast } from "components/welcome-toast";
import { GeistSans } from "geist/font/sans";
import { Suspense, ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";

const SITE_NAME = process.env.SITE_NAME || "Krishi Uddokta";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cartPromise = Promise.resolve(undefined);

  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <link rel="icon" href="/api/site-favicon" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <CartProvider cartPromise={cartPromise}>
          <Suspense fallback={null}>
            <PageLoadingIndicator />
          </Suspense>
          <NavbarWrapper>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
          </NavbarWrapper>
          <main>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
