import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { requireVictoriaSession } from "@/lib/victoria/auth";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { dbQuery } from "@/lib/victoria/db";
import { getUploadMaxBytes } from "@/lib/victoria/env";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { normaliseVictoriaImage } from "@/lib/victoria/media";
import { insertUserMemory } from "@/lib/victoria/queries";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";
import { uploadPrivateObject } from "@/lib/victoria/storage";

const memorySchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
  occursOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date"),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`memory:${session.device.id}`, 10, 60 * 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many memories. Try again later." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const form = await request.formData();
    const parsed = memorySchema.safeParse({
      title: form.get("title"),
      body: form.get("body"),
      occursOn: form.get("occursOn"),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Fill in a date, title, and caption." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const file = form.get("file");
    const hasFile = file instanceof File && file.size > 0;
    if (hasFile && file.size > getUploadMaxBytes()) {
      return NextResponse.json({ error: "Image is too large." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const memoryId = await insertUserMemory(session, parsed.data);

    if (hasFile) {
      const normalised = await normaliseVictoriaImage(Buffer.from(await file.arrayBuffer()));
      const mediaId = randomUUID();
      const storageKey = `${session.user.username}/${new Date().toISOString().slice(0, 10)}/${mediaId}.webp`;
      await uploadPrivateObject(storageKey, normalised.buffer, normalised.mimeType);

      await dbQuery(
        "insertMemoryPhoto",
        `
          INSERT INTO victoria_media (
            id, memory_id, uploaded_by_user_id, storage_key, original_filename, mime_type, size_bytes, width, height
          )
          VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6, $7, $8, $9)
        `,
        [
          mediaId,
          memoryId,
          session.user.id,
          storageKey,
          file.name,
          normalised.mimeType,
          normalised.sizeBytes,
          normalised.width,
          normalised.height,
        ],
      );
    }

    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Could not save that memory." }, { status: 400, headers: privateNoStoreHeaders() });
  }
}
