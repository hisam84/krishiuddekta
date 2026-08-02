import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";

    if (password === adminPass) {
      const response = NextResponse.json({ success: true, message: "লগইন সফল হয়েছে" });
      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    return NextResponse.json({ success: false, message: "ভুল পাসওয়ার্ড দেওয়া হয়েছে" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "লগআউট সফল হয়েছে" });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return response;
}
