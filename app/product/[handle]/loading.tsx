export default function SingleProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left: Gallery Skeleton */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square w-full animate-pulse rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 flex gap-3 justify-center">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
          </div>
        </div>

        {/* Right: Product Detail Skeleton */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="h-6 w-1/4 animate-pulse rounded bg-emerald-200 dark:bg-emerald-950" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-10 w-1/2 animate-pulse rounded bg-emerald-100 dark:bg-neutral-800" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-6">
            <div className="h-12 w-full animate-pulse rounded-xl bg-orange-200 dark:bg-neutral-800" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-emerald-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
