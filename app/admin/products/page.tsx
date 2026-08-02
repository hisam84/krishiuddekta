"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state for adding new product
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
        toast.success("নতুন পণ্য যোগ করা হয়েছে!");
        setShowModal(false);
        setTitle("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        fetchProducts();
      } else {
        toast.error(data.message || "পণ্য যোগ করা সম্ভব হয়নি");
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
        toast.success("পণ্য মুছে ফেলা হয়েছে");
        fetchProducts();
      } else {
        toast.error("মুছে ফেলতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার এরর");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            🌱 পণ্যসমূহ (Product Manager)
          </h1>
          <p className="text-sm text-neutral-500">
            আপনার কৃষি উদ্যোক্তা শপের নতুন পণ্য যোগ করুন বা বিদ্যমান পণ্য সম্পাদনা করুন
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700 shadow-md"
        >
          + নতুন পণ্য যোগ করুন
        </button>
      </div>

      {/* Product List Table */}
      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          পণ্য লোড হচ্ছে...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">কোনো পণ্য পাওয়া যায়নি</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-sm font-semibold text-emerald-600 hover:underline"
          >
            প্রথম পণ্য যোগ করুন ➔
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50">
                <tr>
                  <th className="px-6 py-4">ছবি ও নাম</th>
                  <th className="px-6 py-4">ক্যাটাগরি</th>
                  <th className="px-6 py-4">মূল্য (Price)</th>
                  <th className="px-6 py-4">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="flex items-center gap-4 px-6 py-4">
                      <div className="relative h-12 w-12 flex-none overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                        {p.featuredImage?.url ? (
                          <img
                            src={p.featuredImage.url}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{p.title}</p>
                        <p className="line-clamp-1 text-xs text-neutral-400">{p.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase">
                      <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {p.tags?.[0] || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ৳ {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {p.availableForSale ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          মজুদ আছে (Stock)
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          স্টক শেষ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                      >
                        মুছে ফেলুন (Delete)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                🌱 নতুন কৃষি পণ্য যোগ করুন
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
                  পণ্যের নাম (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হাইব্রিড টমেটো বীজ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
                  মূল্য (Price in BDT ৳) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: ৩৫০"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
                  ক্যাটাগরি (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <option value="seeds">বীজ ও চারা (Seeds & Plants)</option>
                  <option value="fertilizer">সার (Fertilizers)</option>
                  <option value="tools">কৃষি যন্ত্রপাতি (Tools)</option>
                  <option value="general">সাধারণ (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
                  ছবি (Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="পণ্যের বৈশিষ্ট্য ও ব্যবহার বিধি লিখুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 rounded-xl border border-neutral-300 py-2.5 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "সেভ হচ্ছে..." : "পণ্য সেভ করুন ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
