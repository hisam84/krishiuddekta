import { NextResponse } from "next/server";
import { getDbSettings } from "lib/db/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getDbSettings();
  const favicon = settings.site_favicon;

  if (favicon && favicon.startsWith("data:")) {
    const parts = favicon.split(",");
    const mimeMatch = parts[0]?.match(/:(.*?);/);
    const mimeType = (mimeMatch && mimeMatch[1]) ? mimeMatch[1] : "image/png";
    const base64Data = parts[1];
    if (base64Data) {
      const buffer = Buffer.from(base64Data, "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  if (favicon && (favicon.startsWith("http://") || favicon.startsWith("https://"))) {
    return NextResponse.redirect(favicon);
  }

  // Redirect to standard favicon
  return NextResponse.redirect(new URL("/favicon.ico", "http://localhost:3000"));
}
