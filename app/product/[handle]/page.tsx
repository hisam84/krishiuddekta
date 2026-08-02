import Footer from "components/layout/footer";
import { Gallery } from "components/product/gallery";
import { ProductDescription } from "components/product/product-description";
import { ProductReviewsSection } from "components/product/product-reviews";
import { ProductCard } from "components/product/ProductCard";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import { getProduct, getProductRecommendations } from "lib/shopify";
import { getDbReviews } from "lib/db/products";
import type { Image } from "lib/shopify/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: `${product.title} | Krishi Uddokta`,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const initialReviews = await getDbReviews(product.id);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 5.0,
      reviewCount: initialReviews.length || product.reviewCount || 12,
    },
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs lg:flex-row lg:gap-12 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="h-full w-full basis-full lg:basis-3/5">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
              }
            >
              <Gallery
                images={product.images.slice(0, 5).map((image: Image) => ({
                  src: image.url,
                  altText: image.altText,
                }))}
              />
            </Suspense>
          </div>

          <div className="basis-full lg:basis-2/5">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
            </Suspense>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ProductReviewsSection productId={product.id} initialReviews={initialReviews as any[]} />

        {/* Related Products Carousel */}
        <RelatedProducts id={product.id} />
      </div>
      <Footer />
    </>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-12 border-t border-neutral-200 mt-12 dark:border-neutral-800">
      <h2 className="mb-6 text-xl font-extrabold text-neutral-900 dark:text-white">
        Related Agro Products
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.slice(0, 4).map((p) => (
          <ProductCard
            key={p.handle}
            id={p.id}
            handle={p.handle}
            title={p.title}
            description={p.description}
            price={Number(p.priceRange.maxVariantPrice.amount)}
            discountPrice={p.discountPrice}
            currency={p.priceRange.maxVariantPrice.currencyCode}
            imageUrl={p.featuredImage?.url}
            badge={p.badge}
            availableForSale={p.availableForSale}
            rating={p.rating}
            reviewCount={p.reviewCount}
          />
        ))}
      </div>
    </div>
  );
}
