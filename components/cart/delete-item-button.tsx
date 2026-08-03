"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import type { CartItem } from "lib/shopify/types";

export function DeleteItemButton({
  item,
  optimisticUpdate,
  showText = false,
}: {
  item: CartItem;
  optimisticUpdate: any;
  showText?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Remove item from cart"
      onClick={() => optimisticUpdate(item.merchandise.id, "delete")}
      className={
        showText
          ? "inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-800 cursor-pointer"
          : "flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-800 cursor-pointer shadow-xs"
      }
    >
      <TrashIcon className="h-4 w-4 flex-none" />
      {showText && <span>Remove</span>}
    </button>
  );
}
