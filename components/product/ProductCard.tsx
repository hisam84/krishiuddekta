"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "components/ui/badge";
import { PriceTag } from "components/ui/price-tag";
import { StarRating } from "components/ui/star-rating";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800";

export interface ProductCardProps {
  id: string;
  handle: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  currency?: string;
  imageUrl: string;
  badge?: string;
  availableForSale?: boolean;
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({
  handle,
  title,
  description,
  price,
  discountPrice,
  currency = "BDT",
  imageUrl,
  badge,
  availableForSale = true,
  rating = 5,
  reviewCount = 12,
}: ProductCardProps) {
  const isDiscounted = discountPrice && discountPrice < price;
  const discountPercent = isDiscounted
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const [imgSrc, setImgSrc] = useState(imageUrl || DEFAULT_FALLBACK);

  useEffect(() => {
    setImgSrc(imageUrl || DEFAULT_FALLBACK);
  }, [imageUrl]);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        {/* Product Image Container (Clickable) */}
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <Link
            href={`/product/${handle}`}
            className="block h-full w-full cursor-pointer"
          >
            <img
              src={imgSrc}
              alt={title}
              onError={() => setImgSrc(DEFAULT_FALLBACK)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1 pointer-events-none">
            {!availableForSale ? (
              <Badge variant="outofstock">Out of Stock</Badge>
            ) : isDiscounted ? (
              <Badge variant="discount">Save {discountPercent}%</Badge>
            ) : badge ? (
              <Badge variant="bestseller">{badge}</Badge>
            ) : (
              <Badge variant="emerald">100% Organic</Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-2 p-4">
          <StarRating rating={rating} reviewCount={reviewCount} />

          <Link href={`/product/${handle}`}>
            <h3 className="line-clamp-1 font-bold text-neutral-900 transition hover:text-emerald-600 dark:text-white cursor-pointer">
              {title}
            </h3>
          </Link>

          {description && (
            <p className="line-clamp-2 text-xs text-neutral-500">
              {description}
            </p>
          )}

          <div className="pt-2">
            <PriceTag
              price={price}
              discountPrice={discountPrice}
              currency={currency}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <Link
          href={`/product/${handle}`}
          className="block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer"
        >
          {availableForSale ? "Order Now" : "Out of Stock"}
        </Link>
      </div>
    </div>
  );
}
