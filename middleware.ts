import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to login routes
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // Check admin session cookie
  const adminSession = req.cookies.get("admin_session")?.value;
  const isAuthenticated = adminSession === "authenticated";

  if (!isAuthenticated) {
    // Return 401 for API calls
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }
    // Redirect to login page for UI routes
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};

