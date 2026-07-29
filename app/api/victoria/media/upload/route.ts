import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { recordVictoriaActivity } from "@/lib/victoria/activity";
import { requireVictoriaSession } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { getSql } from "@/lib/victoria/db";
import { getUploadMaxBytes } from "@/lib/victoria/env";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { normaliseVictoriaImage } from "@/lib/victoria/media";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";
import { uploadPrivateObject } from "@/lib/victoria/storage";

const uploadSchema = z.object({
  memoryId: z.string().min(1).max(80).optional(),
  caption: z.string().trim().max(180).optional(),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`upload:${session.device.id}`, 8, 60 * 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    if (file.size > getUploadMaxBytes()) {
      return NextResponse.json({ error: "Image is too large." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const parsed = uploadSchema.safeParse({
      memoryId: form.get("memoryId") || undefined,
      caption: form.get("caption") || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid upload details." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const normalised = await normaliseVictoriaImage(Buffer.from(await file.arrayBuffer()));
    const id = randomUUID();
    const storageKey = `${session.user.username}/${new Date().toISOString().slice(0, 10)}/${id}.webp`;
    await uploadPrivateObject(storageKey, normalised.buffer, normalised.mimeType);

    const sql = getSql();
    await sql`
      INSERT INTO victoria_media (
        id,
        memory_id,
        uploaded_by_user_id,
        storage_key,
        original_filename,
        mime_type,
        size_bytes,
        width,
        height,
        caption
      )
      VALUES (
        ${id}::uuid,
        ${parsed.data.memoryId ?? null},
        ${session.user.id}::uuid,
        ${storageKey},
        ${file.name},
        ${normalised.mimeType},
        ${normalised.sizeBytes},
        ${normalised.width},
        ${normalised.height},
        ${parsed.data.caption || null}
      )
    `;

    await recordVictoriaActivity(session, "gallery_opened", { upload: true }).catch(() => undefined);
    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 400, headers: privateNoStoreHeaders() });
  }
}
