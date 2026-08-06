import { NextRequest, NextResponse } from "next/server";
import { createDbOrder } from "lib/db/products";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      address,
      district,
      division,
      subtotal,
      delivery_charge,
      payment_method,
      total_amount,
      items,
    } = body;

    if (!customer_name || !customer_phone || !address) {
      return NextResponse.json(
        { success: false, message: "Customer name, phone number, and address are required" },
        { status: 400 }
      );
    }

    const orderId = await createDbOrder({
      customer_name,
      customer_phone,
      address,
      district: district || "Dhaka",
      division: division || "Dhaka",
      subtotal: subtotal !== undefined ? Number(subtotal) : undefined,
      delivery_charge: delivery_charge !== undefined ? Number(delivery_charge) : 60,
      payment_method: payment_method || "COD",
      total_amount: Number(total_amount || 0),
      items: items || [],
    });

    if (orderId) {
      return NextResponse.json({
        success: true,
        orderId,
        message: "Your order has been placed successfully!",
      });
    }

    return NextResponse.json({ success: false, message: "Failed to place order" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

