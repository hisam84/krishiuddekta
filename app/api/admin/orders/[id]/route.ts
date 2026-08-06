import { NextRequest, NextResponse } from "next/server";
import { getDbOrderById, updateDbOrderStatusWithHistory, updateDbOrderNotes } from "lib/db/products";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getDbOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.status) {
      const success = await updateDbOrderStatusWithHistory(id, body.status, body.note);
      if (success) {
        return NextResponse.json({ success: true, message: "Order status updated" });
      }
      return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 });
    }

    if (body.internal_notes !== undefined || body.public_notes !== undefined) {
      const success = await updateDbOrderNotes(id, {
        internal_notes: body.internal_notes,
        public_notes: body.public_notes,
      });
      if (success) {
        return NextResponse.json({ success: true, message: "Order notes updated" });
      }
      return NextResponse.json({ success: false, message: "Failed to update notes" }, { status: 500 });
    }

    return NextResponse.json({ success: false, message: "No update parameters provided" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
