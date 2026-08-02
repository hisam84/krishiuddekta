import { getDb } from "./index";

export interface DbProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  available: boolean;
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
        currency VARCHAR(10) DEFAULT 'BDT',
        image_url TEXT,
        category VARCHAR(100) DEFAULT 'general',
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create Collections/Categories Table
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id VARCHAR(100) PRIMARY KEY,
        handle VARCHAR(150) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `;

    // 3. Create Orders Table
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

    // Insert Default Sample Agricultural Products if empty
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products;`;
    if (Number(existingProducts[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO products (id, handle, title, description, price, currency, image_url, category, available)
        VALUES 
        (
          'prod-1', 
          'high-yield-tomato-seeds', 
          'উন্নত জাতের হাইব্রিড টমেটো বীজ (৫০ গ্রাম)', 
          'উচ্চ ফলনশীল রোগ প্রতিরোধক হাইব্রিড টমেটো বীজ। প্রতিকূল আবহাওয়ায় প্রচুর ফলন দিতে সক্ষম।', 
          ৩৫০.০০, 
          'BDT', 
          'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800', 
          'seeds', 
          true
        ),
        (
          'prod-2', 
          'organic-vermicompost-fertilizer', 
          'জৈব কেঁচো সার / ভার্মিকম্পোস্ট (১০ কেজি)', 
          '১০০% প্রাকৃতিক ও পরিবেশবান্ধব কেঁচো সার। মাটির উর্বরতা বৃদ্ধি করে ও শিকড়ের বৃদ্ধি ত্বরান্বিত করে।', 
          ৪৫০.০০, 
          'BDT', 
          'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800', 
          'fertilizer', 
          true
        ),
        (
          'prod-3', 
          'battery-operated-agriculture-sprayer', 
          'ব্যাটারি চালিত কৃষি স্প্রেয়ার (১৬ লিটার)', 
          'স্বয়ংক্রিয় কেমিক্যাল ও কীটনাশক স্প্রে করার জন্য অত্যন্ত শক্তিশালী ও দীর্ঘস্থায়ী ব্যাটারি চালিত মেশিন।', 
          ৩২০০.০০, 
          'BDT', 
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800', 
          'tools', 
          true
        ),
        (
          'prod-4', 
          'thai-baramasi-mango-sapling', 
          'থাই ১২ মাসি কলমের আম চারা', 
          'টব ও ছাদে রোপণ উপযোগী উন্নত মানের থাই বারোমাসি কাটিমন আম গাছের কলম চারা।', 
          ৫৫০.০০, 
          'BDT', 
          'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800', 
          'plants', 
          true
        );
      `;
    }

    // Insert Default Collections if empty
    const existingCollections = await sql`SELECT COUNT(*) as count FROM collections;`;
    if (Number(existingCollections[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO collections (id, handle, title, description)
        VALUES 
        ('col-1', 'seeds', 'বীজ ও চারা', 'উচ্চ ফলনশীল বিভিন্ন ফসলের বীজ ও চারাগাছ'),
        ('col-2', 'fertilizer', 'জৈব ও রাসায়নিক সার', 'মাটির গুণাগুণ বৃদ্ধিতে প্রয়োজনীয় সার'),
        ('col-3', 'tools', 'কৃষি যন্ত্রপাতি', 'আধুনিক ও সহজলভ্য কৃষি সরঞ্জাম');
      `;
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
    return { success: false, error };
  }
}
