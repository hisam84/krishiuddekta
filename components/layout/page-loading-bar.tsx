"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PageLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset loading state when pathname or searchParams change (page finished loading)
  useEffect(() => {
    setIsLoading(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept link clicks across the site to trigger the loading screen immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.hasAttribute("download") &&
        target.target !== "_blank"
      ) {
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setIsLoading(true);
          setProgress(30);

          const interval = setInterval(() => {
            setProgress((prev) => (prev >= 85 ? prev : prev + 10));
          }, 150);

          setTimeout(() => clearInterval(interval), 3000);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1.5 w-full bg-emerald-100/50 dark:bg-neutral-800">
        <div
          className="h-full bg-emerald-600 shadow-[0_0_10px_#059669] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Full Page Navigation Loading Screen Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs transition duration-200 dark:bg-black/70">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-neutral-700 dark:border-t-emerald-500" />
            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 animate-pulse">
              Loading Krishi Uddokta...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
