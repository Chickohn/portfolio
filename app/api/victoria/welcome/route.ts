import { NextResponse } from "next/server";

import { recordVictoriaActivity } from "@/lib/victoria/activity";
import { completeWelcome, requireVictoriaSession } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";

export async function POST() {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    await completeWelcome(session.user);
    await recordVictoriaActivity(session, "welcome_completed").catch(() => undefined);
    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
