import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireVictoriaSession } from "@/lib/victoria/auth";
import { VICTORIA_HEART_TILES_GAME_ID } from "@/lib/victoria/constants";
import { assertSameOriginRequest } from "@/lib/victoria/csrf";
import { privateNoStoreHeaders } from "@/lib/victoria/headers";
import { getMinigameScores, submitMinigameScore } from "@/lib/victoria/queries";
import { checkVictoriaRateLimit } from "@/lib/victoria/rate-limit";

const scoreSchema = z.object({
  gameId: z.literal(VICTORIA_HEART_TILES_GAME_ID),
  score: z.number().int().min(0).max(100_000),
});

export async function GET(request: NextRequest) {
  try {
    await requireVictoriaSession();
    const gameId = request.nextUrl.searchParams.get("gameId") ?? VICTORIA_HEART_TILES_GAME_ID;
    if (gameId !== VICTORIA_HEART_TILES_GAME_ID) {
      return NextResponse.json({ error: "Unknown game." }, { status: 400, headers: privateNoStoreHeaders() });
    }
    const scores = await getMinigameScores(gameId);
    return NextResponse.json({ scores }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOriginRequest();
    const session = await requireVictoriaSession();
    const limited = await checkVictoriaRateLimit(`minigame:${session.device.id}`, 30, 60);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many scores. Try again shortly." }, { status: 429, headers: privateNoStoreHeaders() });
    }

    const parsed = scoreSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid score." }, { status: 400, headers: privateNoStoreHeaders() });
    }

    const result = await submitMinigameScore(session, parsed.data.gameId, parsed.data.score);
    const scores = await getMinigameScores(parsed.data.gameId);
    return NextResponse.json({ ...result, scores }, { headers: privateNoStoreHeaders() });
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: privateNoStoreHeaders() });
  }
}
