import clsx from "clsx";

export interface StarRatingProps {
  rating?: number;
  reviewCount?: number;
  showScore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({
  rating = 5,
  reviewCount,
  showScore = true,
  size = "sm",
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className={clsx("flex items-center gap-1 text-xs text-amber-500", className)}>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={clsx(iconSize, i < fullStars ? "text-amber-400" : "text-neutral-300 dark:text-neutral-700")}>
            ★
          </span>
        ))}
      </div>
      {showScore && <span className="font-bold text-neutral-700 dark:text-neutral-300">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-neutral-400">({reviewCount})</span>
      )}
    </div>
  );
}
