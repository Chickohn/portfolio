import { NextResponse } from "next/server";

import { createDeviceSessionForClaim } from "@/lib/victoria/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const result = await createDeviceSessionForClaim(params.token);
  const destination = result ? "/victoria" : "/victoria/access?claim=invalid";

  return NextResponse.redirect(new URL(destination, request.url), 303);
}
