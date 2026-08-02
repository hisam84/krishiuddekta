import { NextRequest, NextResponse } from "next/server";
import { addDbProduct, deleteDbProduct, getDbProducts, updateDbProduct } from "lib/db/products";

export async function GET() {
  const products = await getDbProducts();
  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, price, image_url, category } = body;

    if (!title || !price) {
      return NextResponse.json(
        { success: false, message: "Product title and price are required" },
        { status: 400 }
      );
    }

    const success = await addDbProduct({
      title,
      description: description || "",
      price: Number(price),
      image_url:
        image_url ||
        "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800",
      category: category || "general",
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
    const { id, title, description, price, image_url, category, available } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    const success = await updateDbProduct(id, {
      title,
      description,
      price: price !== undefined ? Number(price) : undefined,
      image_url,
      category,
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
