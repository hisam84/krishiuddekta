import { HeroBanner } from "components/hero-banner";
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

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Category Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              🌾 Popular Categories
            </h2>
            <p className="text-xs text-neutral-500">Select your required agricultural category</p>
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

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              ✨ Featured Agro Products
            </h2>
            <p className="text-xs text-neutral-500">Top rated products for farmers nationwide</p>
          </div>
          <Link
            href="/search"
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs"
          >
            View All ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs transition hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div>
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={product.featuredImage?.url}
                    alt={product.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    100% Original
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-neutral-900 line-clamp-1 dark:text-white group-hover:text-emerald-600 transition">
                    {product.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{product.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                      BDT {Number(product.priceRange.maxVariantPrice.amount).toFixed(2)}
                    </p>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-300">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  href={`/product/${product.handle}`}
                  className="block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
                >
                  Order Now ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Carousel & Footer */}
      <Carousel />
      <Footer />
    </div>
  );
}
