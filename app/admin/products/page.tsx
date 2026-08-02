"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProductItem {
  id: string;
  handle: string;
  title: string;
  description: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  featuredImage: { url: string; altText: string };
  tags: string[];
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
      toast.error("পণ্য রিড করতে সমস্যা হয়েছে");
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
      toast.error("পণ্যের নাম ও দাম লিখুন");
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
          image_url: imageUrl,
          category,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("নতুন পণ্য সফলভাবে প্রকাশিত হয়েছে!");
        setShowModal(false);
        setTitle("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        fetchProducts();
      } else {
        toast.error(data.message || "পণ্য সেভ করা সম্ভব হয়নি");
      }
    } catch (err) {
      toast.error("সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`আপনি কি সত্যিই "${productTitle}" মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("পণ্য ট্র্যাশে পাঠানো হয়েছে");
        fetchProducts();
      } else {
        toast.error("মুছে ফেলতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার এরর");
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
            পণ্যসমূহ (Products)
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="rounded border border-[#2271b1] bg-[#f6f7f7] px-3 py-1 text-xs font-semibold text-[#2271b1] transition hover:bg-[#2271b1] hover:text-white dark:bg-neutral-800 dark:text-blue-400"
          >
            + নতুন যোগ করুন (Add New)
          </button>
        </div>

        {/* WordPress Search Box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* WordPress Subsubsub Navigation */}
      <div className="text-xs text-neutral-500">
        <span className="font-bold text-neutral-900 dark:text-white">সবকটি ({products.length})</span> |{" "}
        <span className="text-[#2271b1]">প্রকাশিত ({products.length})</span> |{" "}
        <span className="text-neutral-400">ট্র্যাশ (0)</span>
      </div>

      {/* WordPress Data Table */}
      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          ওয়ার্ডপ্রেস ডাটাবেজ থেকে পণ্য লোড হচ্ছে...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">কোনো পণ্য পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">ছবি</th>
                <th className="px-4 py-3">পণ্যের নাম (Title)</th>
                <th className="px-4 py-3">ক্যাটাগরি</th>
                <th className="px-4 py-3">মূল্য (Price)</th>
                <th className="px-4 py-3">স্টক স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">অ্যাকশন (Actions)</th>
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
                    ৳ {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5">
                    {p.availableForSale ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        In Stock (মজুদ আছে)
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
                      Trash (মুছুন)
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
          <div className="w-full max-w-lg rounded-lg border border-neutral-300 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <h2 className="text-base font-bold text-[#1d2327] dark:text-white">
                🌱 নতুন পণ্য যোগ করুন (Add New Product)
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
                  পণ্যের নাম (Product Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হাইব্রিড টমেটো বীজ (৫০ গ্রাম)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                  মূল্য (Price in BDT ৳) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: ৩৫০"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                  ক্যাটাগরি (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="seeds">বীজ ও চারা (Seeds)</option>
                  <option value="fertilizer">সার (Fertilizers)</option>
                  <option value="tools">কৃষি যন্ত্রপাতি (Tools)</option>
                  <option value="general">সাধারণ (General)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                  ছবি (Image URL)
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
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="পণ্যের বৈশিষ্ট্য ও বিবরণ..."
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
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-semibold text-white transition hover:bg-[#135e96] disabled:opacity-50"
                >
                  {submitting ? "প্রকাশিত হচ্ছে..." : "প্রকাশ করুন (Publish) ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
