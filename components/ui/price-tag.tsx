import clsx from "clsx";

export interface PriceTagProps {
  price: number;
  discountPrice?: number;
  currency?: string;
  className?: string;
}

export function PriceTag({ price, discountPrice, currency = "BDT", className }: PriceTagProps) {
  const isDiscounted = discountPrice && discountPrice < price;

  // Use ৳ symbol for BDT
  const currencySymbol = currency === "BDT" ? "৳" : currency;

  return (
    <div className={clsx("flex items-baseline gap-2 font-mono", className)}>
      <span className="text-2xl font-extrabold text-orange-500">
        {currencySymbol}{isDiscounted ? discountPrice.toLocaleString("en-BD", { minimumFractionDigits: 2 }) : price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
      </span>
      {isDiscounted && (
        <span className="text-sm text-neutral-400 line-through">
          {currencySymbol}{price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
        </span>
      )}
    </div>
  );
}
