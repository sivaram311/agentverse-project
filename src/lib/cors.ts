import { NextRequest, NextResponse } from "next/server";

/** DEV/public-IP: allow any origin (CORS effectively disabled). */
export const OPEN_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, Accept, X-Requested-With, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

export function withOpenCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(OPEN_CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

export function corsPreflight(_req: NextRequest): NextResponse {
  return withOpenCors(new NextResponse(null, { status: 204 }));
}
