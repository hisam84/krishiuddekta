import { getDb } from "./index";
import { DbOrder, DbProduct, DbCollection, DbPage, DbShippingClass, initDatabase } from "./schema";
import { Product, Collection, Page, ShippingClass } from "lib/shopify/types";

let dbInitialized = false;
let initPromise: Promise<unknown> | null = null;

async function ensureDb() {
  if (dbInitialized) return true;

  // Dedupe concurrent initialization attempts and avoid re-running the
  // (slow) schema setup on every request, even if it transiently fails.
  if (!initPromise) {
    initPromise = initDatabase()
      .then(() => {
        dbInitialized = true;
      })
      .catch((e) => {
        console.error("initDatabase failed:", e);
        dbInitialized = true;
      })
      .finally(() => {
        initPromise = null;
      });
  }

  return initPromise;
}

const cache = new Map<string, { value: any; expiresAt: number }>();
// Long TTL since the DB is only written through the app (which calls
// clearCache()), giving consistent, fast loads even when the Neon
// connection is slow or flaky.
const CACHE_TTL_MS = 600_000;

// Persist successful fetches to disk so the store keeps working (with
// last-known-good data) even when the Neon database is unreachable.
// fs/path are imported dynamically and only used on the server so this
// module can also be bundled for the client without Node builtins.
const DISK_CACHE_REL_DIR = ".next/cache/product-data";

async function readDiskCache(key: string): Promise<any | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const fs = await import("fs");
    const { join } = await import("path");
    const { cwd } = await import("process");
    const data = await fs.promises.readFile(
      join(cwd(), DISK_CACHE_REL_DIR, `${key}.json`),
      "utf-8",
    );
    return JSON.parse(data);
  } catch (e) {
    return undefined;
  }
}

async function writeDiskCache(key: string, value: any) {
  if (typeof window !== "undefined") return;
  try {
    const fs = await import("fs");
    const { join } = await import("path");
    const { cwd } = await import("process");
    await fs.promises.mkdir(join(cwd(), DISK_CACHE_REL_DIR), { recursive: true });
    await fs.promises.writeFile(
      join(cwd(), DISK_CACHE_REL_DIR, `${key}.json`),
      JSON.stringify(value),
      "utf-8",
    );
  } catch (e) {
    // Ignore disk write failures
  }
}

async function clearDiskCache() {
  if (typeof window !== "undefined") return;
  try {
    const fs = await import("fs");
    const { join } = await import("path");
    const { cwd } = await import("process");
    await fs.promises.rm(join(cwd(), DISK_CACHE_REL_DIR), { recursive: true, force: true });
  } catch (e) {
    // Ignore
  }
}

function isEmptyValue(value: any): boolean {
  return (
    value == null ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  );
}

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  // Last-known-good disk data: serve it immediately instead of waiting out a
  // slow/timing-out DB connection, and refresh from the DB in the background.
  const disk = await readDiskCache(key);
  if (disk !== undefined) {
    cache.set(key, { value: disk, expiresAt: Date.now() + CACHE_TTL_MS });
    void fn()
      .then((fresh) => {
        if (!isEmptyValue(fresh)) {
          cache.set(key, {
            value: fresh,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });
          void writeDiskCache(key, fresh);
        }
      })
      .catch(() => {
        // Background refresh failed; last-known-good data is still served.
      });
    return disk as T;
  }

  const value = await fn();

  // Don't cache empty results so transient DB failures aren't sticky.
  const isEmpty = isEmptyValue(value);

  if (!isEmpty) {
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    void writeDiskCache(key, value);
    return value;
  }

  return value;
}

function clearCache() {
  cache.clear();
  void clearDiskCache();
}

