import Link from "next/link";
import { getDbCollections } from "lib/db/products";

export default async function AdminCategoriesPage() {
  const collections = await getDbCollections();

  return (
    <div className="space-y-4">
      <div className="border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
          ক্যাটাগরিসমূহ (Categories)
        </h1>
        <p className="text-xs text-neutral-500">
          কৃষি পণ্যসমূহের শপ ক্যাটাগরি ও ক্লাসিফিকেশন
        </p>
      </div>

      <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
          <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
            <tr>
              <th className="px-4 py-3">ক্যাটাগরির নাম (Name)</th>
              <th className="px-4 py-3">Slug (Handle)</th>
              <th className="px-4 py-3">বিবরণ (Description)</th>
              <th className="px-4 py-3 text-right">ভিউ লিংক</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {collections.map((c) => (
              <tr key={c.handle || "all"} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                <td className="px-4 py-3 font-bold text-[#2271b1] dark:text-blue-400">
                  {c.title}
                </td>
                <td className="px-4 py-3 font-mono text-neutral-500">
                  {c.handle || "all"}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {c.description || "কৃষি পণ্য ক্যাটাগরি"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={c.path}
                    target="_blank"
                    className="text-[#2271b1] hover:underline"
                  >
                    View Category ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
