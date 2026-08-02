import Link from "next/link";

export function HeroBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Main Ghorer Bazar Style Organic Green Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-8 text-white shadow-xl md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md">
            🌿 ১০০% নির্ভেজাল ও অরিজিনাল কৃষি পণ্য
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            কৃষি উদ্যোক্তা — সেরা বীজ, সার ও কৃষি যন্ত্রপাতি
          </h1>
          <p className="text-sm text-emerald-100/90 sm:text-base leading-relaxed">
            সরাসরি বিশ্বস্ত প্রস্তুতকারক থেকে উন্নত জাতের হাইব্রিড বীজ, কেঁচো সার, এবং আধুনিক কৃষি সরঞ্জাম কিনুন আপনার দরজায় ক্যাশ অন ডেলিভারিতে।
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/search"
              className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400 shadow-lg"
            >
              Shop Now ➔
            </Link>
            <a
              href="tel:01700000000"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Call Helpline 📞
            </a>
          </div>
        </div>

        {/* Feature Badges Bar */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-emerald-700/60 pt-6 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-xs font-bold">ক্যাশ অন ডেলিভারি</p>
              <p className="text-[11px] text-emerald-200">সারাদেশে হোম ডেলিভারি</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍃</span>
            <div>
              <p className="text-xs font-bold">১০০% প্রাকৃতিক</p>
              <p className="text-[11px] text-emerald-200">গুণগত মান শতভাগ খাঁটি</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <p className="text-xs font-bold">২৪/৭ হটলাইন সাপোর্ট</p>
              <p className="text-[11px] text-emerald-200">যেকোনো তথ্যে পাশে আছি</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-xs font-bold">নিরাপদ কেনাকাটা</p>
              <p className="text-[11px] text-emerald-200">পণ্য দেখে মূল্য পরিশোধ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
