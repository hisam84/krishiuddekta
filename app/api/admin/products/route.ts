import { NextRequest, NextResponse } from "next/server";
import { addDbProduct, deleteDbProduct, getDbProducts, updateDbProduct } from "lib/db/products";

export async function GET() {
  const products = await getDbProducts();
  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, short_description, price, discount_price, badge, image_url, category, shipping_class_id } = body;

    if (!title || !price) {
      return NextResponse.json(
        { success: false, message: "Product title and price are required" },
        { status: 400 }
      );
    }

    const success = await addDbProduct({
      title,
      description: description || "",
      short_description: short_description || "",
      price: Number(price),
      discount_price: discount_price ? Number(discount_price) : undefined,
      badge: badge || "Best Seller",
      image_url:
        image_url ||
        "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800",
      category: category || "general",
      shipping_class_id: shipping_class_id || "sc-standard",
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Product added successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to add product" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, short_description, price, discount_price, badge, image_url, category, shipping_class_id, available } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    const success = await updateDbProduct(id, {
      title,
      description,
      short_description,
      price: price !== undefined ? Number(price) : undefined,
      discount_price: discount_price !== undefined ? Number(discount_price) : undefined,
      badge,
      image_url,
      category,
      shipping_class_id,
      available,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Product updated successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    const success = await deleteDbProduct(id);
    if (success) {
      return NextResponse.json({ success: true, message: "Product deleted successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
