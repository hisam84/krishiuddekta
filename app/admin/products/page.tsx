"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProductItem {
  id: string;
  handle: string;
  title: string;
  description: string;
  shortDescription?: string;
  shippingClassId?: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  discountPrice?: number;
  featuredImage: { url: string; altText: string };
  tags: string[];
  badge?: string;
  availableForSale: boolean;
  updatedAt?: string;
}

interface CategoryItem {
  id: string;
  handle: string;
  title: string;
  description?: string;
}

interface ShippingClassItem {
  id: string;
  name: string;
  slug: string;
  cost: number;
  description?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [shippingClasses, setShippingClasses] = useState<ShippingClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [badge, setBadge] = useState("Best Seller");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("seeds");
  const [shippingClassId, setShippingClassId] = useState("sc-standard");
  const [available, setAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, shipRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/shipping"),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const shipData = await shipRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) setCategories(catData.categories || []);
      if (shipData.success) setShippingClasses(shipData.shippingClasses || []);
    } catch (err) {
      toast.error("Failed to load products and settings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setTitle("");
    setShortDescription("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setBadge("Best Seller");
    setImageUrl("");
    setCategory(categories[0]?.handle || "seeds");
    setShippingClassId(shippingClasses[0]?.id || "sc-standard");
    setAvailable(true);
  };

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
          short_description: shortDescription,
          price: Number(price),
          discount_price: discountPrice ? Number(discountPrice) : undefined,
          badge,
          image_url: imageUrl,
          category,
          shipping_class_id: shippingClassId,
          available,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("New product published successfully!");
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        toast.error(data.message || "Failed to save product");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setTitle(product.title);
    setShortDescription(product.shortDescription || "");
    setDescription(product.description || "");
    setPrice(product.priceRange?.minVariantPrice?.amount || "");
    setDiscountPrice(product.discountPrice ? String(product.discountPrice) : "");
    setBadge(product.badge || "Best Seller");
    setImageUrl(product.featuredImage?.url || "");
    setCategory(product.tags?.[0] || "general");
    setShippingClassId(product.shippingClassId || "sc-standard");
    setAvailable(product.availableForSale);
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !title || !price) {
      toast.error("Product title and price are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          title,
          description,
          short_description: shortDescription,
          price: Number(price),
          discount_price: discountPrice ? Number(discountPrice) : undefined,
          badge,
          image_url: imageUrl,
          category,
          shipping_class_id: shippingClassId,
          available,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Product updated successfully!");
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        toast.error(data.message || "Failed to update product");
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
        fetchData();
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
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Products
          </h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="rounded border border-[#2271b1] bg-[#f6f7f7] px-3 py-1 text-xs font-semibold text-[#2271b1] transition hover:bg-[#2271b1] hover:text-white dark:bg-neutral-800 dark:text-blue-400 cursor-pointer"
          >
            + Add New Product
          </button>
        </div>

        {/* Search Box */}
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

      {/* Subsubsub Navigation */}
      <div className="text-xs text-neutral-500">
        <span className="font-bold text-neutral-900 dark:text-white">All ({products.length})</span> |{" "}
        <span className="text-[#2271b1]">Published ({products.length})</span>
      </div>

      {/* Products Data Table */}
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
                <th className="px-4 py-3">Product Title & Short Description</th>
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
                    {p.shortDescription && (
                      <p className="line-clamp-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        {p.shortDescription}
                      </p>
                    )}
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
                      >
                        Trash
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WordPress-Style Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-lg border border-neutral-300 bg-[#f0f0f1] p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517] max-h-[92vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-300 pb-3 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-[#1d2327] dark:text-white">
                {editingProduct ? "Edit Product" : "Add New Product"} — WordPress Editor
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-[#1d2327] font-bold text-lg hover:text-rose-600 dark:text-neutral-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdate : handleAddProduct} className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-xs">
              {/* Left Column: Title, Short Description, Main Description, Product Data Box */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter product title here..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white px-4 py-3 text-base font-bold text-[#1d2327] placeholder:text-neutral-400 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                {/* Product Short Description Input */}
                <div className="rounded border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <label className="block font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                    Product Short Description (Quick Highlights)
                  </label>
                  <p className="text-[11px] text-neutral-500 mb-2">
                    Appears directly below product title on main product pages & search listings.
                  </p>
                  <textarea
                    rows={2}
                    placeholder="e.g. 100% Organic, high germination rate above 95%, suitable for roof gardening..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-2.5 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                {/* Main Product Description Editor Box */}
                <div className="rounded border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    Detailed Product Description
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Add detailed product description, usage instructions, specifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-3 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                {/* Product Data Meta Box */}
                <div className="rounded border border-neutral-300 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="border-b border-neutral-200 bg-[#f6f7f7] px-4 py-2.5 font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    Product Pricing & Shipping Settings
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Regular Price (in BDT) *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 350"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Sale / Discount Price (BDT)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 290"
                          value={discountPrice}
                          onChange={(e) => setDiscountPrice(e.target.value)}
                          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Shipping Class Selection Dropdown */}
                    <div>
                      <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Shipping Class (Delivery Fee Rule) *
                      </label>
                      <select
                        value={shippingClassId}
                        onChange={(e) => setShippingClassId(e.target.value)}
                        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 font-semibold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      >
                        {shippingClasses.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name} — BDT {sc.cost.toFixed(2)} ({sc.description || "Custom fee"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Badge Tag Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Best Seller / 100% Organic"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Publish Box, Category Box, Featured Image Box */}
              <div className="space-y-4">
                {/* 1. Publish Box */}
                <div className="rounded border border-neutral-300 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="border-b border-neutral-200 bg-[#f6f7f7] px-4 py-2.5 font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    Publish Status
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-600">Published</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Stock Availability:</span>
                      <select
                        value={available ? "true" : "false"}
                        onChange={(e) => setAvailable(e.target.value === "true")}
                        className="rounded border border-neutral-300 bg-white px-2 py-1 font-bold text-neutral-800 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>

                    <div className="border-t pt-3 flex gap-2 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => { setShowModal(false); resetForm(); }}
                        className="w-1/2 rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-bold text-white shadow transition hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? (editingProduct ? "Updating..." : "Publishing...") : (editingProduct ? "Update" : "Publish")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Product Categories Box (Dynamic from DB) */}
                <div className="rounded border border-neutral-300 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="border-b border-neutral-200 bg-[#f6f7f7] px-4 py-2.5 font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    Product Category
                  </div>
                  <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-neutral-400 italic">No categories created yet.</p>
                    ) : (
                      categories.map((c) => (
                        <label key={c.handle} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={c.handle}
                            checked={category === c.handle}
                            onChange={(e) => setCategory(e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {c.title}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Featured Image Box */}
                <div className="rounded border border-neutral-300 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="border-b border-neutral-200 bg-[#f6f7f7] px-4 py-2.5 font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    Product Image (File Select)
                  </div>
                  <div className="p-4 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full rounded border border-neutral-300 bg-white p-2 text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer"
                    />

                    {imageUrl ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                        <img src={imageUrl} alt="Featured Preview" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-400 italic">No image selected. Click button above to choose file from computer.</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
