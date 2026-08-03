import { NextRequest, NextResponse } from "next/server";
import {
  addDbPage,
  deleteDbPage,
  getDbPages,
  updateDbPage,
} from "lib/db/products";

export async function GET() {
  const pages = await getDbPages();
  return NextResponse.json({ success: true, pages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: contentBody, body_summary } = body;

    if (!title || !contentBody) {
      return NextResponse.json(
        { success: false, message: "Page title and body content are required" },
        { status: 400 }
      );
    }

    const success = await addDbPage({
      title,
      body: contentBody,
      body_summary,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Page created successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to create page" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, body: contentBody, body_summary } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Page ID required" }, { status: 400 });
    }

    const success = await updateDbPage(id, {
      title,
      body: contentBody,
      body_summary,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Page updated successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to update page" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Page ID required" }, { status: 400 });
    }

    const success = await deleteDbPage(id);
    if (success) {
      return NextResponse.json({ success: true, message: "Page deleted successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to delete page" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
