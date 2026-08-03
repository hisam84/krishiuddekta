"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string;
  size_bytes: number;
  created_at: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success) {
        setMediaList(data.media || []);
      }
    } catch (err) {
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

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
        if (data.success) {
          toast.success(`Uploaded ${file.name}`);
        } else {
          toast.error(data.message || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setUploading(false);
    fetchMedia();
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Delete media "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Media deleted");
        fetchMedia();
      } else {
        toast.error("Failed to delete media");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Media Library & Photo Upload
          </h1>
          <p className="text-xs text-neutral-500">
            Upload images converted to low-resolution thumbnails for product covers & photo galleries
          </p>
        </div>

        <label className="rounded border border-[#2271b1] bg-[#2271b1] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#135e96] cursor-pointer">
          {uploading ? "Uploading Images..." : "+ Upload New Photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading media assets...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-12 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">
            No media files uploaded yet. Click <strong>+ Upload New Photos</strong> to populate your media library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mediaList.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={m.thumbnail_url || m.url}
                  alt={m.filename}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="p-2 text-[11px]">
                <p className="font-bold truncate text-neutral-800 dark:text-neutral-200">
                  {m.filename}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {(m.size_bytes / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(m.url)}
                  className="rounded bg-white px-2 py-1 text-[10px] font-bold text-neutral-900 shadow hover:bg-neutral-100 cursor-pointer"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(m.id, m.filename)}
                  className="rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white shadow hover:bg-rose-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