export function formatDbProductToProduct(item: DbProduct): Product {
  const priceAmount = Number(item.price || 0).toFixed(2);
  // Base64 data-URI images would be inlined dozens of times into the HTML
  // (meta tags, RSC payload, <img> tags), ballooning the page size to many MB.
  // Serve them once through the image proxy route instead.
  const rawImageUrl = item.image_url || "";
  const imageUrl = rawImageUrl.startsWith("data:")
    ? `/api/product-image/${item.id}`
    : rawImageUrl ||
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800";

  return {
    id: item.id,
    handle: item.handle,
    availableForSale: Boolean(item.available),
    title: item.title,
    description: item.description || "",
    shortDescription: item.short_description || "",
    shippingClassId: item.shipping_class_id || "sc-standard",
    descriptionHtml: `<p>${item.description || ""}</p>`,
    options: [
      {
        id: "opt-default",
        name: "Type",
        values: ["Standard"],
      },
    ],
    priceRange: {
      maxVariantPrice: {
        amount: priceAmount,
        currencyCode: item.currency || "BDT",
      },
      minVariantPrice: {
        amount: priceAmount,
        currencyCode: item.currency || "BDT",
      },
    },
    featuredImage: {
      url: imageUrl,
      altText: item.title,
      width: 800,
      height: 800,
    },
    images: [
      {
        url: imageUrl,
        altText: item.title,
        width: 800,
        height: 800,
      },
    ],
    variants: [
      {
        id: `var-${item.id}`,
        title: "Default",
        availableForSale: Boolean(item.available),
        selectedOptions: [{ name: "Type", value: "Standard" }],
        price: { amount: priceAmount, currencyCode: item.currency || "BDT" },
      },
    ],
    seo: {
      title: item.title,
      description: item.short_description || item.description || "",
    },
    tags: [item.category || "general"],
    discountPrice: item.discount_price
      ? Number(item.discount_price)
      : undefined,
    badge: item.badge || undefined,
    isBestSeller: Boolean(item.is_bestseller),
    rating: item.rating ? Number(item.rating) : 5.0,
    reviewCount: item.review_count ? Number(item.review_count) : 12,
    updatedAt: item.created_at || new Date().toISOString(),
  };
}

export async function getDbProducts(query?: string): Promise<Product[]> {
  const cacheKey = `products:${query || "all"}`;

  const result = await cached(cacheKey, async () => {
    try {
      await ensureDb();
      const sql = getDb();
      let rows: DbProduct[];

      if (query) {
        rows = (await sql`
          SELECT * FROM products 
          WHERE title ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`}
          ORDER BY created_at DESC;
        `) as DbProduct[];
      } else {
        rows =
          (await sql`SELECT * FROM products ORDER BY created_at DESC;`) as DbProduct[];
      }

      return rows.map(formatDbProductToProduct);
    } catch (error) {
      console.error("Error fetching products from Neon:", error);
      return [];
    }
  });

  // During a DB outage the query-specific fetch returns empty; fall back to
  // filtering last-known-good data so search still works offline.
  if (query && Array.isArray(result) && result.length === 0) {
    const allProducts = await getDbProducts();
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function getDbProduct(
  handle: string,
): Promise<Product | undefined> {
  const cacheKey = `product:${handle}`;

  return cached(cacheKey, async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows =
        (await sql`SELECT * FROM products WHERE handle = ${handle} LIMIT 1;`) as DbProduct[];
      if (rows.length > 0 && rows[0]) {
        return formatDbProductToProduct(rows[0]);
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching product ${handle} from Neon:`, error);
      return undefined;
    }
  });
}

