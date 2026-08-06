import { NextRequest, NextResponse } from "next/server";
import { getDbOrderById } from "lib/db/products";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawOrderId = searchParams.get("orderId")?.trim();
    const rawPhone = searchParams.get("phone")?.trim();

    if (!rawOrderId || !rawPhone) {
      return NextResponse.json(
        { success: false, message: "Order ID and Phone Number are required" },
        { status: 400 }
      );
    }

    // Format Order ID if user omitted ORD- prefix
    const orderId = rawOrderId.toUpperCase().startsWith("ORD-")
      ? rawOrderId.toUpperCase()
      : `ORD-${rawOrderId}`;

    const order = await getDbOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: `No order found with ID #${orderId}` },
        { status: 404 }
      );
    }

    // Normalize phone numbers for flexible matching
    const normalizePhone = (p: string) => p.replace(/\D/g, "").slice(-11);
    const dbPhoneNorm = normalizePhone(order.customer_phone);
    const userPhoneNorm = normalizePhone(rawPhone);

    if (dbPhoneNorm !== userPhoneNorm && !order.customer_phone.includes(rawPhone)) {
      return NextResponse.json(
        { success: false, message: "Phone number does not match the order details" },
        { status: 403 }
      );
    }

    // Parse status history & items cleanly for response
    let statusHistory = [];
    try {
      if (order.status_history) statusHistory = JSON.parse(order.status_history);
    } catch (e) {}

    let items = [];
    try {
      if (order.items) items = JSON.parse(order.items);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        address: order.address,
        district: order.district,
        division: order.division || "Dhaka",
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        public_notes: order.public_notes || "",
        status_history: statusHistory,
        consignment_id: order.consignment_id,
        tracking_code: order.tracking_code,
        steadfast_status: order.steadfast_status,
        items,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
