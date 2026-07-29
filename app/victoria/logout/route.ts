import { NextRequest, NextResponse } from "next/server";

import { clearVictoriaSessionCookie } from "@/lib/victoria/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  clearVictoriaSessionCookie();
  return NextResponse.redirect(new URL("/victoria/access", request.url));
}
