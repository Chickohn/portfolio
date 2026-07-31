import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireVictoriaSession } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { insertUserMilestone } from "@/lib/victoria/queries";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";

const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  occursOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date"),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`milestone:${session.device.id}`, 10, 60 * 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many milestones. Try again later." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const parsed = milestoneSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Fill in a date and title." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    await insertUserMilestone(session, parsed.data);
    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Could not save that milestone." }, { status: 400, headers: privateNoStoreHeaders() });
  }
}
