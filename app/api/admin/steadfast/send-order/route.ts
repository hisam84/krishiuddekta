import { NextRequest, NextResponse } from "next/server";
import { getDbOrderById, updateDbOrderSteadfastInfo } from "lib/db/products";
import { createSteadfastOrder } from "lib/steadfast";

export async function POST(req: NextRequest) {
  try {
    const { orderId, note } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await getDbOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found in database" },
        { status: 404 }
      );
    }

    // Clean phone number (ensure standard Bangladeshi format)
    let phone = order.customer_phone.trim();

    // Call Steadfast API
    const response = await createSteadfastOrder({
      invoice: order.id,
      recipient_name: order.customer_name,
      recipient_phone: phone,
      recipient_address: `${order.address}, ${order.district}`,
      cod_amount: Number(order.total_amount),
      note: note || `Order #${order.id} from Krishi Uddokta Store`,
    });

    if (response && response.status === 200 && response.consignment) {
      const consignment = response.consignment;
      
      const updated = await updateDbOrderSteadfastInfo(order.id, {
        consignment_id: String(consignment.consignment_id),
        tracking_code: consignment.tracking_code,
        steadfast_status: consignment.status || "in_review",
        status: "Processing",
      });

      return NextResponse.json({
        success: true,
        message: response.message || "Order sent to Steadfast Courier successfully!",
        consignment: response.consignment,
      });
    } else {
      const errorMsg =
        response?.message ||
        (response?.errors ? JSON.stringify(response.errors) : "Failed to send order to Steadfast");
      
      return NextResponse.json(
        {
          success: false,
          message: errorMsg,
          rawResponse: response,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error sending order to Steadfast:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error while sending to Steadfast" },
      { status: 500 }
    );
  }
}
