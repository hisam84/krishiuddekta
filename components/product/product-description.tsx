import { AddToCart } from "components/cart/add-to-cart";
import { Badge } from "components/ui/badge";
import { PriceTag } from "components/ui/price-tag";
import { StarRating } from "components/ui/star-rating";
import Prose from "components/prose";
import { Product } from "lib/shopify/types";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: Product }) {
  const price = Number(product.priceRange.maxVariantPrice.amount);
  const discountPrice = product.discountPrice;

  return (
    <div className="space-y-6">
      {/* Badges & Rating */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={product.availableForSale ? "emerald" : "outofstock"}>
          {product.availableForSale ? (product.badge || "100% Organic") : "Out of Stock"}
        </Badge>
        <StarRating rating={product.rating || 5} reviewCount={product.reviewCount || 12} size="md" />
      </div>

      {/* Product Title */}
      <h1 className="text-3xl font-extrabold text-neutral-900 leading-tight dark:text-white">
        {product.title}
      </h1>

      {/* Price Tag */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
        <PriceTag
          price={price}
          discountPrice={discountPrice}
          currency={product.priceRange.maxVariantPrice.currencyCode}
          className="text-xl"
        />
        <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          ✓ Inclusive of all taxes. Free shipping on orders over BDT 1,000.
        </p>
      </div>

      {/* Delivery & Trust Info Box */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 p-3.5 text-xs dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚚</span>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white">Home Delivery</p>
            <p className="text-[11px] text-neutral-500">24-48 Hours</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">💵</span>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white">Cash on Delivery</p>
            <p className="text-[11px] text-neutral-500">Inspect before pay</p>
          </div>
        </div>
      </div>

      {/* Variant Selector */}
      <VariantSelector options={product.options} variants={product.variants} />

      {/* Description */}
      {product.descriptionHtml ? (
        <Prose
          className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
          html={product.descriptionHtml}
        />
      ) : null}

      {/* Add To Cart */}
      <AddToCart product={product} />
    </div>
  );
}
