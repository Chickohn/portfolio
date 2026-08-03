"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { VICTORIA_HEART_TILES_GAME_ID } from "@/lib/victoria/constants";
import type { VictoriaMinigameScoreRow, VictoriaUsername } from "@/lib/victoria/types";
import { useVictoriaEggTracker } from "./egg-tracker";

const LANES = 4;
const TILE_HEIGHT_RATIO = 0.22;
const HIT_LINE_RATIO = 0.82;
const HIT_WINDOW_RATIO = 0.14;
const BASE_SPEED = 0.28; // board-heights per second
const SPEED_PER_HIT = 0.006;
const MAX_SPEED = 0.75;
const BASE_SPAWN_MS = 720;
const MIN_SPAWN_MS = 320;

type Tile = {
  id: number;
  lane: number;
  y: number; // 0 = top of board, 1 = bottom
  hit: boolean;
};

type Phase = "ready" | "playing" | "over";

type Props = {
  currentUsername: VictoriaUsername;
  onClose: () => void;
};

function speedForScore(score: number) {
  return Math.min(MAX_SPEED, BASE_SPEED + score * SPEED_PER_HIT);
}

function spawnIntervalForScore(score: number) {
  return Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - score * 8);
}

export function VictoriaHeartTiles({ currentUsername, onClose }: Props) {
  const { discoverEgg, foundIds } = useVictoriaEggTracker();
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<VictoriaMinigameScoreRow[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const discoveredRef = useRef(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef(0);
  const phaseRef = useRef<Phase>("ready");
  const lastLaneRef = useRef<number | null>(null);
  const nextIdRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const spawnAtRef = useRef(0);
  const [, setFrame] = useState(0); // force paint while playing

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch(`/api/victoria/minigame/scores?gameId=${VICTORIA_HEART_TILES_GAME_ID}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setLoadError("Could not load scores.");
        return;
      }
      const payload = (await response.json()) as { scores?: VictoriaMinigameScoreRow[] };
      setScores(payload.scores ?? []);
    });
  }, []);

  useEffect(() => {
    if (discoveredRef.current || foundIds.has("tile-minigame")) {
      return;
    }
    discoveredRef.current = true;
    // The game screen is the reveal, so skip the floating card.
    discoverEgg("tile-minigame", { toast: false });
  }, [discoverEgg, foundIds]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (phaseRef.current !== "playing") {
        return;
      }
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, s: 1, d: 2, f: 3 };
      const lane = map[event.key.toLowerCase()];
      if (lane !== undefined) {
        event.preventDefault();
        tapLane(lane);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function bumpPaint() {
    setFrame((value) => value + 1);
  }

  function endGame() {
    if (phaseRef.current === "over") {
      return;
    }
    phaseRef.current = "over";
    setPhase("over");
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const finalScore = scoreRef.current;
    startTransition(async () => {
      const response = await fetch("/api/victoria/minigame/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gameId: VICTORIA_HEART_TILES_GAME_ID, score: finalScore }),
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as {
        scores?: VictoriaMinigameScoreRow[];
        isNewBest?: boolean;
      };
      if (payload.scores) {
        setScores(payload.scores);
      }
      setIsNewBest(Boolean(payload.isNewBest));
    });
  }

  function spawnTile() {
    let lane = Math.floor(Math.random() * LANES);
    if (lastLaneRef.current !== null && LANES > 1) {
      let guard = 0;
      while (lane === lastLaneRef.current && guard < 6) {
        lane = Math.floor(Math.random() * LANES);
        guard += 1;
      }
    }
    lastLaneRef.current = lane;
    tilesRef.current.push({
      id: nextIdRef.current,
      lane,
      y: -TILE_HEIGHT_RATIO,
      hit: false,
    });
    nextIdRef.current += 1;
  }

  function tick(ts: number) {
    if (phaseRef.current !== "playing") {
      return;
    }
    const last = lastTsRef.current ?? ts;
    const dt = Math.min(0.05, (ts - last) / 1000);
    lastTsRef.current = ts;

    const speed = speedForScore(scoreRef.current);
    for (const tile of tilesRef.current) {
      if (!tile.hit) {
        tile.y += speed * dt;
      }
    }

    if (ts >= spawnAtRef.current) {
      spawnTile();
      spawnAtRef.current = ts + spawnIntervalForScore(scoreRef.current);
    }

    const missLine = HIT_LINE_RATIO + HIT_WINDOW_RATIO / 2;
    const missed = tilesRef.current.some((tile) => !tile.hit && tile.y > missLine);
    tilesRef.current = tilesRef.current.filter((tile) => tile.y < 1.2 && !(tile.hit && tile.y > HIT_LINE_RATIO));

    bumpPaint();

    if (missed) {
      endGame();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  function startGame() {
    tilesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setIsNewBest(false);
    lastLaneRef.current = null;
    nextIdRef.current = 1;
    lastTsRef.current = null;
    phaseRef.current = "playing";
    setPhase("playing");
    spawnAtRef.current = performance.now() + 250;
    spawnTile();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function tapLane(lane: number) {
    if (phaseRef.current !== "playing") {
      return;
    }

    const hitMin = HIT_LINE_RATIO - HIT_WINDOW_RATIO;
    const hitMax = HIT_LINE_RATIO + HIT_WINDOW_RATIO / 2;
    const candidates = tilesRef.current
      .filter((tile) => tile.lane === lane && !tile.hit && tile.y + TILE_HEIGHT_RATIO >= hitMin && tile.y <= hitMax)
      .sort((left, right) => right.y - left.y);

    const target = candidates[0];
    if (!target) {
      endGame();
      return;
    }

    target.hit = true;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    bumpPaint();
  }

  const tiles = tilesRef.current;
  const yourBest = scores.find((row) => row.username === currentUsername)?.highScore ?? 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#f7efe7] text-stone-950">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Tile minigame</p>
          <p className="text-sm text-stone-600">If you can beat me at this I&apos;ll buy you anything you want.</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-stone-700 shadow"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mb-3 rounded-3xl border border-white/60 bg-white/70 p-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">High scores</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {scores.length === 0 && !loadError ? (
            <p className="text-sm text-stone-600">{isPending ? "Loading…" : "No scores yet."}</p>
          ) : null}
          {loadError ? <p className="text-sm text-red-700">{loadError}</p> : null}
          {scores.map((row) => (
            <div
              key={row.username}
              className={`rounded-2xl px-3 py-2 text-sm ${
                row.username === currentUsername ? "bg-rose-100 text-rose-900" : "bg-stone-100 text-stone-800"
              }`}
            >
              <span className="font-medium">{row.displayName}</span>
              <span className="ml-2 tabular-nums">{row.highScore}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-2 flex items-baseline justify-between text-sm">
        <p>
          Score <span className="text-lg font-semibold tabular-nums">{score}</span>
        </p>
        <p className="text-stone-600">
          Your best <span className="font-medium tabular-nums text-stone-900">{yourBest}</span>
        </p>
      </div>

      <div
        ref={boardRef}
        className="relative mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] min-h-0 flex-1 touch-none overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/55 shadow-[0_24px_80px_rgba(131,88,79,0.18)]"
        onContextMenu={(event) => event.preventDefault()}
      >
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-rose-300/80"
          style={{ top: `${HIT_LINE_RATIO * 100}%` }}
        />

        <div className="absolute inset-0 grid grid-cols-4">
          {Array.from({ length: LANES }, (_, lane) => (
            <button
              key={lane}
              type="button"
              aria-label={`Lane ${lane + 1}`}
              className="relative border-r border-stone-200/70 last:border-r-0 focus:outline-none"
              onPointerDown={(event) => {
                event.preventDefault();
                tapLane(lane);
              }}
            />
          ))}
        </div>

        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`pointer-events-none absolute rounded-2xl shadow-md transition-opacity ${
              tile.hit ? "bg-rose-200/70 opacity-40" : "bg-stone-950"
            }`}
            style={{
              left: `calc(${(tile.lane / LANES) * 100}% + 0.35rem)`,
              width: `calc(${100 / LANES}% - 0.7rem)`,
              top: `${tile.y * 100}%`,
              height: `${TILE_HEIGHT_RATIO * 100}%`,
            }}
          />
        ))}

        {phase !== "playing" ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-[#f7efe7]/75 px-6 backdrop-blur-[2px]">
            <div className="max-w-sm rounded-[1.75rem] border border-white/70 bg-white/90 p-5 text-center shadow-xl">
              {phase === "ready" ? (
                <>
                  <p className="text-lg font-semibold">Ready?</p>
                  <p className="mt-2 text-sm text-stone-600">Tap tiles as they cross the line. One miss ends it.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold">Game over</p>
                  <p className="mt-2 text-sm text-stone-600">
                    You scored <span className="font-semibold tabular-nums text-stone-950">{score}</span>
                    {isNewBest ? " — new best!" : "."}
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={startGame}
                className="mt-4 rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white"
              >
                {phase === "ready" ? "Play" : "Try again"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
