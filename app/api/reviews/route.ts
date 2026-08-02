import { NextRequest, NextResponse } from "next/server";
import { addDbReview, getDbReviews } from "lib/db/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
  }

  const reviews = await getDbReviews(productId);
  return NextResponse.json({ success: true, reviews });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, reviewer_name, rating, comment } = body;

    if (!product_id || !reviewer_name || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const success = await addDbReview({
      product_id,
      reviewer_name,
      rating: Number(rating || 5),
      comment,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Review posted successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to save review" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
