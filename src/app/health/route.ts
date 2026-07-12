import { NextResponse } from "next/server";
import packageJson from "../../../package.json";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "agentverse",
    version: packageJson.version,
    port: 3310,
    apiProxy: "/api/portal → agent-portal :8080",
  });
}
