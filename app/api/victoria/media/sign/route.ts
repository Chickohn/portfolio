import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireVictoriaSession } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { dbQuery } from "@/lib/victoria/db";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { createPrivateSignedUrl } from "@/lib/victoria/storage";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";

const schema = z.object({ id: z.string().uuid() });

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`media-sign:${session.device.id}`, 120, 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid media" }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const rows = await dbQuery(
      "mediaSign",
      `
        SELECT storage_key
        FROM victoria_media
        WHERE id = $1::uuid AND hidden_at IS NULL
        LIMIT 1
      `,
      [parsed.data.id],
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Unavailable" }, { status: 404, headers: privateNoStoreHeaders() });
    }

    const url = await createPrivateSignedUrl(String(row.storage_key));
    return NextResponse.json({ url }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
