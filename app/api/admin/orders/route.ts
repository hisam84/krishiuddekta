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
      return NextResponse.json({ success: true, message: "অর্ডার স্ট্যাটাস আপডেট করা হয়েছে" });
    }
    return NextResponse.json({ success: false, message: "আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}
