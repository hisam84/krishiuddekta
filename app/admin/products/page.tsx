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

  // Media Picker State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"thumbnail" | "gallery">("thumbnail");
  const [pickerTab, setPickerTab] = useState<"library" | "upload">("library");
  const [uploadingMedia, setUploadingMedia] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      toast.error("Product title and price are required");
      return;
    }

    let effectiveImageUrl = imageUrl;
    if ((!effectiveImageUrl || effectiveImageUrl.startsWith("/api/product-image/")) && galleryImages.length > 0) {
      const validGalleryItem = galleryImages.find((g) => g && !g.startsWith("/api/product-image/"));
      if (validGalleryItem) effectiveImageUrl = validGalleryItem;
    }
    const effectiveThumbUrl = thumbnailUrl || effectiveImageUrl;

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
          image_url: effectiveImageUrl,
          thumbnail_url: effectiveThumbUrl,
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

    let effectiveImageUrl = imageUrl;
    if ((!effectiveImageUrl || effectiveImageUrl.startsWith("/api/product-image/")) && galleryImages.length > 0) {
      const validGalleryItem = galleryImages.find((g) => g && !g.startsWith("/api/product-image/"));
      if (validGalleryItem) effectiveImageUrl = validGalleryItem;
    }
    const effectiveThumbUrl = thumbnailUrl || effectiveImageUrl;

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
          image_url: effectiveImageUrl,
          thumbnail_url: effectiveThumbUrl,
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
    const selectedUrl = item.url || item.thumbnail_url;
    if (mediaPickerTarget === "thumbnail") {
      setThumbnailUrl(item.thumbnail_url || item.url);
      setImageUrl(selectedUrl);
      toast.success("Selected cover thumbnail!");
      setShowMediaPicker(false);
    } else {
      if (galleryImages.includes(selectedUrl)) {
        setGalleryImages(galleryImages.filter((u) => u !== selectedUrl));
        toast.info("Removed image from gallery");
      } else {
        const updatedGallery = [...galleryImages, selectedUrl];
        setGalleryImages(updatedGallery);
        if (!imageUrl || imageUrl.startsWith("/api/product-image/")) setImageUrl(selectedUrl);
        if (!thumbnailUrl || thumbnailUrl.startsWith("/api/product-image/")) setThumbnailUrl(selectedUrl);
        toast.success("Added photo to product gallery!");
      }
    }
  };

  const handlePickerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    let lastUploadedItem: MediaItem | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      try {
        const reader = new FileReader();
        const base64Data: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            image_data: base64Data,
          }),
        });

        const data = await res.json();
        if (data.success && data.media) {
          lastUploadedItem = data.media;
          toast.success(`Uploaded ${file.name}`);
        } else {
          toast.error(data.message || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setUploadingMedia(false);

    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
        if (lastUploadedItem && mediaPickerTarget === "thumbnail") {
          selectMediaItem(lastUploadedItem);
        } else {
          setPickerTab("library");
        }
      }
    } catch (err) {
      toast.error("Failed to refresh media library");
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Products Catalog Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage store inventory, upload cover thumbnails, add gallery photos, and configure shipping classes
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
        >
          + Add New Product
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search products by title or handle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>
        <span className="text-xs font-medium text-slate-500">
          Total Products: {filteredProducts.length}
        </span>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
          Loading catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
          No matching products found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const img = p.thumbnailUrl || p.featuredImage?.url;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-none overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {img ? (
                            <img src={img} alt={p.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                              NA
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">/{p.handle}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      BDT {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                      {p.discountPrice && p.discountPrice < Number(p.priceRange?.minVariantPrice?.amount) && (
                        <span className="ml-1 text-[10px] text-slate-400 line-through">
                          BDT {p.discountPrice}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {p.tags?.[0] || "General"}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {p.stockQuantity ?? 50} units
                    </td>

                    <td className="px-4 py-3">
                      {p.availableForSale ? (
                        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition cursor-pointer"
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

      {/* Product Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingProduct ? "Edit Product Details" : "Add New Product"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Hybrid Tomato Seeds (10g)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Short Summary
                </label>
                <input
                  type="text"
                  placeholder="High yield hybrid vegetable seed packet"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, usage instructions, and benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Regular Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Discount Price (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="200"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Inventory Stock
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Thumbnail Image Selector */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <label className="block font-semibold text-slate-800">
                  Cover Thumbnail Image
                </label>
                <div className="flex items-center gap-3">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Thumbnail" className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-white" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("thumbnail"); setPickerTab("library"); setShowMediaPicker(true); }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Select Cover Image from Media Library
                  </button>
                </div>
              </div>

              {/* Multi-Image Product Gallery */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-800">
                    Product Gallery Photos
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("gallery"); setPickerTab("library"); setShowMediaPicker(true); }}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    + Manage Gallery Photos
                  </button>
                </div>

                {galleryImages.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No extra gallery photos selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {galleryImages.map((gUrl, idx) => (
                      <div key={idx} className="relative group h-14 w-14 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
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
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.handle} value={c.handle}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Shipping Class (Weight / Size) *
                  </label>
                  <select
                    value={shippingClassId}
                    onChange={(e) => setShippingClassId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    {shippingClasses.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} {sc.description ? `— ${sc.description}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-1/2 rounded-lg border border-slate-200 py-2 font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : (editingProduct ? "Update Product" : "Publish Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integrated Media Picker Modal with Upload & Library Tabs */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Select Product {mediaPickerTarget === "thumbnail" ? "Cover Thumbnail" : "Gallery Images"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select existing photos from media library or upload new files directly
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs">
                  <span>{uploadingMedia ? "Uploading..." : "+ Upload New Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingMedia}
                    onChange={handlePickerFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowMediaPicker(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 text-xs font-medium">
              <button
                onClick={() => setPickerTab("library")}
                className={`py-3 px-4 border-b-2 font-semibold transition cursor-pointer ${
                  pickerTab === "library"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Media Library ({mediaList.length})
              </button>
              <button
                onClick={() => setPickerTab("upload")}
                className={`py-3 px-4 border-b-2 font-semibold transition cursor-pointer ${
                  pickerTab === "upload"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Upload Files
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 flex-1 overflow-y-auto min-h-[320px]">
              {pickerTab === "upload" ? (
                /* Tab 2: Upload Zone */
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center hover:border-emerald-500 transition">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Upload Product Images
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm">
                    Select JPEG, PNG, WEBP files from your device to add to media library
                  </p>
                  <label className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs">
                    <span>{uploadingMedia ? "Uploading..." : "Browse Files"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingMedia}
                      onChange={handlePickerFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                /* Tab 1: Media Library Grid */
                mediaList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
                    <p className="text-xs text-slate-500 mb-3">No uploaded photos in media library yet.</p>
                    <label className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer">
                      <span>+ Upload First Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingMedia}
                        onChange={handlePickerFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {mediaList.map((m) => {
                      const isSelected =
                        mediaPickerTarget === "thumbnail"
                          ? thumbnailUrl === m.url
                          : galleryImages.includes(m.url);

                      return (
                        <div
                          key={m.id}
                          onClick={() => selectMediaItem(m)}
                          className={`group relative cursor-pointer overflow-hidden rounded-xl border transition ${
                            isSelected
                              ? "border-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50"
                              : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs"
                          }`}
                        >
                          <div className="aspect-square w-full overflow-hidden bg-slate-100">
                            <img src={m.thumbnail_url || m.url} alt={m.filename} className="h-full w-full object-cover" />
                          </div>
                          <div className="p-2 text-[10px] truncate text-center font-semibold text-slate-700">
                            {m.filename}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-slate-50 text-xs">
              <span className="text-slate-500 font-medium">
                {mediaPickerTarget === "thumbnail" ? "Click image to set as thumbnail" : "Click images to select for product gallery"}
              </span>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
