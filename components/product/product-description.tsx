import { AddToCart } from "components/cart/add-to-cart";
import { PriceTag } from "components/ui/price-tag";
import { Product } from "lib/shopify/types";
import Link from "next/link";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: Product }) {
  const price = Number(product.priceRange.maxVariantPrice.amount);
  const discountPrice = product.discountPrice;

  // Short description: first 150 chars of plain text
  const shortDescription = product.description
    ? product.description.slice(0, 150) + (product.description.length > 150 ? "..." : "")
    : "";

  return (
    <div className="space-y-5">
      {/* Product Title + Edit Button */}
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-neutral-900 leading-tight dark:text-white">
          {product.title}
        </h1>
        <Link
          href="/admin/products"
          className="mt-1 flex-shrink-0 rounded-md border border-neutral-200 p-1.5 text-neutral-400 transition hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:hover:border-blue-500 dark:hover:text-blue-400"
          title="Edit Product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Link>
      </div>

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

      {/* Short Description */}
      {shortDescription && (
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {shortDescription}
        </p>
      )}
    </div>
  );
}