export async function getDbCollections(): Promise<Collection[]> {
  const cacheKey = "collections";

  return cached(cacheKey, async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows = await sql`SELECT * FROM collections;`;

      const collections: Collection[] = rows.map((col: any) => ({
        handle: col.handle,
        title: col.title,
        description: col.description || "",
        seo: {
          title: col.title,
          description: col.description || "",
        },
        path: `/search/${col.handle}`,
        updatedAt: new Date().toISOString(),
      }));

      return [
        {
          handle: "",
          title: "All Products",
          description: "All premium agricultural products",
          seo: { title: "All Products", description: "Agricultural products" },
          path: "/search",
          updatedAt: new Date().toISOString(),
        },
        ...collections,
      ];
    } catch (error) {
      console.error("Error fetching collections from Neon:", error);
      return [
        {
          handle: "",
          title: "All Products",
          description: "Agricultural products",
          seo: { title: "All Products", description: "Agricultural products" },
          path: "/search",
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  });
}

export async function getDbProductById(
  id: string,
): Promise<DbProduct | undefined> {
  const cacheKey = `db-product-by-id:${id}`;

  return cached(cacheKey, async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows =
        (await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1;`) as DbProduct[];
      return rows[0];
    } catch (error) {
      console.error(`Error fetching product ${id} by id from Neon:`, error);
      return undefined;
    }
  });
}

export async function getDbCollectionProducts(
  categoryHandle: string,
): Promise<Product[]> {
  const cacheKey = `collection-products:${categoryHandle}`;

  return cached(cacheKey, async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows = (await sql`
        SELECT * FROM products WHERE category = ${categoryHandle} ORDER BY created_at DESC;
      `) as DbProduct[];
      return rows.map(formatDbProductToProduct);
    } catch (error) {
      console.error(
        `Error fetching collection products for ${categoryHandle}:`,
        error,
      );
      return [];
    }
  });
}

export async function addDbProduct(data: {
  title: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  badge?: string;
  image_url: string;
  category: string;
  shipping_class_id?: string;
}): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const id = `prod-${Date.now()}`;
    const handle =
      data.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    await sql`
      INSERT INTO products (id, handle, title, description, short_description, price, discount_price, currency, image_url, category, shipping_class_id, badge, available)
      VALUES (${id}, ${handle}, ${data.title}, ${data.description}, ${data.short_description || ""}, ${data.price}, ${data.discount_price || null}, 'BDT', ${data.image_url}, ${data.category}, ${data.shipping_class_id || "sc-standard"}, ${data.badge || "Best Seller"}, true);
    `;
    clearCache();
    return true;
  } catch (error) {
    console.error("Failed to add product:", error);
    return false;
  }
}

export async function updateDbProduct(
  id: string,
  data: {
    title?: string;
    description?: string;
    short_description?: string;
    price?: number;
    discount_price?: number;
    badge?: string;
    image_url?: string;
    category?: string;
    shipping_class_id?: string;
    available?: boolean;
  },
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();

    if (data.title !== undefined)
      await sql`UPDATE products SET title = ${data.title} WHERE id = ${id}`;
    if (data.description !== undefined)
      await sql`UPDATE products SET description = ${data.description} WHERE id = ${id}`;
    if (data.short_description !== undefined)
      await sql`UPDATE products SET short_description = ${data.short_description} WHERE id = ${id}`;
    if (data.price !== undefined)
      await sql`UPDATE products SET price = ${data.price} WHERE id = ${id}`;
    if (data.discount_price !== undefined)
      await sql`UPDATE products SET discount_price = ${data.discount_price} WHERE id = ${id}`;
    if (data.badge !== undefined)
      await sql`UPDATE products SET badge = ${data.badge} WHERE id = ${id}`;
    if (data.image_url !== undefined)
      await sql`UPDATE products SET image_url = ${data.image_url} WHERE id = ${id}`;
    if (data.category !== undefined)
      await sql`UPDATE products SET category = ${data.category} WHERE id = ${id}`;
    if (data.shipping_class_id !== undefined)
      await sql`UPDATE products SET shipping_class_id = ${data.shipping_class_id} WHERE id = ${id}`;
    if (data.available !== undefined)
      await sql`UPDATE products SET available = ${data.available} WHERE id = ${id}`;

    clearCache();
    return true;
  } catch (error) {
    console.error("Failed to update product:", error);
    return false;
  }
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    await sql`DELETE FROM products WHERE id = ${id};`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Failed to delete product:", error);
    return false;
  }
}

export async function getDbOrders(): Promise<DbOrder[]> {
  try {
    await ensureDb();
    const sql = getDb();
    const rows =
      (await sql`SELECT * FROM orders ORDER BY created_at DESC;`) as DbOrder[];
    return rows;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function createDbOrder(orderData: {
  customer_name: string;
  customer_phone: string;
  address: string;
  district: string;
  total_amount: number;
  items: any[];
}): Promise<string | null> {
  try {
    await ensureDb();
    const sql = getDb();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const itemsJson = JSON.stringify(orderData.items);

    await sql`
      INSERT INTO orders (id, customer_name, customer_phone, address, district, total_amount, status, items)
      VALUES (${orderId}, ${orderData.customer_name}, ${orderData.customer_phone}, ${orderData.address}, ${orderData.district}, ${orderData.total_amount}, 'Pending', ${itemsJson});
    `;
    return orderId;
  } catch (error) {
    console.error("Failed to create order:", error);
    return null;
  }
}

export async function updateDbOrderStatus(
  id: string,
  status: string,
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id};`;
    return true;
  } catch (error) {
    console.error("Failed to update order status:", error);
    return false;
  }
}

const reviewCache = new Map<string, { value: any; expiresAt: number }>();
// Shorter TTL than product data (and caches empty results too) so page loads
// stay fast even when there are no reviews yet or the DB is slow, while new
// reviews still appear within a minute.
const REVIEW_CACHE_TTL_MS = 60_000;

export async function getDbReviews(productId: string) {
  const hit = reviewCache.get(productId);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value;
  }
  try {
    await ensureDb();
    const sql = getDb();
    const rows =
      await sql`SELECT * FROM reviews WHERE product_id = ${productId} ORDER BY created_at DESC;`;
    reviewCache.set(productId, {
      value: rows,
      expiresAt: Date.now() + REVIEW_CACHE_TTL_MS,
    });
    return rows;
  } catch (error) {
    console.error(`Error fetching reviews for ${productId}:`, error);
    return [];
  }
}

export async function addDbReview(data: {
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
}): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const id = `rev-${Date.now()}`;
    await sql`
      INSERT INTO reviews (id, product_id, reviewer_name, rating, comment)
      VALUES (${id}, ${data.product_id}, ${data.reviewer_name}, ${data.rating}, ${data.comment});
    `;
    return true;
  } catch (error) {
    console.error("Failed to add review:", error);
    return false;
  }
}

