import clsx from "clsx";

export default function LogoIcon(props: React.ComponentProps<"svg">) {
  const siteName = process.env.SITE_NAME || "কৃষি উদ্যোক্তা";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${siteName} logo`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={clsx("h-5 w-5 text-emerald-600 dark:text-emerald-400", props.className)}
    >
      <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12C2 6.5 6.5 2 12 2Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 18v-7" />
      <path d="M12 14c-2-1.5-4-1-5 1 2.5 1 4.5 0 5-1Z" fill="currentColor" />
      <path d="M12 11c2-1.5 4-1 5 1-2.5 1-4.5 0-5-1Z" fill="currentColor" />
    </svg>
  );
}

