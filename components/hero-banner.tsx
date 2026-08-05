import Link from "next/link";
import { getDbSettings } from "lib/db/products";

function hexToRgba(hex: string, alpha: number) {
  let c = (hex || "#064e3b").replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((char) => char + char).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(6, 78, 59, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export async function HeroBanner() {
  const settings = await getDbSettings();

  const badge = settings.hero_badge || "100% Pure & Organic Agro Products";
  const title = settings.hero_title || "Krishi Uddokta — Premium Seeds, Fertilizers & Agro Tools";
  const subtitle = settings.hero_subtitle || "Directly source high-yield hybrid seeds, organic vermicompost, and modern agricultural equipment with nationwide Cash on Delivery.";
  const buttonText = settings.hero_button_text || "Shop Now";
  const buttonUrl = settings.hero_button_url || "/search";
  const bgImage = settings.hero_image;

  const overlayHex = settings.hero_overlay_color || "#064e3b";
  const opacityPercent = settings.hero_overlay_opacity !== undefined ? Number(settings.hero_overlay_opacity) : 85;
  const opacityVal = Math.min(Math.max(opacityPercent / 100, 0), 1);
  const rgbaColor = hexToRgba(overlayHex, opacityVal);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Clean Dynamic Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl md:p-12 transition-all duration-300"
        style={{
          backgroundColor: overlayHex,
          backgroundImage: bgImage
            ? `linear-gradient(to right, ${rgbaColor}, ${rgbaColor}), url(${bgImage})`
            : `linear-gradient(to right, ${rgbaColor}, ${rgbaColor})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {badge}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight text-white">
            {title}
          </h1>
          <p className="text-sm text-white/90 sm:text-base leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={buttonUrl}
              className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400 shadow-lg"
            >
              {buttonText}
            </Link>
            <a
              href="tel:+8801604649648"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              +880 1604-649648
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
