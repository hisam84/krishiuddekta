import {
  getDbProducts,
  getDbProduct,
  getDbCollections,
  getDbCollectionProducts,
} from "lib/db/products";
import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "lib/constants";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
async function getCartCookie(): Promise<string | undefined> {
  try {
    const { cookies } = await import("next/headers");
    return (await cookies()).get("cartId")?.value;
  } catch (e) {
    return undefined;
  }
}
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import {
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
} from "./types";

const defaultDomain = "next-js-store.myshopify.com";
const defaultKey = "dd4fd4d048d28a49c9fb756317b9b7eb";

const rawDomain =
  process.env.SHOPIFY_STORE_DOMAIN &&
  !process.env.SHOPIFY_STORE_DOMAIN.includes("[")
    ? process.env.SHOPIFY_STORE_DOMAIN
    : defaultDomain;

const domain = ensureStartsWith(rawDomain, "https://");
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || defaultKey;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      // The Shopify API is only a fallback when the DB has no data;
      // fail fast instead of blocking the page on an unreachable host.
      signal: AbortSignal.timeout(5000),
    });

    const body = await result.json();

    if (body.errors) {
      console.warn("Shopify API Error:", body.errors[0]?.message);
      return {
        status: result.status,
        body: { data: {} } as T,
      };
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    console.warn("Shopify fetch warning:", e);
    return {
      status: 500,
      body: { data: {} } as T,
    };
  }
}

const removeEdgesAndNodes = <T>(array?: Connection<T> | null): T[] => {
  if (!array || !array.edges) return [];
  return array.edges.map((edge) => edge?.node).filter(Boolean) as T[];
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost = cart.cost || {};
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount?.currencyCode || "USD",
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines),
  };
};

const reshapeCollection = (
  collection?: ShopifyCollection | null,
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`,
  };
};

const reshapeCollections = (collections?: ShopifyCollection[] | null) => {
  const reshapedCollections = [];
  if (!collections) return [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image?.url?.match(/.*\/(.*)\..*/)?.[1] || "image";
    return {
      ...image,
      altText: image?.altText || `${productTitle} - ${filename}`,
    };
  });
};

const reshapeProduct = (
  product?: ShopifyProduct | null,
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags?.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
  };
};

const reshapeProducts = (products?: ShopifyProduct[] | null) => {
  const reshapedProducts = [];
  if (!products) return [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cartId = (await getCartCookie())!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await getCartCookie())!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cartId = (await getCartCookie())!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = await getCartCookie();

  if (!cartId) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body?.data?.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const dbProducts = await getDbCollectionProducts(collection);
  if (dbProducts.length > 0) {
    return dbProducts;
  }

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
    },
  });

  if (!res.body?.data?.collection) {
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products),
  );
}

export async function getCollections(): Promise<Collection[]> {
  const dbCollections = await getDbCollections();
  if (dbCollections.length > 0) {
    return dbCollections;
  }

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith("hidden"),
    ),
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const defaultMenu = [
    { title: "All Products", path: "/search" },
    { title: "Seeds & Saplings", path: "/search/seeds" },
    { title: "Fertilizers", path: "/search/fertilizer" },
    { title: "Agro Tools", path: "/search/tools" },
  ];

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  const shopifyMenuItems =
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url
        .replace(domain, "")
        .replace("/collections", "/search")
        .replace("/pages", ""),
    })) || [];

  return shopifyMenuItems.length > 0 ? shopifyMenuItems : defaultMenu;
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body?.data?.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body?.data?.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const dbProduct = await getDbProduct(handle);
  if (dbProduct) {
    return dbProduct;
  }

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body?.data?.product, false);
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  const dbProducts = await getDbProducts();
  if (dbProducts.length > 0) {
    return dbProducts.filter((p) => p.id !== productId).slice(0, 4);
  }

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });

  return reshapeProducts(res.body?.data?.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const dbProducts = await getDbProducts(query);
  if (dbProducts.length > 0) {
    return dbProducts;
  }

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return reshapeProducts(removeEdgesAndNodes(res.body?.data?.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = req.headers.get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  const { revalidateTag } = await import("next/cache");

  if (isCollectionUpdate) {
    (revalidateTag as any)(TAGS.collections, "seconds");
  }

  if (isProductUpdate) {
    (revalidateTag as any)(TAGS.products, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
