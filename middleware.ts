import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Password protection removed for now - allow direct access to admin routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
