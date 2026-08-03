import { NextRequest, NextResponse } from "next/server";
import {
  addDbShippingClass,
  deleteDbShippingClass,
  getDbShippingClasses,
  updateDbShippingClass,
} from "lib/db/products";

export async function GET() {
  const shippingClasses = await getDbShippingClasses();
  return NextResponse.json({ success: true, shippingClasses });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, cost, description } = body;

    if (!name || cost === undefined) {
      return NextResponse.json(
        { success: false, message: "Shipping class name and cost are required" },
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
    const { id, name, cost, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Shipping class ID required" }, { status: 400 });
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

    if (!id) {
      return NextResponse.json({ success: false, message: "Shipping class ID required" }, { status: 400 });
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
