import { NextRequest, NextResponse } from "next/server";
import { getDbOrders, updateDbOrderStatus } from "lib/db/products";

export async function GET() {
  const orders = await getDbOrders();
  return NextResponse.json({ success: true, orders });
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "ID & Status required" }, { status: 400 });
    }

    const success = await updateDbOrderStatus(id, status);
    if (success) {
      return NextResponse.json({ success: true, message: "Order status updated successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
