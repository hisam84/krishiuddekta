"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"site" | "hero">("site");

  // Site & Header Settings State
  const [siteName, setSiteName] = useState("Krishi Uddokta");
  const [siteLogo, setSiteLogo] = useState("");
  const [siteFavicon, setSiteFavicon] = useState("");
  const [headerHelpline, setHeaderHelpline] = useState("01700-000000");
  const [headerAnnouncement, setHeaderAnnouncement] = useState("Nationwide Cash on Delivery Available");
  const [headerBgColor, setHeaderBgColor] = useState("emerald");

  // Hero Banner Settings State
  const [heroBadge, setHeroBadge] = useState("100% Pure & Organic Agro Products");
  const [heroTitle, setHeroTitle] = useState("Krishi Uddokta — Premium Seeds, Fertilizers & Agro Tools");
  const [heroSubtitle, setHeroSubtitle] = useState("Directly source high-yield hybrid seeds, organic vermicompost, and modern agricultural equipment with nationwide Cash on Delivery.");
  const [heroButtonText, setHeroButtonText] = useState("Shop Now");
  const [heroButtonUrl, setHeroButtonUrl] = useState("/search");
  const [heroImage, setHeroImage] = useState("");
  const [heroOverlayColor, setHeroOverlayColor] = useState("#064e3b");
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState("85");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.site_name) setSiteName(s.site_name);
          if (s.site_logo) setSiteLogo(s.site_logo);
          if (s.site_favicon) setSiteFavicon(s.site_favicon);
          if (s.header_helpline) setHeaderHelpline(s.header_helpline);
          if (s.header_announcement) setHeaderAnnouncement(s.header_announcement);
          if (s.header_bg_color) setHeaderBgColor(s.header_bg_color);

          if (s.hero_badge) setHeroBadge(s.hero_badge);
          if (s.hero_title) setHeroTitle(s.hero_title);
          if (s.hero_subtitle) setHeroSubtitle(s.hero_subtitle);
          if (s.hero_button_text) setHeroButtonText(s.hero_button_text);
          if (s.hero_button_url) setHeroButtonUrl(s.hero_button_url);
          if (s.hero_image) setHeroImage(s.hero_image);
          if (s.hero_overlay_color) setHeroOverlayColor(s.hero_overlay_color);
          if (s.hero_overlay_opacity !== undefined) setHeroOverlayOpacity(s.hero_overlay_opacity);
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteFavicon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          site_logo: siteLogo,
          site_favicon: siteFavicon,
          header_helpline: headerHelpline,
          header_announcement: headerAnnouncement,
          header_bg_color: headerBgColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Site & Header settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
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
          hero_overlay_color: heroOverlayColor,
          hero_overlay_opacity: heroOverlayOpacity,
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
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Store Settings Manager
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure site identity, header customizer, favicon, and hero banner overlay
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab("site")}
          className={`px-4 py-2.5 transition border-b-2 cursor-pointer ${
            activeTab === "site"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Site & Header Settings
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2.5 transition border-b-2 cursor-pointer ${
            activeTab === "hero"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Hero Banner Settings
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
          Loading settings...
        </div>
      ) : activeTab === "site" ? (
        <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Website Identity & Header Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Site Name / Brand Title
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Header Helpline Phone Number
                </label>
                <input
                  type="text"
                  value={headerHelpline}
                  onChange={(e) => setHeaderHelpline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Top Announcement Bar Text
              </label>
              <input
                type="text"
                value={headerAnnouncement}
                onChange={(e) => setHeaderAnnouncement(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Announcement Bar Style
              </label>
              <select
                value={headerBgColor}
                onChange={(e) => setHeaderBgColor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-semibold"
              >
                <option value="emerald">Emerald Green (Default Agro)</option>
                <option value="dark">Sleek Dark Theme</option>
                <option value="navy">Deep Navy Blue</option>
                <option value="orange">Warm Orange Banner</option>
              </select>
            </div>

            {/* Header Logo Upload Option */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block font-semibold text-slate-900">
                Header Logo Upload Option
              </label>
              <p className="text-[11px] text-slate-500">
                Choose a transparent PNG or image file to replace the header logo.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none cursor-pointer"
              />
              {siteLogo && (
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-xs text-slate-500">Preview:</span>
                  <div className="h-12 w-auto max-w-[200px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <img src={siteLogo} alt="Site Logo Preview" className="h-full w-auto object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSiteLogo("")}
                    className="text-rose-600 text-[11px] font-medium hover:underline cursor-pointer"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
            </div>

            {/* Favicon Upload Option */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block font-semibold text-slate-900">
                Favicon Upload Option
              </label>
              <p className="text-[11px] text-slate-500">
                Upload a small icon file (.ico or .png) to display in browser tabs.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFaviconFileChange}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none cursor-pointer"
              />
              {siteFavicon && (
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-xs text-slate-500">Favicon Preview:</span>
                  <div className="h-8 w-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <img src={siteFavicon} alt="Favicon Preview" className="h-full w-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSiteFavicon("")}
                    className="text-rose-600 text-[11px] font-medium hover:underline cursor-pointer"
                  >
                    Remove Favicon
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Site Settings"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveHeroSettings} className="space-y-6 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Homepage Hero Banner Manager
            </h2>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Main Banner Title
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Subtitle Description
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={heroButtonText}
                  onChange={(e) => setHeroButtonText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Button URL Link
                </label>
                <input
                  type="text"
                  value={heroButtonUrl}
                  onChange={(e) => setHeroButtonUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Hero Overlay Customizer (Color & Opacity) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Hero Image Overlay & Color Customizer
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Overlay Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={heroOverlayColor}
                      onChange={(e) => setHeroOverlayColor(e.target.value)}
                      className="h-10 w-12 rounded border border-slate-300 bg-white p-1 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={heroOverlayColor}
                      onChange={(e) => setHeroOverlayColor(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-medium text-slate-700">
                      Overlay Opacity (%)
                    </label>
                    <span className="font-mono font-bold text-emerald-700">
                      {heroOverlayOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={heroOverlayOpacity}
                    onChange={(e) => setHeroOverlayOpacity(e.target.value)}
                    className="w-full h-2 rounded bg-slate-200 accent-emerald-600 cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Banner Background / Featured Image (File Picker)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageFileChange}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none cursor-pointer"
              />
              {heroImage && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="h-28 w-48 overflow-hidden rounded-xl border border-slate-200 shadow-xs relative">
                    <img src={heroImage} alt="Hero Preview" className="h-full w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeroImage("")}
                    className="text-rose-600 text-[11px] font-medium hover:underline cursor-pointer"
                  >
                    Remove Banner Image
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Hero Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
