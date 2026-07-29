import { NextResponse } from "next/server";

import { requireVictoriaSession } from "@/lib/victoria/auth";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { createRealtimeTokenRequest } from "@/lib/victoria/realtime";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";

export async function GET() {
  try {
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`realtime:${session.device.id}`, 60, 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const tokenRequest = await createRealtimeTokenRequest(session);
    if (!tokenRequest) {
      return NextResponse.json({ error: "Realtime unavailable" }, { status: 503, headers: privateNoStoreHeaders() });
    }

    return NextResponse.json(tokenRequest, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
