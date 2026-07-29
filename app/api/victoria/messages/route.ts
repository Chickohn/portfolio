import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { recordVictoriaActivity } from "@/lib/victoria/activity";
import { VICTORIA_MESSAGE_LIMIT } from "@/lib/victoria/constants";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { requireVictoriaSession } from "@/lib/victoria/auth";
import { getMessages, insertMessage } from "@/lib/victoria/queries";
import { publishMessage } from "@/lib/victoria/realtime";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(VICTORIA_MESSAGE_LIMIT),
  clientNonce: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    await requireVictoriaSession();
    const cursor = request.nextUrl.searchParams.get("cursor");
    const result = await getMessages(cursor);
    return NextResponse.json(result, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`message:${session.device.id}`, 20, 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many notes. Try again shortly." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const parsed = messageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid note." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const message = await insertMessage(session, parsed.data.body, parsed.data.clientNonce);
    await recordVictoriaActivity(session, "message_sent").catch(() => undefined);
    await publishMessage(message).catch(() => undefined);
    return NextResponse.json({ message }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
