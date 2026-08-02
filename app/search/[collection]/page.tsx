import { getCollection, getCollectionProducts } from "lib/shopify";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import Link from "next/link";
import { Button } from "components/ui/button";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: `${collection.title} | Krishi Uddokta`,
    description:
      collection.seo?.description ||
      collection.description ||
      `Buy high quality ${collection.title} at Krishi Uddokta.`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getCollectionProducts({
    collection: params.collection,
    sortKey,
    reverse,
  });

  return (
    <section>
      {products.length === 0 ? (
        <div className="my-12 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            No products found in this category
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Check back soon or explore other agricultural product categories.
          </p>
          <Link href="/search" className="mt-5">
            <Button size="sm">View All Categories ➔</Button>
          </Link>
        </div>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </section>
  );
}
