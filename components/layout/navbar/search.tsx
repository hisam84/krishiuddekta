"use client";

import { useEffect, useState, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProductSuggestion {
  id: string;
  handle: string;
  title: string;
  priceRange: { minVariantPrice: { amount: string } };
  featuredImage: { url: string };
}

export default function Search() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      fetch(`/api/admin/products`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products)) {
            const matches = data.products.filter((p: ProductSuggestion) =>
              p.title.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(matches.slice(0, 5));
            setShowDropdown(true);
          }
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full lg:w-80 xl:w-full" ref={dropdownRef}>
      <Form action="/search" className="w-full">
        <div className="relative w-full">
          <input
            key={searchParams?.get("q")}
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length > 1 && setShowDropdown(true)}
            placeholder="Search for products..."
            autoComplete="off"
            className="text-md w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-black placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none md:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          />
          <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
            <MagnifyingGlassIcon className="h-4 text-neutral-500" />
          </div>
        </div>
      </Form>

      {/* Real-time Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-[75vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Suggested Products ({suggestions.length})
          </div>
          {suggestions.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.handle}`}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-emerald-50 dark:hover:bg-neutral-800/80"
            >
              <img
                src={item.featuredImage?.url}
                alt={item.title}
                className="h-10 w-10 flex-none rounded-lg object-cover border border-neutral-100 dark:border-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-neutral-900 line-clamp-1 dark:text-white">
                  {item.title}
                </p>
                <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  BDT {Number(item.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setShowDropdown(false)}
            className="block rounded-xl bg-neutral-50 p-2 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition dark:bg-neutral-800 dark:text-emerald-400"
          >
            See all matching results for "{query}"
          </Link>
        </div>
      )}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <form className="w-max-[550px] relative w-full lg:w-80 xl:w-full">
      <input
        placeholder="Search for products..."
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4" />
      </div>
    </form>
  );
}
