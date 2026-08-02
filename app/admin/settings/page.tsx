"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [heroBadge, setHeroBadge] = useState("100% Pure & Organic Agro Products");
  const [heroTitle, setHeroTitle] = useState("Krishi Uddokta — Premium Seeds, Fertilizers & Agro Tools");
  const [heroSubtitle, setHeroSubtitle] = useState("Directly source high-yield hybrid seeds, organic vermicompost, and modern agricultural equipment with nationwide Cash on Delivery.");
  const [heroButtonText, setHeroButtonText] = useState("Shop Now");
  const [heroButtonUrl, setHeroButtonUrl] = useState("/search");
  const [heroImage, setHeroImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.hero_badge) setHeroBadge(s.hero_badge);
          if (s.hero_title) setHeroTitle(s.hero_title);
          if (s.hero_subtitle) setHeroSubtitle(s.hero_subtitle);
          if (s.hero_button_text) setHeroButtonText(s.hero_button_text);
          if (s.hero_button_url) setHeroButtonUrl(s.hero_button_url);
          if (s.hero_image) setHeroImage(s.hero_image);
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_badge: heroBadge,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_button_text: heroButtonText,
          hero_button_url: heroButtonUrl,
          hero_image: heroImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Hero Banner settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
          General & Hero Banner Settings
        </h1>
        <p className="text-xs text-neutral-500">
          Manage storefront banner content dynamically from admin panel
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          {/* Hero Banner Manager Box */}
          <div className="rounded-lg border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b pb-2 dark:border-neutral-800 dark:text-white">
              Homepage Hero Banner Manager
            </h2>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Main Banner Title
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={heroButtonText}
                  onChange={(e) => setHeroButtonText(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Button URL Link
                </label>
                <input
                  type="text"
                  value={heroButtonUrl}
                  onChange={(e) => setHeroButtonUrl(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Banner Background / Featured Image (File Picker)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full rounded border border-neutral-300 bg-white p-2 text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              />
              {heroImage && (
                <div className="mt-3 h-28 w-48 overflow-hidden rounded-xl border border-neutral-200 shadow-xs">
                  <img src={heroImage} alt="Hero Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded border border-[#2271b1] bg-[#2271b1] px-5 py-2.5 font-bold text-white shadow transition hover:bg-[#135e96] disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Hero Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
