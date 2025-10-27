import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname === "/robots.txt" ||
    pathname === "/";

  // For now, we'll allow access to dashboard pages
  // In production, you should implement proper session management
  if (!isPublic) {
    // Check if user is logged in via localStorage (client-side)
    // This is a simple approach for demo purposes
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
    
    if (!isBot) {
      // Let the client-side handle authentication
      return NextResponse.next();
    }
  }

  const res = NextResponse.next();
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}

export const config = {
  matcher: "/:path*"
};