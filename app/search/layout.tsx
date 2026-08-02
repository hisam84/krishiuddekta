import Footer from "components/layout/footer";
import Collections from "components/layout/search/collections";
import FilterList from "components/layout/search/filter";
import { sorting } from "lib/constants";
import { Suspense } from "react";
import { Skeleton } from "components/ui/skeleton";

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-80 w-full overflow-hidden rounded-2xl p-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-8 text-black md:flex-row dark:text-white">
        <div className="order-first w-full flex-none md:max-w-[180px]">
          <Collections />
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          <Suspense fallback={<SearchSkeleton />}>
            {children}
          </Suspense>
        </div>
        <div className="order-none flex-none md:order-last md:w-[180px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
      <Footer />
    </>
  );
}
