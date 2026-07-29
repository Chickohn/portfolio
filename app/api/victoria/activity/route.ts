import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { recordVictoriaActivity } from "@/lib/victoria/activity";
import { requireVictoriaSession } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { victoriaActivityEventTypes } from "@/lib/victoria/types";

const activitySchema = z.object({
  eventType: z.enum(victoriaActivityEventTypes),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const parsed = activitySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400, headers: privateNoStoreHeaders() });
    }

    await recordVictoriaActivity(session, parsed.data.eventType, parsed.data.metadata ?? {});
    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
