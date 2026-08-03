import { HeroBanner } from "components/hero-banner";
import { ProductCard } from "components/product/ProductCard";
import { ComboDealsSection } from "components/combo-deals";
import { TestimonialsSection } from "components/testimonials";
import { Carousel } from "components/carousel";
import Footer from "components/layout/footer";
import { getProducts } from "lib/shopify";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Krishi Uddokta | 100% Pure & Organic Agro Products",
  description:
    "High-yielding seeds, organic fertilizers, and modern agricultural tools storefront.",
};

function ProductGridSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Top Selling Agro Products
          </h2>
          <p className="text-xs text-neutral-500">
            Most ordered products by commercial farmers nationwide
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function CarouselSkeleton() {
  return (
    <div className="w-full overflow-hidden pb-6 pt-1">
      <div className="flex gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none animate-pulse rounded-2xl bg-neutral-200 md:w-1/3 dark:bg-neutral-800"
            />
          ))}
      </div>
    </div>
  );
}

async function TopSellingProducts() {
  const products = await getProducts({});
  const topSellingProducts = products.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Top Selling Agro Products
          </h2>
          <p className="text-xs text-neutral-500">
            Most ordered products by commercial farmers nationwide
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs"
        >
          View All
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
  );
}

export default function HomePage() {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      {/* 1. Hero Banner Slider */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="h-64 animate-pulse rounded-3xl bg-neutral-200 md:h-80 dark:bg-neutral-800" />
          </div>
        }
      >
        <HeroBanner />
      </Suspense>

      {/* 2. Featured Categories Strip (static, paints instantly) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              Featured Categories
            </h2>
            <p className="text-xs text-neutral-500">
              Explore high quality agricultural product categories
            </p>
          </div>
          <Link
            href="/search"
            className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
          >
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/search/seeds"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
              Seeds & Saplings
            </h3>
            <p className="text-[11px] text-neutral-400">High Yield Variety</p>
          </Link>

          <Link
            href="/search/fertilizer"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
              Organic Fertilizers
            </h3>
            <p className="text-[11px] text-neutral-400">Soil Boosters</p>
          </Link>

          <Link
            href="/search/tools"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
              Agro Tools
            </h3>
            <p className="text-[11px] text-neutral-400">Modern Equipment</p>
          </Link>

          <Link
            href="/search"
            className="group flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
              Organic Produce
            </h3>
            <p className="text-[11px] text-neutral-400">Pure & Fresh</p>
          </Link>
        </div>
      </section>

      {/* 3. Top Selling Products (streams in) */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <TopSellingProducts />
      </Suspense>

      {/* 4. Combo Deals Section */}
      <ComboDealsSection />

      {/* 5. Product Carousel Section */}
      <Suspense fallback={<CarouselSkeleton />}>
        <Carousel />
      </Suspense>

      {/* 6. Testimonials Section */}
      <TestimonialsSection />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
