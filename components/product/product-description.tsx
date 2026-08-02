import { AddToCart } from "components/cart/add-to-cart";
import Prose from "components/prose";
import { PriceTag } from "components/ui/price-tag";
import { Product } from "lib/shopify/types";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: Product }) {
  const price = Number(product.priceRange.maxVariantPrice.amount);
  const discountPrice = product.discountPrice;

  return (
    <div className="space-y-5">
      {/* Product Title */}
      <h1 className="text-2xl font-bold text-neutral-900 leading-tight dark:text-white">
        {product.title}
      </h1>

      {/* Price */}
      <PriceTag
        price={price}
        discountPrice={discountPrice}
        currency={product.priceRange.maxVariantPrice.currencyCode}
        className="text-xl"
      />

      {/* Variant Selector */}
      <VariantSelector options={product.options} variants={product.variants} />

      {/* Add To Cart + Buttons */}
      <AddToCart product={product} />

      {/* Brand Badge */}
      <div className="pt-2">
        <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
          Brand: <strong>{product.badge || "Krishi Uddokta"}</strong>
        </span>
      </div>

      {/* Description */}
      {product.descriptionHtml ? (
        <Prose
          className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
          html={product.descriptionHtml}
        />
      ) : null}
    </div>
  );
}
