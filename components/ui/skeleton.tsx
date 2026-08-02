import clsx from "clsx";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800", className)}
      {...props}
    />
  );
}
