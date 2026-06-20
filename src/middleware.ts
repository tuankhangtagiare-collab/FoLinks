import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders, getAdPageSecurityHeaders, isRateLimited, getClientIp } from "./lib/security";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;
  const ip = getClientIp(req);

  // Define route matching
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isGoRedirectRoute = nextUrl.pathname.startsWith("/go");

  // 1. Rate Limiting for critical routes
  if (isApiRoute && !isApiAuthRoute) {
    let rateLimitKey = ip;
    let limit = 60; // 60 requests per minute by default
    
    if (user?.id) {
      rateLimitKey = user.id;
      limit = 120; // authenticated users get more requests
    }

    if (nextUrl.pathname.includes("/api/auth/login") || nextUrl.pathname.includes("/api/auth/register")) {
      limit = 10; // strictly limit login/register attempts
    }

    if (isRateLimited(rateLimitKey, limit)) {
      return new NextResponse(
        JSON.stringify({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...getSecurityHeaders(),
          },
        }
      );
    }
  }

  // 2. Auth protection guards
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next({
      headers: getSecurityHeaders(),
    });
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      let callbackUrl = nextUrl.pathname;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallback = encodeURIComponent(callbackUrl);
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodedCallback}`, nextUrl));
    }
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (isApiRoute && !isApiAuthRoute) {
    // API guards
    const isPublicApi = nextUrl.pathname.startsWith("/api/public") 
      || nextUrl.pathname === "/api/shorten/bypass"
      || nextUrl.pathname.startsWith("/api/visit")
      || nextUrl.pathname.startsWith("/api/captcha")
      || nextUrl.pathname.startsWith("/api/link");
    if (!isPublicApi && !isLoggedIn) {
      return new NextResponse(
        JSON.stringify({ error: "Không được phép truy cập (Unauthorized)" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Admin API guards
    if (nextUrl.pathname.startsWith("/api/admin")) {
      if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
        return new NextResponse(
          JSON.stringify({ error: "Quyền truy cập bị từ chối (Forbidden)" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // Append security headers to all responses
  // Use permissive CSP for ad-monetized bypass pages, strict CSP for everything else
  const isBypassPage = nextUrl.pathname.startsWith("/l/") || nextUrl.pathname.startsWith("/go/");
  const response = NextResponse.next();
  const headersObj = isBypassPage ? getAdPageSecurityHeaders() : getSecurityHeaders();
  Object.entries(headersObj).forEach(([key, val]) => {
    response.headers.set(key, val);
  });

  return response;
});

// Middleware config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|logo.png|.*\\..*).*)",
  ],
};
