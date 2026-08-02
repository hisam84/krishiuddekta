import { getDb } from "./index";

export interface DbProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  currency: string;
  image_url: string;
  category: string;
  available: boolean;
  badge?: string;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

export interface DbCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

export interface DbOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  district: string;
  total_amount: number;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  items: string; // JSON string of cart items
  created_at?: string;
}

export interface DbReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface DbSetting {
  key: string;
  value: string;
}

export async function initDatabase() {
  const sql = getDb();

  try {
    // 1. Create Products Table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        handle VARCHAR(150) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        discount_price NUMERIC(10, 2),
        currency VARCHAR(10) DEFAULT 'BDT',
        image_url TEXT,
        category VARCHAR(100) DEFAULT 'general',
        available BOOLEAN DEFAULT TRUE,
        badge VARCHAR(50),
        is_bestseller BOOLEAN DEFAULT FALSE,
        is_new_arrival BOOLEAN DEFAULT FALSE,
        rating NUMERIC(3, 2) DEFAULT 5.0,
        review_count INT DEFAULT 12,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Add Missing Columns dynamically if existing table lacks them
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10, 2);`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE;`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0;`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 12;`;
    } catch (e) {
      // Ignore if columns already exist
    }

    // 3. Create Collections/Categories Table
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id VARCHAR(100) PRIMARY KEY,
        handle VARCHAR(150) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `;

    // 4. Create Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        district VARCHAR(100) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        items TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Create Reviews Table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100) NOT NULL,
        reviewer_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Create Settings Table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    // Insert Default Hero Settings if empty
    const existingSettings = await sql`SELECT COUNT(*) as count FROM settings;`;
    if (Number(existingSettings[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES 
        ('hero_badge', '100% Pure & Organic Agro Products'),
        ('hero_title', 'Krishi Uddokta — Premium Seeds, Fertilizers & Agro Tools'),
        ('hero_subtitle', 'Directly source high-yield hybrid seeds, organic vermicompost, and modern agricultural equipment with nationwide Cash on Delivery.'),
        ('hero_button_text', 'Shop Now'),
        ('hero_button_url', '/search'),
        ('hero_image', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=1200');
      `;
    }

    // Insert Default Sample Agricultural Products if empty
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products;`;
    if (Number(existingProducts[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO products (id, handle, title, description, price, discount_price, currency, image_url, category, available, badge, is_bestseller, is_new_arrival, rating, review_count)
        VALUES 
        (
          'prod-1', 
          'high-yield-tomato-seeds', 
          'High Yield Hybrid Tomato Seeds (50g)', 
          'Disease-resistant high yielding hybrid tomato seeds. Provides excellent harvest under diverse weather conditions.', 
          350.00, 
          290.00,
          'BDT', 
          'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800', 
          'seeds', 
          true,
          'Best Seller',
          true,
          false,
          4.9,
          24
        ),
        (
          'prod-2', 
          'organic-vermicompost-fertilizer', 
          'Organic Vermicompost Fertilizer (10kg)', 
          '100% natural and eco-friendly vermicompost fertilizer. Enhances soil fertility and root growth.', 
          450.00, 
          380.00,
          'BDT', 
          'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800', 
          'fertilizer', 
          true,
          '100% Organic',
          true,
          true,
          5.0,
          18
        ),
        (
          'prod-3', 
          'battery-operated-agriculture-sprayer', 
          'Battery Operated Agriculture Sprayer (16L)', 
          'Heavy duty battery powered sprayer for automatic pesticide and fertilizer application.', 
          3200.00, 
          2850.00,
          'BDT', 
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800', 
          'tools', 
          true,
          'Top Equipment',
          false,
          true,
          4.8,
          15
        ),
        (
          'prod-4', 
          'thai-baramasi-mango-sapling', 
          'Thai All-Season Grafted Mango Sapling', 
          'Grafted premium Thai Katimon mango plant suitable for rooftop gardening and tubs.', 
          550.00, 
          490.00,
          'BDT', 
          'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800', 
          'plants', 
          true,
          'Popular',
          true,
          false,
          4.9,
          30
        );
      `;
    }

    // Insert Default Sample Reviews if empty
    const existingReviews = await sql`SELECT COUNT(*) as count FROM reviews;`;
    if (Number(existingReviews[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO reviews (id, product_id, reviewer_name, rating, comment)
        VALUES 
        ('rev-1', 'prod-1', 'Abul Hossain', 5, 'Germination rate was over 95%. Excellent yield of hybrid tomatoes!'),
        ('rev-2', 'prod-1', 'Jasim Uddin', 5, 'Best seeds I have bought online. Super fast delivery.'),
        ('rev-3', 'prod-2', 'Dr. Nazmul Islam', 5, 'Soil fertility improved remarkably within two weeks of using this vermicompost.'),
        ('rev-4', 'prod-3', 'Kabir Mahmud', 4, 'Heavy duty battery sprayer. Saved hours of labor on my orchard.');
      `;
    }

    // Insert Default Collections if empty
    const existingCollections = await sql`SELECT COUNT(*) as count FROM collections;`;
    if (Number(existingCollections[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO collections (id, handle, title, description)
        VALUES 
        ('col-1', 'seeds', 'Seeds & Saplings', 'High-yielding crop seeds and plant saplings'),
        ('col-2', 'fertilizer', 'Organic & Bio Fertilizers', 'Essential organic fertilizers for soil nutrition'),
        ('col-3', 'tools', 'Agro Tools & Equipment', 'Modern and durable agricultural equipment');
      `;
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
    return { success: false, error };
  }
}
