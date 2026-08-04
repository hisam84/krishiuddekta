"use client";

import React, { useEffect, useState } from "react";
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
  thumbnailUrl?: string;
  galleryImages?: string[];
  stockQuantity?: number;
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

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [shippingClasses, setShippingClasses] = useState<ShippingClassItem[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"thumbnail" | "gallery">("thumbnail");

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
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [category, setCategory] = useState("seeds");
  const [shippingClassId, setShippingClassId] = useState("sc-standard");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [available, setAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, shipRes, mediaRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/shipping"),
        fetch("/api/admin/media"),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const shipData = await shipRes.json();
      const mediaData = await mediaRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) setCategories(catData.categories || []);
      if (shipData.success) setShippingClasses(shipData.shippingClasses || []);
      if (mediaData.success) setMediaList(mediaData.media || []);
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
        const val = reader.result as string;
        setImageUrl(val);
        if (!thumbnailUrl) setThumbnailUrl(val);
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
    setThumbnailUrl("");
    setGalleryImages([]);
    setCategory(categories[0]?.handle || "seeds");
    setShippingClassId(shippingClasses[0]?.id || "sc-standard");
    setStockQuantity("50");
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
          thumbnail_url: thumbnailUrl || imageUrl,
          gallery_images: JSON.stringify(galleryImages),
          category,
          shipping_class_id: shippingClassId,
          stock_quantity: Number(stockQuantity) || 50,
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
    setThumbnailUrl(product.thumbnailUrl || product.featuredImage?.url || "");
    setGalleryImages(product.galleryImages || []);
    setCategory(product.tags?.[0] || "general");
    setShippingClassId(product.shippingClassId || "sc-standard");
    setStockQuantity(String(product.stockQuantity ?? 50));
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
          thumbnail_url: thumbnailUrl || imageUrl,
          gallery_images: JSON.stringify(galleryImages),
          category,
          shipping_class_id: shippingClassId,
          stock_quantity: Number(stockQuantity) || 50,
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
    if (!confirm(`Are you sure you want to delete product "${productTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const selectMediaItem = (item: MediaItem) => {
    if (mediaPickerTarget === "thumbnail") {
      setThumbnailUrl(item.thumbnail_url || item.url);
      if (!imageUrl) setImageUrl(item.url);
      toast.success("Selected cover thumbnail!");
    } else {
      if (!galleryImages.includes(item.url)) {
        setGalleryImages([...galleryImages, item.url]);
        toast.success("Added photo to product gallery!");
      }
    }
    setShowMediaPicker(false);
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setGalleryImages(galleryImages.filter((u) => u !== urlToRemove));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-300 pb-3 gap-3 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Products Catalog
          </h1>
          <p className="text-xs text-neutral-500">
            Manage agricultural products, distinct cover thumbnails, multi-photo galleries & shipping classes
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="rounded border border-[#2271b1] bg-[#2271b1] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#135e96] cursor-pointer"
        >
          + Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter products by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      {/* Table List */}
      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No products found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Thumbnail</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredProducts.map((p) => {
                const thumb = p.thumbnailUrl || p.featuredImage?.url || "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800";
                return (
                  <tr key={p.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-2.5">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700">
                        <img src={thumb} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                    </td>
                  <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">
                    <div>
                      <p className="font-bold text-[#2271b1] dark:text-blue-400">{p.title}</p>
                      {p.shortDescription && (
                        <p className="text-[10px] text-neutral-400 line-clamp-1">{p.shortDescription}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 uppercase text-neutral-500">
                    {p.tags?.[0] || "general"}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    BDT {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      (p.stockQuantity ?? 50) > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {p.stockQuantity ?? 50} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-lg border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517] max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-neutral-500 font-bold hover:text-rose-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdate : handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Hybrid Tomato Seeds (50g)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Short Description (Quick Highlights)
                </label>
                <input
                  type="text"
                  placeholder="Brief 1-2 sentence highlights shown under title..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Full detailed product specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Regular Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-2.5 font-mono font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Discount Offer Price (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="290"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-2.5 font-mono font-bold text-emerald-700 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-2.5 font-mono font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Cover Thumbnail Image Selector */}
              <div className="rounded border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  📷 Cover Thumbnail Image (Low-Res Optimized)
                </label>
                <div className="flex items-center gap-3">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Thumbnail" className="h-12 w-12 rounded object-cover border" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("thumbnail"); setShowMediaPicker(true); }}
                    className="rounded border border-[#2271b1] bg-white px-3 py-1.5 font-bold text-[#2271b1] hover:bg-blue-50 cursor-pointer"
                  >
                    Select Cover Thumbnail from Media Library
                  </button>
                </div>
              </div>

              {/* Multi-Image Product Gallery */}
              <div className="rounded border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                    🖼️ Product Gallery Photos (Multiple Images)
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("gallery"); setShowMediaPicker(true); }}
                    className="rounded border border-[#2271b1] bg-[#2271b1] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#135e96] cursor-pointer"
                  >
                    + Add Gallery Photos
                  </button>
                </div>

                {galleryImages.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 italic">No extra gallery photos selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {galleryImages.map((gUrl, idx) => (
                      <div key={idx} className="relative group h-14 w-14 rounded border bg-white overflow-hidden">
                        <img src={gUrl} alt="Gallery" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(gUrl)}
                          className="absolute inset-0 flex items-center justify-center bg-rose-900/80 text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.handle} value={c.handle}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Shipping Class *
                  </label>
                  <select
                    value={shippingClassId}
                    onChange={(e) => setShippingClassId(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {shippingClasses.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} (Fee: BDT {Number(sc.cost).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 flex gap-2 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-1/2 rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-bold text-white shadow hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : (editingProduct ? "Update Product" : "Publish Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-lg border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517] max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Select Photo from Media Library ({mediaPickerTarget === "thumbnail" ? "Cover Thumbnail" : "Gallery Images"})
              </h2>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-neutral-500 font-bold hover:text-rose-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {mediaList.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No uploaded photos found. Go to <strong>Media Library</strong> in admin menu to upload photos.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => selectMediaItem(m)}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white hover:border-[#2271b1] hover:shadow"
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img src={m.thumbnail_url || m.url} alt={m.filename} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-1 text-[10px] truncate text-center font-bold text-neutral-700">
                      {m.filename}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
