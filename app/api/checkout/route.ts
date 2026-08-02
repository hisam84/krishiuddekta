import { NextRequest, NextResponse } from "next/server";
import { createDbOrder } from "lib/db/products";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, customer_phone, address, district, total_amount, items } = body;

    if (!customer_name || !customer_phone || !address) {
      return NextResponse.json(
        { success: false, message: "নাম, ফোন নম্বর এবং ঠিকানা দেয়া আবশ্যক" },
        { status: 400 }
      );
    }

    const orderId = await createDbOrder({
      customer_name,
      customer_phone,
      address,
      district: district || "ঢাকা",
      total_amount: Number(total_amount || 0),
      items: items || [],
    });

    if (orderId) {
      return NextResponse.json({
        success: true,
        orderId,
        message: "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!",
      });
    }

    return NextResponse.json({ success: false, message: "অর্ডার সম্পন্ন করতে ব্যর্থ হয়েছে" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}
