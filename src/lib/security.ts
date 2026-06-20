import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter for development/production.
// For high scalability serverless (Vercel), Upstash Redis is recommended.
// Here we implement a sliding window memory-based rate limiter.
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes to prevent memory leaks
if (typeof global !== "undefined") {
  const globalAny = global as any;
  if (!globalAny.rateLimitInterval) {
    globalAny.rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of rateLimitMap.entries()) {
        record.timestamps = record.timestamps.filter((t) => now - t < 60 * 1000);
        if (record.timestamps.length === 0) {
          rateLimitMap.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export function isRateLimited(key: string, limit: number, windowMs: number = 60 * 1000): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (record.timestamps.length >= limit) {
    return true;
  }

  record.timestamps.push(now);
  return false;
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

// Helmet & CSP Headers setup helper
export function getSecurityHeaders() {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline'
      https://*.adsterra.com https://cdn.adsterra.com
      https://challenges.cloudflare.com
      https://*.highperformanceformat.com https://highperformanceformat.com
      https://*.adtrafficquality.google https://*.googlesyndication.com
      https://*.doubleclick.net https://*.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.adsterra.com;
    img-src 'self' blob: data:
      https://res.cloudinary.com
      https://*.adsterra.com https://*.highperformanceformat.com
      https://*.doubleclick.net https://*.googlesyndication.com
      https://*.googletagmanager.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.adsterra.com https://*.highperformanceformat.com https://challenges.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self'
      https://challenges.cloudflare.com
      https://*.highperformanceformat.com https://highperformanceformat.com
      https://*.adsterra.com
      https://*.doubleclick.net https://*.googlesyndication.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  return {
    "Content-Security-Policy": cspHeader,
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-XSS-Protection": "1; mode=block",
  };
}

export function handleCorsAndCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  // Simple host/origin verification for mutations (POST, PUT, DELETE, PATCH)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (origin && host) {
      const originUrl = new URL(origin);
      // Allow only same origin/host
      if (originUrl.host !== host && originUrl.host !== `www.${host}`) {
        return new NextResponse(
          JSON.stringify({ error: "Thao tác không hợp lệ (CSRF detected)" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }
  return null;
}
