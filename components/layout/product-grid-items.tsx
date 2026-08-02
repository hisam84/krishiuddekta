import { ProductCard } from "components/product/ProductCard";
import { Product } from "lib/shopify/types";

export default function ProductGridItems({
  products,
}: {
  products: Product[];
}) {
  return (
    <>
      {products.map((product) => (
        <div key={product.handle} className="animate-fadeIn">
          <ProductCard
            id={product.id}
            handle={product.handle}
            title={product.title}
            description={product.description}
            price={Number(product.priceRange.maxVariantPrice.amount)}
            discountPrice={product.discountPrice}
            currency={product.priceRange.maxVariantPrice.currencyCode}
            imageUrl={product.featuredImage?.url}
            badge={product.badge}
            availableForSale={product.availableForSale}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>
      ))}
    </>
  );
}
