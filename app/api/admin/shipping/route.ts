import { NextRequest, NextResponse } from "next/server";
import {
  addDbShippingClass,
  addDbShippingMethod,
  deleteDbShippingClass,
  deleteDbShippingMethod,
  getDbShippingClasses,
  getDbShippingMethods,
  updateDbShippingClass,
  updateDbShippingMethod,
} from "lib/db/products";

export async function GET() {
  const [shippingClasses, shippingMethods] = await Promise.all([
    getDbShippingClasses(),
    getDbShippingMethods(),
  ]);
  return NextResponse.json({
    success: true,
    shippingClasses,
    shippingMethods,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target_type, name, cost, description, location_type, base_cost, calculation_type, class_costs } = body;

    if (target_type === "method") {
      if (!name || !location_type) {
        return NextResponse.json(
          { success: false, message: "Method name and location type are required" },
          { status: 400 }
        );
      }
      const success = await addDbShippingMethod({
        name,
        location_type,
        base_cost: base_cost !== undefined ? Number(base_cost) : 0,
        calculation_type: calculation_type || "per_order",
        class_costs: class_costs || {},
        description,
      });
      if (success) {
        return NextResponse.json({ success: true, message: "Shipping method added successfully" });
      }
      return NextResponse.json({ success: false, message: "Failed to add shipping method" }, { status: 500 });
    }

    // Default to Shipping Class
    if (!name || cost === undefined) {
      return NextResponse.json(
        { success: false, message: "Shipping class name and base cost are required" },
        { status: 400 }
      );
    }

    const success = await addDbShippingClass({
      name,
      cost: Number(cost),
      description,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Shipping class added successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to add shipping class" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, target_type, name, cost, description, location_type, base_cost, calculation_type, class_costs, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    }

    if (target_type === "method") {
      const success = await updateDbShippingMethod(id, {
        name,
        location_type,
        base_cost: base_cost !== undefined ? Number(base_cost) : undefined,
        calculation_type,
        class_costs,
        is_active,
        description,
      });
      if (success) {
        return NextResponse.json({ success: true, message: "Shipping method updated successfully" });
      }
      return NextResponse.json({ success: false, message: "Failed to update shipping method" }, { status: 500 });
    }

    const success = await updateDbShippingClass(id, {
      name,
      cost: cost !== undefined ? Number(cost) : undefined,
      description,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Shipping class updated successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to update shipping class" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const targetType = searchParams.get("type");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    }

    if (targetType === "method") {
      const success = await deleteDbShippingMethod(id);
      if (success) {
        return NextResponse.json({ success: true, message: "Shipping method deleted successfully" });
      }
      return NextResponse.json({ success: false, message: "Failed to delete shipping method" }, { status: 500 });
    }

    const success = await deleteDbShippingClass(id);
    if (success) {
      return NextResponse.json({ success: true, message: "Shipping class deleted successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to delete shipping class" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
