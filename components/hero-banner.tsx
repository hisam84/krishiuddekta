import Link from "next/link";
import { getDbSettings } from "lib/db/products";

export async function HeroBanner() {
  const settings = await getDbSettings();

  const badge = settings.hero_badge || "100% Pure & Organic Agro Products";
  const title = settings.hero_title || "Krishi Uddokta — Premium Seeds, Fertilizers & Agro Tools";
  const subtitle = settings.hero_subtitle || "Directly source high-yield hybrid seeds, organic vermicompost, and modern agricultural equipment with nationwide Cash on Delivery.";
  const buttonText = settings.hero_button_text || "Shop Now";
  const buttonUrl = settings.hero_button_url || "/search";
  const bgImage = settings.hero_image;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Clean Dynamic Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-8 text-white shadow-xl md:p-12"
        style={bgImage ? { backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.9), rgba(17, 94, 89, 0.8)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md">
            {badge}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            {title}
          </h1>
          <p className="text-sm text-emerald-100/90 sm:text-base leading-relaxed">
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
              href="tel:01700000000"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Call Helpline
            </a>
          </div>
        </div>

        {/* Clean Feature Badges Bar */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-emerald-700/60 pt-6 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-bold">Cash on Delivery</p>
              <p className="text-[11px] text-emerald-200">Nationwide Home Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-bold">100% Organic</p>
              <p className="text-[11px] text-emerald-200">Guaranteed Premium Quality</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-bold">24/7 Support</p>
              <p className="text-[11px] text-emerald-200">Always Ready to Help</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-bold">Secure Shopping</p>
              <p className="text-[11px] text-emerald-200">Inspect Before Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
