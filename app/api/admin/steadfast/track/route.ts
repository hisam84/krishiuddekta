import { NextRequest, NextResponse } from "next/server";
import { getDbOrderById, updateDbOrderSteadfastInfo } from "lib/db/products";
import { getSteadfastDeliveryStatus } from "lib/steadfast";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const consignmentId = searchParams.get("consignmentId");
    const trackingCode = searchParams.get("trackingCode");

    if (!orderId && !consignmentId && !trackingCode) {
      return NextResponse.json(
        { success: false, message: "Missing orderId, consignmentId or trackingCode" },
        { status: 400 }
      );
    }

    let searchTarget: { consignment_id?: string; invoice?: string; tracking_code?: string } = {};

    if (consignmentId) {
      searchTarget.consignment_id = consignmentId;
    } else if (trackingCode) {
      searchTarget.tracking_code = trackingCode;
    } else if (orderId) {
      searchTarget.invoice = orderId;
    }

    const liveStatus = await getSteadfastDeliveryStatus(searchTarget);

    // If orderId is provided and live delivery status is fetched, update database steadfast_status
    if (orderId && liveStatus && liveStatus.delivery_status) {
      const dbOrder = await getDbOrderById(orderId);
      if (dbOrder) {
        let newOrderStatus = dbOrder.status;
        const sStatus = String(liveStatus.delivery_status).toLowerCase();
        if (sStatus === "delivered") {
          newOrderStatus = "Completed";
        } else if (sStatus === "cancelled") {
          newOrderStatus = "Cancelled";
        }

        await updateDbOrderSteadfastInfo(orderId, {
          consignment_id: dbOrder.consignment_id || consignmentId || "",
          tracking_code: dbOrder.tracking_code || trackingCode || "",
          steadfast_status: liveStatus.delivery_status,
          status: newOrderStatus,
        });
      }
    }

    return NextResponse.json({
      success: true,
      deliveryStatus: liveStatus.delivery_status || "in_review",
      data: liveStatus,
    });
  } catch (error: any) {
    console.error("Error tracking Steadfast order:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch Steadfast status" },
      { status: 500 }
    );
  }
}
