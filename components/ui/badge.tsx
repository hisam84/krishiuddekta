import clsx from "clsx";

export interface BadgeProps {
  variant?: "bestseller" | "new" | "discount" | "outofstock" | "emerald" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "emerald", children, className }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-xs";

  const variants = {
    bestseller: "bg-amber-500 text-white",
    new: "bg-blue-600 text-white",
    discount: "bg-rose-600 text-white",
    outofstock: "bg-neutral-600 text-white",
    emerald: "bg-emerald-600 text-white",
    neutral: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  };

  return <span className={clsx(baseClasses, variants[variant], className)}>{children}</span>;
}
