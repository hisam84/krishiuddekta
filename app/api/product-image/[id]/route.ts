import { getDbProductById } from "lib/db/products";
import { NextRequest, NextResponse } from "next/server";

// Serves product images that are stored as base64 data URIs in the database.
// Without this, the raw base64 string would be inlined into every page's HTML
// (meta tags, RSC payload, <img> tags), making pages many megabytes in size.
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;

  try {
    const product = await getDbProductById(id);
    let imageUrl = (product?.image_url || product?.thumbnail_url || "").trim();

    // Check gallery images if main image is missing or circular
    if (!imageUrl || imageUrl.startsWith("/api/product-image/")) {
      if (product?.gallery_images) {
        try {
          const gallery = JSON.parse(product.gallery_images);
          if (Array.isArray(gallery)) {
            const validItem = gallery.find(
              (u: any) =>
                typeof u === "string" &&
                u.trim().length > 0 &&
                !u.startsWith("/api/product-image/")
            );
            if (validItem) imageUrl = validItem;
          }
        } catch (e) {}
      }
    }

    if (!imageUrl || imageUrl.startsWith("/api/product-image/")) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (imageUrl.startsWith("data:")) {
      const [meta, data] = imageUrl.split(",");
      const mime = meta?.match(/data:([^;]+)/)?.[1] || "image/png";
      const buffer = Buffer.from(data || "", "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mime,
          "Content-Length": String(buffer.length),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error("Error serving product image:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
