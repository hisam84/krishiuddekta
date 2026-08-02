import { getDb } from "./index";
import { DbOrder, DbProduct, initDatabase } from "./schema";
import { Product, Collection } from "lib/shopify/types";

let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export function formatDbProductToProduct(item: DbProduct): Product {
  const priceAmount = Number(item.price || 0).toFixed(2);
  const imageUrl =
    item.image_url ||
    "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800";

  return {
    id: item.id,
    handle: item.handle,
    availableForSale: Boolean(item.available),
    title: item.title,
    description: item.description || "",
    descriptionHtml: `<p>${item.description || ""}</p>`,
    options: [
      {
        id: "opt-default",
        name: "Type",
        values: ["Standard"],
      },
    ],
    priceRange: {
      maxVariantPrice: { amount: priceAmount, currencyCode: item.currency || "BDT" },
      minVariantPrice: { amount: priceAmount, currencyCode: item.currency || "BDT" },
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
      description: item.description || "",
    },
    tags: [item.category || "general"],
    updatedAt: item.created_at || new Date().toISOString(),
  };
}

export async function getDbProducts(query?: string): Promise<Product[]> {
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
      rows = (await sql`SELECT * FROM products ORDER BY created_at DESC;`) as DbProduct[];
    }

    return rows.map(formatDbProductToProduct);
  } catch (error) {
    console.error("Error fetching products from Neon:", error);
    return [];
  }
}

export async function getDbProduct(handle: string): Promise<Product | undefined> {
  try {
    await ensureDb();
    const sql = getDb();
    const rows = (await sql`SELECT * FROM products WHERE handle = ${handle} LIMIT 1;`) as DbProduct[];
    if (rows.length > 0 && rows[0]) {
      return formatDbProductToProduct(rows[0]);
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching product ${handle} from Neon:`, error);
    return undefined;
  }
}

export async function getDbCollections(): Promise<Collection[]> {
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
}

export async function getDbCollectionProducts(categoryHandle: string): Promise<Product[]> {
  try {
    await ensureDb();
    const sql = getDb();
    const rows = (await sql`
      SELECT * FROM products WHERE category = ${categoryHandle} ORDER BY created_at DESC;
    `) as DbProduct[];
    return rows.map(formatDbProductToProduct);
  } catch (error) {
    console.error(`Error fetching collection products for ${categoryHandle}:`, error);
    return [];
  }
}

export async function addDbProduct(data: {
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();
    const id = `prod-${Date.now()}`;
    const handle = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    await sql`
      INSERT INTO products (id, handle, title, description, price, currency, image_url, category, available)
      VALUES (${id}, ${handle}, ${data.title}, ${data.description}, ${data.price}, 'BDT', ${data.image_url}, ${data.category}, true);
    `;
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
    price?: number;
    image_url?: string;
    category?: string;
    available?: boolean;
  }
): Promise<boolean> {
  try {
    await ensureDb();
    const sql = getDb();

    if (data.title !== undefined) await sql`UPDATE products SET title = ${data.title} WHERE id = ${id}`;
    if (data.description !== undefined) await sql`UPDATE products SET description = ${data.description} WHERE id = ${id}`;
    if (data.price !== undefined) await sql`UPDATE products SET price = ${data.price} WHERE id = ${id}`;
    if (data.image_url !== undefined) await sql`UPDATE products SET image_url = ${data.image_url} WHERE id = ${id}`;
    if (data.category !== undefined) await sql`UPDATE products SET category = ${data.category} WHERE id = ${id}`;
    if (data.available !== undefined) await sql`UPDATE products SET available = ${data.available} WHERE id = ${id}`;

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
    const rows = (await sql`SELECT * FROM orders ORDER BY created_at DESC;`) as DbOrder[];
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

export async function updateDbOrderStatus(id: string, status: string): Promise<boolean> {
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
