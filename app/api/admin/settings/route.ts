import { NextRequest, NextResponse } from "next/server";
import { getDbSettings, updateDbSettings } from "lib/db/products";
import { revalidatePath } from "next/cache";

export async function GET() {
  const settings = await getDbSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const success = await updateDbSettings(body);
    if (success) {
      // Revalidate cache instantly across all routes
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/admin/settings");
      return NextResponse.json({ success: true, message: "Settings saved successfully" });
    }
    return NextResponse.json({ success: false, message: "Failed to save settings" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
