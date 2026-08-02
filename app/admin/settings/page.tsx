import Link from "next/link";

export default function AdminSettingsPage() {
  const siteName = process.env.SITE_NAME || "কৃষি উদ্যোক্তা";
  const companyName = process.env.COMPANY_NAME || "কৃষি উদ্যোক্তা";

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
          সাধারণ সেটিংস (General Settings)
        </h1>
        <p className="text-xs text-neutral-500">
          আপনার কৃষি উদ্যোক্তা ই-কমার্স স্টোরের সাধারণ তথ্য
        </p>
      </div>

      <div className="rounded-lg border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
          <label className="font-bold text-neutral-700 dark:text-neutral-300">
            সাইটের শিরোনাম (Site Title):
          </label>
          <div className="sm:col-span-2">
            <input
              type="text"
              readOnly
              value={siteName}
              className="w-full rounded border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
          <label className="font-bold text-neutral-700 dark:text-neutral-300">
            প্রতিষ্ঠান / কোম্পানির নাম (Company):
          </label>
          <div className="sm:col-span-2">
            <input
              type="text"
              readOnly
              value={companyName}
              className="w-full rounded border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
          <label className="font-bold text-neutral-700 dark:text-neutral-300">
            মুদ্রা (Currency Code):
          </label>
          <div className="sm:col-span-2">
            <input
              type="text"
              readOnly
              value="BDT (৳ বাংলাদেশি টাকা)"
              className="w-full rounded border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
          <label className="font-bold text-neutral-700 dark:text-neutral-300">
            ডাটাবেজ সিস্টেম (Engine):
          </label>
          <div className="sm:col-span-2">
            <input
              type="text"
              readOnly
              value="Neon Serverless PostgreSQL Database"
              className="w-full rounded border border-neutral-300 bg-neutral-100 px-3 py-2 text-emerald-600 font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-emerald-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
