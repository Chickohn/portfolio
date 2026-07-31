import { NextResponse } from "next/server";
import { z } from "zod";

import { VictoriaAuthError, requireVictoriaOwnerApi } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { setAdminContentHidden } from "@/lib/victoria/queries";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";

const hideSchema = z.object({
  type: z.enum(["message", "media", "memory", "milestone", "plan"]),
  id: z.string().uuid(),
  hidden: z.boolean(),
});

export async function POST(request: Request) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaOwnerApi();
    const limited = await checkVictoriaRateLimit(`admin-hide:${session.device.id}`, 40, 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many updates. Try again shortly." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const parsed = hideSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid hide request." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const ok = await setAdminContentHidden(parsed.data.type, parsed.data.id, parsed.data.hidden);
    if (!ok) {
      return NextResponse.json({ error: "Content not found." }, { status: 404, headers: privateNoStoreHeaders() });
    }

    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders() });
  } catch (error) {
    if (error instanceof VictoriaAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: privateNoStoreHeaders() });
    }
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
