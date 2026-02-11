import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getSanityWriteClient } from "@/lib/sanity/sanity.client.write";

export async function POST(req: Request) {
  await requireAdmin();

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ error: "SANITY_API_WRITE_TOKEN is not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploaded = await getSanityWriteClient().assets.upload("image", buffer, {
    filename: file.name || "upload",
    contentType: file.type || undefined,
  });

  return NextResponse.json({ assetId: uploaded._id, url: uploaded.url });
}

