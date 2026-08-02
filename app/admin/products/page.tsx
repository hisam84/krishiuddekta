"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProductItem {
  id: string;
  handle: string;
  title: string;
  description: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  discountPrice?: number;
  featuredImage: { url: string; altText: string };
  tags: string[];
  badge?: string;
  availableForSale: boolean;
  updatedAt?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [badge, setBadge] = useState("Best Seller");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("seeds");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      toast.error("Product title and price are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          discount_price: discountPrice ? Number(discountPrice) : undefined,
          badge,
          image_url: imageUrl,
          category,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("New product published successfully!");
        setShowModal(false);
        setTitle("");
        setDescription("");
        setPrice("");
        setDiscountPrice("");
        setImageUrl("");
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to save product");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product moved to trash");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* WordPress Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Products
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="rounded border border-[#2271b1] bg-[#f6f7f7] px-3 py-1 text-xs font-semibold text-[#2271b1] transition hover:bg-[#2271b1] hover:text-white dark:bg-neutral-800 dark:text-blue-400"
          >
            + Add New
          </button>
        </div>

        {/* WordPress Search Box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* WordPress Subsubsub Navigation */}
      <div className="text-xs text-neutral-500">
        <span className="font-bold text-neutral-900 dark:text-white">All ({products.length})</span> |{" "}
        <span className="text-[#2271b1]">Published ({products.length})</span> |{" "}
        <span className="text-neutral-400">Trash (0)</span>
      </div>

      {/* WordPress Data Table */}
      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading products from database...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No products found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Stock Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                  <td className="px-4 py-2.5">
                    <div className="h-10 w-10 overflow-hidden rounded border border-neutral-200 bg-neutral-100 dark:border-neutral-700">
                      {p.featuredImage?.url ? (
                        <img
                          src={p.featuredImage.url}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                          No Img
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-bold text-[#2271b1] hover:underline dark:text-blue-400">
                      {p.title}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-neutral-500">{p.description}</p>
                  </td>
                  <td className="px-4 py-2.5 capitalize">
                    <span className="rounded bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {p.tags?.[0] || "General"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    BDT {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {p.badge || "100% Organic"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.availableForSale ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        In Stock
                      </span>
                    ) : (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                    >
                      Trash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WordPress Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-neutral-300 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <h2 className="text-base font-bold text-[#1d2327] dark:text-white">
                Add New Product
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Yield Tomato Seeds (50g)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                    Original Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                    Discount Price (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 290"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="seeds">Seeds & Saplings</option>
                    <option value="fertilizer">Fertilizers</option>
                    <option value="tools">Agro Tools</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller / 100% Organic"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Product specifications and features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 rounded border border-neutral-300 py-2 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-semibold text-white transition hover:bg-[#135e96] disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
