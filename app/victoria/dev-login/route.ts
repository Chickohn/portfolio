import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createDevBypassSession, devBypassUsernameSchema } from "@/lib/victoria/auth";
import { isVictoriaDevBypassEnabled } from "@/lib/victoria/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const host = headers().get("host");
  if (!isVictoriaDevBypassEnabled(host)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await request.formData();
  const parsed = devBypassUsernameSchema.safeParse(String(form.get("username") || ""));
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/victoria/access?dev=invalid", request.url), 303);
  }

  const result = await createDevBypassSession(parsed.data);
  if (!result) {
    return NextResponse.redirect(new URL("/victoria/access?dev=failed", request.url), 303);
  }

  return NextResponse.redirect(new URL("/victoria", request.url), 303);
}
