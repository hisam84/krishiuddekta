"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface InventoryProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: { maxVariantPrice: { amount: string } };
  featuredImage: { url: string };
  availableForSale: boolean;
  stockQuantity?: number;
  minStockLevel?: number;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStock, setEditingStock] = useState<{ [id: string]: number }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        const stockMap: { [id: string]: number } = {};
        (data.products || []).forEach((p: InventoryProduct) => {
          stockMap[p.id] = p.stockQuantity !== undefined ? p.stockQuantity : 50;
        });
        setEditingStock(stockMap);
      }
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id: string, qty: number) => {
    setEditingStock((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  const handleSaveStock = async (p: InventoryProduct) => {
    const qty = editingStock[p.id];
    if (qty === undefined) return;

    setUpdatingId(p.id);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          stock_quantity: qty,
          available: qty > 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Updated stock for ${p.title}`);
        fetchInventory();
      } else {
        toast.error("Failed to update stock");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailable = async (p: InventoryProduct) => {
    setUpdatingId(p.id);
    try {
      const newStatus = !p.availableForSale;
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          stock_quantity: editingStock[p.id] ?? 50,
          available: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Updated status for ${p.title}`);
        fetchInventory();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-300 pb-3 gap-3 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-neutral-500">
            Monitor product stock quantities, set low-stock thresholds, and manage in-stock status
          </p>
        </div>

        <input
          type="text"
          placeholder="Filter products by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading inventory records...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No products found matching "{searchQuery}".</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock Quantity</th>
                <th className="px-4 py-3 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredProducts.map((p) => {
                const stockVal = editingStock[p.id];
                const currentQty = stockVal !== undefined ? stockVal : (p.stockQuantity ?? 50);
                const isLowStock = currentQty <= (p.minStockLevel || 5) && currentQty > 0;
                const isOutOfStock = currentQty === 0 || !p.availableForSale;

                return (
                  <tr key={p.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.featuredImage?.url}
                          alt={p.title}
                          className="h-10 w-10 rounded object-cover border border-neutral-200"
                        />
                        <div>
                          <p className="font-bold text-[#2271b1] dark:text-blue-400">{p.title}</p>
                          <p className="font-mono text-[10px] text-neutral-400">/{p.handle}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      BDT {Number(p.priceRange.maxVariantPrice.amount).toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleAvailable(p)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition ${
                          isOutOfStock
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            : isLowStock
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock Alert" : "In Stock"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockChange(p.id, (currentQty || 0) - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border bg-neutral-100 font-bold hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                          className="w-16 rounded border border-neutral-300 bg-white p-1 text-center font-mono font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                        <button
                          onClick={() => handleStockChange(p.id, (currentQty || 0) + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border bg-neutral-100 font-bold hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSaveStock(p)}
                        disabled={updatingId === p.id}
                        className="rounded border border-[#2271b1] bg-[#2271b1] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                      >
                        {updatingId === p.id ? "Saving..." : "Save Stock"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
