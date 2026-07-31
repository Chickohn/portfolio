import { NextResponse } from "next/server";
import { z } from "zod";

import { VictoriaAuthError, requireVictoriaOwnerApi } from "@/lib/victoria/auth";
import { DEFAULT_COUNTDOWN_TIMEZONE } from "@/lib/victoria/constants";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { updateCountdownSettings } from "@/lib/victoria/queries";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";

const countdownSchema = z.object({
  label: z.string().trim().min(1).max(120),
  targetAt: z.string().trim().min(1),
  timezone: z.string().trim().min(1).max(80).default(DEFAULT_COUNTDOWN_TIMEZONE),
});

export async function PATCH(request: Request) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaOwnerApi();
    const limited = await checkVictoriaRateLimit(`admin-countdown:${session.device.id}`, 20, 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many updates. Try again shortly." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const parsed = countdownSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid countdown settings." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    try {
      Intl.DateTimeFormat(undefined, { timeZone: parsed.data.timezone });
    } catch {
      return NextResponse.json({ error: "Invalid timezone." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const target = new Date(parsed.data.targetAt);
    if (Number.isNaN(target.getTime())) {
      return NextResponse.json({ error: "Invalid datetime." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const countdown = await updateCountdownSettings({
      label: parsed.data.label,
      targetAt: target.toISOString(),
      timezone: parsed.data.timezone,
    });

    return NextResponse.json({ countdown }, { headers: privateNoStoreHeaders() });
  } catch (error) {
    if (error instanceof VictoriaAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: privateNoStoreHeaders() });
    }
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
