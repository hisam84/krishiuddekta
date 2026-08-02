import clsx from "clsx";

export interface PriceTagProps {
  price: number;
  discountPrice?: number;
  currency?: string;
  className?: string;
}

export function PriceTag({ price, discountPrice, currency = "BDT", className }: PriceTagProps) {
  const isDiscounted = discountPrice && discountPrice < price;

  return (
    <div className={clsx("flex items-baseline gap-2 font-mono", className)}>
      <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
        {currency} {isDiscounted ? discountPrice.toFixed(2) : price.toFixed(2)}
      </span>
      {isDiscounted && (
        <span className="text-xs text-neutral-400 line-through">
          {currency} {price.toFixed(2)}
        </span>
      )}
    </div>
  );
}
