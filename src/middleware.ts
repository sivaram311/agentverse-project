import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OPEN_CORS_HEADERS } from "@/lib/cors";

/** Open CORS for every route + short-circuit OPTIONS (public IP / CF / phones). */
export function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: OPEN_CORS_HEADERS });
  }
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(OPEN_CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  // Keep HTML/API out of Cloudflare sticky cache
  if (!req.nextUrl.pathname.startsWith("/_next/static")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.headers.set("CDN-Cache-Control", "no-store");
    res.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|avatars/).*)"],
};