export async function getDbSettings(): Promise<Record<string, string>> {
  return cached("settings", async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows = await sql`SELECT key, value FROM settings;`;
      const settingsMap: Record<string, string> = {};
      rows.forEach((r: any) => {
        settingsMap[r.key] = r.value;
      });
      return settingsMap;
    } catch (error) {
      console.error("Error fetching settings:", error);
      return {};
    }
  });
}

export async function updateDbSettings(
  settings: Record<string, string>,
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    for (const [key, value] of Object.entries(settings)) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = ${value};
      `;
    }
    clearCache();
    return true;
  } catch (error) {
    console.error("Error updating settings:", error);
    return false;
  }
}

// Category / Collection Management
export async function addDbCollection(data: {
  title: string;
  description?: string;
}): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const handle = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");
    const id = `col-${Date.now()}`;

    await sql`
      INSERT INTO collections (id, handle, title, description)
      VALUES (${id}, ${handle}, ${data.title}, ${data.description || ""});
    `;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error adding collection:", error);
    return false;
  }
}

export async function updateDbCollection(
  handle: string,
  data: { title?: string; description?: string },
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    if (data.title !== undefined)
      await sql`UPDATE collections SET title = ${data.title} WHERE handle = ${handle}`;
    if (data.description !== undefined)
      await sql`UPDATE collections SET description = ${data.description} WHERE handle = ${handle}`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error updating collection:", error);
    return false;
  }
}

export async function deleteDbCollection(handle: string): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    await sql`DELETE FROM collections WHERE handle = ${handle};`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error deleting collection:", error);
    return false;
  }
}

// Shipping Classes Management
export async function getDbShippingClasses(): Promise<ShippingClass[]> {
  return cached("shipping_classes", async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows = (await sql`SELECT * FROM shipping_classes;`) as DbShippingClass[];
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        cost: Number(r.cost),
        description: r.description || "",
      }));
    } catch (error) {
      console.error("Error fetching shipping classes:", error);
      return [
        { id: "sc-standard", name: "Standard Delivery", slug: "standard-delivery", cost: 60, description: "Standard fee" },
        { id: "sc-heavy", name: "Heavy Equipment", slug: "heavy-equipment", cost: 250, description: "Heavy fee" },
        { id: "sc-free", name: "Free Shipping", slug: "free-shipping", cost: 0, description: "Free fee" },
      ];
    }
  });
}

export async function addDbShippingClass(data: {
  name: string;
  cost: number;
  description?: string;
}): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");
    const id = `sc-${Date.now()}`;

    await sql`
      INSERT INTO shipping_classes (id, name, slug, cost, description)
      VALUES (${id}, ${data.name}, ${slug}, ${data.cost}, ${data.description || ""});
    `;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error adding shipping class:", error);
    return false;
  }
}

export async function updateDbShippingClass(
  id: string,
  data: { name?: string; cost?: number; description?: string },
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    if (data.name !== undefined)
      await sql`UPDATE shipping_classes SET name = ${data.name} WHERE id = ${id}`;
    if (data.cost !== undefined)
      await sql`UPDATE shipping_classes SET cost = ${data.cost} WHERE id = ${id}`;
    if (data.description !== undefined)
      await sql`UPDATE shipping_classes SET description = ${data.description} WHERE id = ${id}`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error updating shipping class:", error);
    return false;
  }
}

export async function deleteDbShippingClass(id: string): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    await sql`DELETE FROM shipping_classes WHERE id = ${id};`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error deleting shipping class:", error);
    return false;
  }
}

// Custom Dynamic Pages Management
export async function getDbPages(): Promise<Page[]> {
  return cached("pages", async () => {
    try {
      await ensureDb();
      const sql = getDb();
      const rows = (await sql`SELECT * FROM pages ORDER BY created_at DESC;`) as DbPage[];
      return rows.map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        body: p.body,
        bodySummary: p.body_summary || "",
        seo: { title: p.title, description: p.body_summary || "" },
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  });
}

export async function getDbPage(handle: string): Promise<Page | undefined> {
  const pages = await getDbPages();
  return pages.find((p) => p.handle === handle);
}

export async function addDbPage(data: {
  title: string;
  body: string;
  body_summary?: string;
}): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const handle = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");
    const id = `page-${Date.now()}`;

    await sql`
      INSERT INTO pages (id, handle, title, body, body_summary)
      VALUES (${id}, ${handle}, ${data.title}, ${data.body}, ${data.body_summary || ""});
    `;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error adding page:", error);
    return false;
  }
}

export async function updateDbPage(
  id: string,
  data: { title?: string; body?: string; body_summary?: string },
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const now = new Date().toISOString();
    if (data.title !== undefined)
      await sql`UPDATE pages SET title = ${data.title}, updated_at = ${now} WHERE id = ${id}`;
    if (data.body !== undefined)
      await sql`UPDATE pages SET body = ${data.body}, updated_at = ${now} WHERE id = ${id}`;
    if (data.body_summary !== undefined)
      await sql`UPDATE pages SET body_summary = ${data.body_summary}, updated_at = ${now} WHERE id = ${id}`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error updating page:", error);
    return false;
  }
}

export async function deleteDbPage(id: string): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    await sql`DELETE FROM pages WHERE id = ${id};`;
    clearCache();
    return true;
  } catch (error) {
    console.error("Error deleting page:", error);
    return false;
  }
}
