import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get("x-revalidate-secret");

  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
  }

  revalidatePath("/projects");

  const slugs = Array.isArray(body?.slugs) ? body.slugs : [];
  for (const slug of slugs) {
    if (typeof slug === "string" && slug) {
      revalidatePath(`/projects/${slug}`);
    }
  }

  return NextResponse.json({ ok: true, revalidated: { projects: true, slugs } });
}

