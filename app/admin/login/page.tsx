"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoIcon from "components/icons/logo";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("পাসওয়ার্ড লিখুন");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("সফলভাবে এডমিন প্যানেলে লগইন হয়েছে!");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.message || "ভুল পাসওয়ার্ড!");
      }
    } catch (err) {
      toast.error("লগইন করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
            <LogoIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            কৃষি উদ্যোক্তা এডমিন লগইন
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            পণ্য ও অর্ডার পরিচালনা করতে এডমিন পাসওয়ার্ড দিন
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
              এডমিন পাসওয়ার্ড
            </label>
            <input
              type="password"
              placeholder="ডিফল্ট পাসওয়ার্ড: admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In ➔"}
          </button>
        </form>
      </div>
    </div>
  );
}
