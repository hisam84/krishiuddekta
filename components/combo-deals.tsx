import Link from "next/link";
import { Badge } from "components/ui/badge";
import { PriceTag } from "components/ui/price-tag";

export function ComboDealsSection() {
  const comboDeals = [
    {
      id: "combo-1",
      title: "Complete Farming Starter Combo",
      subtitle: "Hybrid Tomato Seeds + Organic Vermicompost Fertilizer (10kg)",
      price: 800,
      discountPrice: 650,
      badge: "Save 19%",
      imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "combo-2",
      title: "Rooftop Garden Care Package",
      subtitle: "Thai Mango Sapling + Bio Organic Soil Booster",
      price: 1000,
      discountPrice: 820,
      badge: "Save 18%",
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Special Combo Deals & Savings
          </h2>
          <p className="text-xs text-neutral-500">Curated agricultural bundles at discounted rates</p>
        </div>
        <Link
          href="/search"
          className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600 shadow-xs"
        >
          Explore All Combos
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {comboDeals.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center gap-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="relative h-36 w-36 flex-none overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2">
                <Badge variant="discount">{item.badge}</Badge>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">{item.subtitle}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <PriceTag price={item.price} discountPrice={item.discountPrice} />
                <Link
                  href="/search"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
