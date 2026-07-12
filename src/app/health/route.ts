import { NextResponse } from "next/server";
import packageJson from "../../../package.json";

export async function GET() {
  const port = Number(process.env.PORT || process.env.PORT_HINT || 3310);
  const api = process.env.AGENT_PORTAL_API_URL || "http://127.0.0.1:8080";
  return NextResponse.json({
    status: "ok",
    service: "agentverse",
    version: packageJson.version,
    port,
    apiProxy: `/api/portal → ${api}`,
  });
}
