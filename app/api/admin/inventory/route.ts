import { NextRequest, NextResponse } from "next/server";
import { getDbProducts, updateDbProductStock } from "lib/db/products";

export async function GET() {
  try {
    const products = await getDbProducts();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stock_quantity, available } = body;

    if (!id || stock_quantity === undefined) {
      return NextResponse.json({ success: false, message: "Product ID and stock quantity are required" }, { status: 400 });
    }

    const success = await updateDbProductStock(id, Number(stock_quantity), available);
    return NextResponse.json({ success });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to update inventory stock" }, { status: 500 });
  }
}
