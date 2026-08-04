export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs dark:bg-neutral-950/80">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-neutral-700 dark:border-t-emerald-500" />
        <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 animate-pulse">
          Loading Krishi Uddokta...
        </p>
      </div>
    </div>
  );
}
