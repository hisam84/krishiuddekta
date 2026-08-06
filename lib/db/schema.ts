import { getDb } from "./index";

export interface DbProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  currency: string;
  image_url: string;
  thumbnail_url?: string;
  gallery_images?: string;
  category: string;
  shipping_class_id?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  available: boolean;
  badge?: string;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

export interface DbMedia {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string;
  size_bytes: number;
  created_at?: string;
}

export interface DbCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

export interface DbPage {
  id: string;
  handle: string;
  title: string;
  body: string;
  body_summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbShippingClass {
  id: string;
  name: string;
  slug: string;
  cost: number;
  description?: string;
}

export interface DbShippingMethod {
  id: string;
  name: string;
  location_type: string;
  base_cost: number;
  calculation_type: "per_order" | "per_class";
  class_costs: string;
  is_active: boolean;
  description?: string;
}

export interface DbOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  district: string;
  division?: string;
  subtotal?: number;
  delivery_charge?: number;
  payment_method?: string;
  total_amount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Cancelled";
  items: string; // JSON string of cart items
  internal_notes?: string;
  public_notes?: string;
  status_history?: string; // JSON string of status history log
  consignment_id?: string;
  tracking_code?: string;
  steadfast_status?: string;
  steadfast_submitted_at?: string;
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
    // Quick check if database is already initialized (0ms overhead on cold starts)
    const check = await sql`SELECT 1 FROM products LIMIT 1;`;
    if (check && check.length >= 0) {
      return { success: true };
    }
  } catch (e) {
    // Table missing — proceed to run full schema initialization below
  }

  try {
    // Run table schema creation concurrently to eliminate DB cold-start latency
    await Promise.all([
      sql`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          handle VARCHAR(150) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          short_description TEXT,
          price NUMERIC(10, 2) NOT NULL,
          discount_price NUMERIC(10, 2),
          currency VARCHAR(10) DEFAULT 'BDT',
          image_url TEXT,
          thumbnail_url TEXT,
          gallery_images TEXT,
          category VARCHAR(100) DEFAULT 'general',
          shipping_class_id VARCHAR(100) DEFAULT 'sc-standard',
          stock_quantity INT DEFAULT 50,
          min_stock_level INT DEFAULT 5,
          available BOOLEAN DEFAULT TRUE,
          badge VARCHAR(50),
          is_bestseller BOOLEAN DEFAULT FALSE,
          is_new_arrival BOOLEAN DEFAULT FALSE,
          rating NUMERIC(3, 2) DEFAULT 5.0,
          review_count INT DEFAULT 12,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS media (
          id VARCHAR(100) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          thumbnail_url TEXT NOT NULL,
          size_bytes INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS collections (
          id VARCHAR(100) PRIMARY KEY,
          handle VARCHAR(150) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS pages (
          id VARCHAR(100) PRIMARY KEY,
          handle VARCHAR(150) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          body_summary TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS shipping_classes (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          slug VARCHAR(150) UNIQUE NOT NULL,
          cost NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
          description TEXT
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS shipping_methods (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          location_type VARCHAR(50) DEFAULT 'dhaka',
          base_cost NUMERIC(10, 2) DEFAULT 0.00,
          calculation_type VARCHAR(50) DEFAULT 'per_order',
          class_costs TEXT DEFAULT '{}',
          is_active BOOLEAN DEFAULT TRUE,
          description TEXT
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(100) PRIMARY KEY,
          customer_name VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          address TEXT NOT NULL,
          district VARCHAR(100) NOT NULL,
          division VARCHAR(100) DEFAULT 'Dhaka',
          subtotal NUMERIC(10, 2) DEFAULT 0.00,
          delivery_charge NUMERIC(10, 2) DEFAULT 60.00,
          payment_method VARCHAR(50) DEFAULT 'COD',
          total_amount NUMERIC(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'Pending',
          items TEXT NOT NULL,
          internal_notes TEXT DEFAULT '',
          public_notes TEXT DEFAULT '',
          status_history TEXT DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id VARCHAR(100) PRIMARY KEY,
          product_id VARCHAR(100) NOT NULL,
          reviewer_name VARCHAR(255) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
      sql`
        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL
        );
      `,
    ]);

    // Add missing columns dynamically if needed (concurrently)
    try {
      await Promise.all([
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_class_id VARCHAR(100) DEFAULT 'sc-standard';`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images TEXT;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 50;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_level INT DEFAULT 5;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10, 2);`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0;`,
        sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 12;`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS division VARCHAR(100) DEFAULT 'Dhaka';`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0.00;`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC(10, 2) DEFAULT 60.00;`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD';`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT '';`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_notes TEXT DEFAULT '';`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history TEXT DEFAULT '[]';`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS consignment_id VARCHAR(100);`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100);`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS steadfast_status VARCHAR(50);`,
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS steadfast_submitted_at TIMESTAMP WITH TIME ZONE;`,
      ]);
    } catch (e) {}

    // Insert Default Hero Settings if empty
    await Promise.all([
      sql`
        INSERT INTO settings (key, value)
        VALUES 
        ('hero_badge', '100% Pure & Organic Agro Products'),
        ('hero_title', 'Krishi Uddokta — Premium Seeds, Fertilizers & Agro Tools'),
        ('hero_subtitle', 'Directly source high-yield hybrid seeds, organic vermicompost, and modern agricultural equipment with nationwide Cash on Delivery.'),
        ('hero_button_text', 'Shop Now'),
        ('hero_button_url', '/search'),
        ('hero_image', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=1200')
        ON CONFLICT (key) DO NOTHING;
      `,
      sql`
        INSERT INTO products (id, handle, title, description, price, discount_price, currency, image_url, category, available, badge, is_bestseller, is_new_arrival, rating, review_count)
        VALUES 
        ('prod-1', 'high-yield-tomato-seeds', 'High Yield Hybrid Tomato Seeds (50g)', 'Disease-resistant high yielding hybrid tomato seeds. Provides excellent harvest under diverse weather conditions.', 350.00, 290.00, 'BDT', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800', 'seeds', true, 'Best Seller', true, false, 4.9, 24),
        ('prod-2', 'organic-vermicompost-fertilizer', 'Organic Vermicompost Fertilizer (10kg)', '100% natural and eco-friendly vermicompost fertilizer. Enhances soil fertility and root growth.', 450.00, 380.00, 'BDT', 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800', 'fertilizer', true, '100% Organic', true, true, 5.0, 18),
        ('prod-3', 'battery-operated-agriculture-sprayer', 'Battery Operated Agriculture Sprayer (16L)', 'Heavy duty battery powered sprayer for automatic pesticide and fertilizer application.', 3200.00, 2850.00, 'BDT', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800', 'tools', true, 'Top Equipment', false, true, 4.8, 15),
        ('prod-4', 'thai-baramasi-mango-sapling', 'Thai All-Season Grafted Mango Sapling', 'Grafted premium Thai Katimon mango plant suitable for rooftop gardening and tubs.', 550.00, 490.00, 'BDT', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800', 'plants', true, 'Popular', true, false, 4.9, 30)
        ON CONFLICT (id) DO NOTHING;
      `,
      sql`
        INSERT INTO reviews (id, product_id, reviewer_name, rating, comment)
        VALUES 
        ('rev-1', 'prod-1', 'Abul Hossain', 5, 'Germination rate was over 95%. Excellent yield of hybrid tomatoes!'),
        ('rev-2', 'prod-1', 'Jasim Uddin', 5, 'Best seeds I have bought online. Super fast delivery.'),
        ('rev-3', 'prod-2', 'Dr. Nazmul Islam', 5, 'Soil fertility improved remarkably within two weeks of using this vermicompost.'),
        ('rev-4', 'prod-3', 'Kabir Mahmud', 4, 'Heavy duty battery sprayer. Saved hours of labor on my orchard.')
        ON CONFLICT (id) DO NOTHING;
      `,
      sql`
        INSERT INTO collections (id, handle, title, description)
        VALUES 
        ('col-1', 'seeds', 'Seeds & Saplings', 'High-yielding crop seeds and plant saplings'),
        ('col-2', 'fertilizer', 'Organic & Bio Fertilizers', 'Essential organic fertilizers for soil nutrition'),
        ('col-3', 'tools', 'Agro Tools & Equipment', 'Modern and durable agricultural equipment')
        ON CONFLICT (id) DO NOTHING;
      `,
      sql`
        INSERT INTO pages (id, handle, title, body, body_summary)
        VALUES 
        ('page-about', 'about', 'About Us | আমাদের সম্পর্কে', '<p><strong>কৃষি উদ্যোক্তা (Krishi Uddokta)</strong> বাংলাদেশের কৃষকদের উন্নত মানের কৃষি উপকরণ ও সরঞ্জাম সরবরাহ করার মাধ্যমে আধুনিক কৃষির সম্প্রসারণে কাজ করছে।</p>', 'কৃষি উদ্যোক্তা — উচ্চফলনশীল বীজ, অর্গানিক সার ও আধুনিক কৃষি উপকরণের নির্ভরযোগ্য প্ল্যাটফর্ম।'),
        ('page-delivery', 'delivery-charge', 'Delivery Charge Policy | ডেলিভারি চার্জ নীতি', '<p><strong>সারাদেশে ক্যাশ অন ডেলিভারি:</strong> ঢাকায় ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।</p>', 'ঢাকায় ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা। সারাদেশে ক্যাশ অন ডেলিভারি।'),
        ('page-refund', 'refund-policy', 'Refund Policy | রিফান্ড পলিসি', '<p>পণ্য গ্রহণে কোনো সমস্যা বা অমিল থাকলে ডেলিভারির সময় তাত্ক্ষণিক রিটার্ন বা ২৪-৪৮ ঘণ্টার মধ্যে সহজে টাকা ফেরতের ব্যবস্থা রয়েছে।</p>', 'সহজ ও নির্ভরযোগ্য রিটার্ন ও রিফান্ড সুবিধা।')
        ON CONFLICT (handle) DO NOTHING;
      `,
    ]);

    // Automatic content & data fixes in Neon DB
    try {
      await Promise.all([
        sql`UPDATE products SET title = REPLACE(title, 'পন্য', 'পণ্য'), description = REPLACE(description, 'পন্য', 'পণ্য') WHERE title LIKE '%পন্য%' OR description LIKE '%পন্য%';`,
        sql`UPDATE settings SET value = REPLACE(value, 'পন্য', 'পণ্য') WHERE value LIKE '%পন্য%';`,
        sql`UPDATE settings SET value = REPLACE(value, 'Krishi Uddekta', 'Krishi Uddokta') WHERE value LIKE '%Krishi Uddekta%';`,
        sql`
          UPDATE products 
          SET 
            title = 'Strawberry Pickle 700g | স্ট্রবেরি আচার ৭০০ গ্রাম',
            description = REPLACE(description, 'নিট ওজন: ৫০০ গ্রাম', 'নিট ওজন: ৭০০ গ্রাম'),
            image_url = CASE 
              WHEN image_url LIKE '%/api/product-image/%' OR image_url IS NULL OR image_url = '' THEN 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800'
              ELSE image_url 
            END
          WHERE handle LIKE '%strawberry%' OR title LIKE '%Strawberry%' OR title LIKE '%স্ট্রবেরি%';
        `,
      ]);
    } catch (e) {
      console.error("Database automatic cleanup warning:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
    return { success: false, error };
  }
}
