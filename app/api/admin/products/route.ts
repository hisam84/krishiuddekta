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
        { success: false, message: "পণ্যের নাম এবং দাম দেয়া আবশ্যক" },
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
      return NextResponse.json({ success: true, message: "পণ্য সফলভাবে যুক্ত করা হয়েছে" });
    }
    return NextResponse.json({ success: false, message: "পণ্য যোগ করতে ব্যর্থ হয়েছে" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
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
      return NextResponse.json({ success: true, message: "পণ্য আপডেট করা হয়েছে" });
    }
    return NextResponse.json({ success: false, message: "আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
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
      return NextResponse.json({ success: true, message: "পণ্য মুছে ফেলা হয়েছে" });
    }
    return NextResponse.json({ success: false, message: "ডিলেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}
