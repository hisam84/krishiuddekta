import type { Metadata } from "next";
import Prose from "components/prose";
import Footer from "components/layout/footer";
import { getPage } from "lib/shopify";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) {
    return {
      title: "Page Not Found | Krishi Uddokta",
    };
  }

  return {
    title: page.seo?.title || `${page.title} | Krishi Uddokta`,
    description: page.seo?.description || page.bodySummary,
  };
}

export default async function Page(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="mb-6 text-2xl font-extrabold text-neutral-900 sm:text-4xl dark:text-white border-b border-emerald-100 pb-4 dark:border-neutral-800">
            {page.title}
          </h1>
          <Prose className="mb-8" html={page.body} />
          <div className="mt-8 border-t border-neutral-100 pt-4 text-xs text-neutral-400 dark:border-neutral-800">
            This document was updated on{" "}
            {new Intl.DateTimeFormat(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date(page.updatedAt))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
