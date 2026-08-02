import { HeroBanner } from "components/hero-banner";
import { ProductCard } from "components/product/ProductCard";
import { ComboDealsSection } from "components/combo-deals";
import { TestimonialsSection } from "components/testimonials";
import { Carousel } from "components/carousel";
import Footer from "components/layout/footer";
import Link from "next/link";
import { getProducts } from "lib/shopify";

export const metadata = {
  title: "Krishi Uddokta | 100% Pure & Organic Agro Products",
  description: "High-yielding seeds, organic fertilizers, and modern agricultural tools storefront.",
};

export default async function HomePage() {
  const products = await getProducts({});

  // Divide products into featured and top-selling
  const featuredProducts = products.slice(0, 4);
  const topSellingProducts = products.slice(0, 8);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      {/* 1. Hero Banner Slider */}
      <HeroBanner />

      {/* 2. Featured Categories Strip */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              🌾 Featured Categories
            </h2>
            <p className="text-xs text-neutral-500">Explore high quality agricultural product categories</p>
          </div>
          <Link
            href="/search"
            className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
          >
            View All Categories ➔
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/search/seeds"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:scale-110 dark:bg-emerald-950">
              🌱
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">Seeds & Saplings</h3>
            <p className="text-[11px] text-neutral-400">High Yield Variety</p>
          </Link>

          <Link
            href="/search/fertilizer"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:scale-110 dark:bg-emerald-950">
              🧪
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">Organic Fertilizers</h3>
            <p className="text-[11px] text-neutral-400">Soil Boosters</p>
          </Link>

          <Link
            href="/search/tools"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:scale-110 dark:bg-emerald-950">
              🛠️
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">Agro Tools</h3>
            <p className="text-[11px] text-neutral-400">Modern Equipment</p>
          </Link>

          <Link
            href="/search"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:scale-110 dark:bg-emerald-950">
              🍎
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">Organic Produce</h3>
            <p className="text-[11px] text-neutral-400">Pure & Fresh</p>
          </Link>
        </div>
      </section>

      {/* 3. Top Selling Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              🔥 Top Selling Agro Products
            </h2>
            <p className="text-xs text-neutral-500">Most ordered products by commercial farmers nationwide</p>
          </div>
          <Link
            href="/search"
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs"
          >
            View All ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topSellingProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              handle={p.handle}
              title={p.title}
              description={p.description}
              price={Number(p.priceRange.maxVariantPrice.amount)}
              discountPrice={p.discountPrice}
              currency={p.priceRange.maxVariantPrice.currencyCode}
              imageUrl={p.featuredImage?.url}
              badge={p.badge}
              availableForSale={p.availableForSale}
              rating={p.rating}
              reviewCount={p.reviewCount}
            />
          ))}
        </div>
      </section>

      {/* 4. Combo Deals Section */}
      <ComboDealsSection />

      {/* 5. Product Carousel Section */}
      <Carousel />

      {/* 6. Testimonials Section */}
      <TestimonialsSection />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
