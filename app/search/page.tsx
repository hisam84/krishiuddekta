import type { Metadata } from "next";
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import { getProducts } from "lib/shopify";
import Link from "next/link";
import { Button } from "components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Search Products | Krishi Uddokta",
  description: "Search agricultural seeds, organic fertilizers, and tools.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const products = await getProducts({ sortKey, reverse, query: searchValue });
  const resultsText = products.length > 1 ? "results" : "result";

  return (
    <>
      {searchValue ? (
        <p className="mb-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          {products.length === 0
            ? "There are no products that match "
            : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold text-neutral-900 dark:text-white">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : (
        <div className="my-12 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            No products match your search
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Try checking for spelling errors or search for broad terms like "seeds", "fertilizer", or "tools".
          </p>
          <Link href="/search" className="mt-5">
            <Button size="sm">Explore All Products</Button>
          </Link>
        </div>
      )}
    </>
  );
}
