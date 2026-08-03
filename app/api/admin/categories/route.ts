import { NextRequest, NextResponse } from "next/server";
import {
  addDbCollection,
  deleteDbCollection,
  getDbCollections,
  updateDbCollection,
} from "lib/db/products";

export async function GET() {
  const categories = await getDbCollections();
  return NextResponse.json({ success: true, categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Category title is required" },
        { status: 400 }
      );
    }

    const success = await addDbCollection({ title, description });
    if (success) {
      return NextResponse.json({ success: true, message: "Category created successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, title, description } = body;

    if (!handle) {
      return NextResponse.json({ success: false, message: "Category handle is required" }, { status: 400 });
    }

    const success = await updateDbCollection(handle, { title, description });
    if (success) {
      return NextResponse.json({ success: true, message: "Category updated successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to update category" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ success: false, message: "Category handle is required" }, { status: 400 });
    }

    const success = await deleteDbCollection(handle);
    if (success) {
      return NextResponse.json({ success: true, message: "Category deleted successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to delete category" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
