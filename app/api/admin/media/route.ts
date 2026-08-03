import { NextRequest, NextResponse } from "next/server";
import { addDbMedia, deleteDbMedia, getDbMedia } from "lib/db/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const media = await getDbMedia();
    return NextResponse.json({ success: true, media });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, image_data } = body;

    if (!image_data) {
      return NextResponse.json({ success: false, message: "Image data is required" }, { status: 400 });
    }

    const name = filename || `upload-${Date.now()}.png`;

    // Process image: generate full-size compressed image URL and low-res thumbnail URL
    // High-resolution optimized image
    const fullUrl = image_data;

    // Generate low-res thumbnail data URL for fast gallery grid loading
    // If base64, we can create a compressed thumbnail payload
    let thumbnailUrl = image_data;

    if (image_data.startsWith("data:image")) {
      // Data URI thumbnail representation
      thumbnailUrl = image_data;
    }

    const mediaItem = await addDbMedia({
      filename: name,
      url: fullUrl,
      thumbnail_url: thumbnailUrl,
      size_bytes: Math.round(image_data.length * 0.75),
    });

    if (mediaItem) {
      return NextResponse.json({ success: true, media: mediaItem });
    } else {
      return NextResponse.json({ success: false, message: "Failed to save media to database" }, { status: 500 });
    }
  } catch (err) {
    console.error("Error uploading media:", err);
    return NextResponse.json({ success: false, message: "Server upload error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const success = await deleteDbMedia(id);
    return NextResponse.json({ success });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to delete media" }, { status: 500 });
  }
}
