import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withOpenCors } from "@/lib/cors";

const API = process.env.AGENT_PORTAL_API_URL || "http://127.0.0.1:8080";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function proxy(req: NextRequest, pathParts: string[]) {
  const path = pathParts.map(encodeURIComponent).join("/");
  const url = new URL(req.url);
  const target = `${API}/api/${path}${url.search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Buffer.from(await req.arrayBuffer());
  }

  const upstream = await fetch(target, init);
  const outHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) outHeaders.set("content-type", upstreamType);

  return withOpenCors(
    new NextResponse(upstream.body, {
      status: upstream.status,
      headers: outHeaders,
    }),
  );
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req);
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
