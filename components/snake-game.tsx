"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Snake Game Component
 * A classic Snake game implementation with canvas rendering
 * Optimized for performance using refs to avoid unnecessary re-renders
 */
export default function SnakeGame() {
  // --- Config ---
  const CELL = 20;
  const GRID_W = 30;
  const GRID_H = 22;
  const WIDTH = GRID_W * CELL;
  const HEIGHT = GRID_H * CELL;

  // Movement speed (ms per move)
  const STEP_MS = 90;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use a ref for the latest direction so keypresses feel responsive
  const queuedDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });

  // Game state stored in a ref to avoid rerendering every frame
  interface GameState {
    snake: Array<{ x: number; y: number }>;
    dir: { x: number; y: number };
    food: { x: number; y: number };
    score: number;
    alive: boolean;
    paused: boolean;
    lastStep: number;
  }

  const gameRef = useRef<GameState | null>(null);

  interface UIState {
    score: number;
    highScore: number;
    alive: boolean;
    paused: boolean;
  }

  const [ui, setUi] = useState<UIState>(() => {
    if (typeof window !== 'undefined') {
      const high = Number(localStorage.getItem("snake_high_score") || "0") || 0;
      return { score: 0, highScore: high, alive: true, paused: false };
    }
    return { score: 0, highScore: 0, alive: true, paused: false };
  });

  const colors = useMemo(
    () => ({
      bg: "rgb(18,18,18)",
      grid: "rgb(30,30,30)",
      snake: "rgb(0,200,90)",
      head: "rgb(0,255,140)",
      food: "rgb(240,80,80)",
      text: "rgb(235,235,235)",
      subtext: "rgb(180,180,180)",
    }),
    []
  );

  function randInt(n: number): number {
    return Math.floor(Math.random() * n);
  }

  function spawnFood(occupiedSet: Set<string>): { x: number; y: number } {
    while (true) {
      const p = { x: randInt(GRID_W), y: randInt(GRID_H) };
      const k = `${p.x},${p.y}`;
      if (!occupiedSet.has(k)) return p;
    }
  }

  function resetGame() {
    const cx = Math.floor(GRID_W / 2);
    const cy = Math.floor(GRID_H / 2);
    const snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    const occ = new Set(snake.map((p) => `${p.x},${p.y}`));
    const food = spawnFood(occ);

    queuedDirRef.current = { x: 1, y: 0 };
    gameRef.current = {
      snake,
      dir: { x: 1, y: 0 },
      food,
      score: 0,
      alive: true,
      paused: false,
      lastStep: performance.now(),
    };

    setUi((prev) => ({
      ...prev,
      score: 0,
      alive: true,
      paused: false,
    }));
  }

  function setHighScoreIfNeeded(newScore: number) {
    setUi((prev) => {
      if (newScore > prev.highScore) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("snake_high_score", String(newScore));
        }
        return { ...prev, score: newScore, highScore: newScore };
      }
      return { ...prev, score: newScore };
    });
  }

  function setUiFlags(patch: Partial<UIState>) {
    setUi((prev) => ({ ...prev, ...patch }));
  }

  function togglePause() {
    const g = gameRef.current;
    if (!g || !g.alive) return;
    g.paused = !g.paused;
    setUiFlags({ paused: g.paused });
  }

  // --- Input ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      if (k === "p") togglePause();
      if (k === "r") resetGame();
      if (k === "escape") return; // optional: could blur focus, etc.

      // Directions: arrows or WASD
      let next: { x: number; y: number } | null = null;
      if (k === "arrowup" || k === "w") next = { x: 0, y: -1 };
      if (k === "arrowdown" || k === "s") next = { x: 0, y: 1 };
      if (k === "arrowleft" || k === "a") next = { x: -1, y: 0 };
      if (k === "arrowright" || k === "d") next = { x: 1, y: 0 };

      if (next) {
        // prevent reversing
        const g = gameRef.current;
        const cur = g ? g.dir : { x: 1, y: 0 };
        if (!(next.x === -cur.x && next.y === -cur.y)) {
          queuedDirRef.current = next;
        }
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Game loop ---
  useEffect(() => {
    resetGame();

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function drawCell(x: number, y: number, fill: string) {
      ctx.fillStyle = fill;
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }

    function drawGrid() {
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      for (let x = 0; x <= WIDTH; x += CELL) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= HEIGHT; y += CELL) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
    }

    function step(now: number) {
      const g = gameRef.current;
      if (!g) return;

      // Fixed timestep movement
      if (g.alive && !g.paused && now - g.lastStep >= STEP_MS) {
        g.lastStep = now;

        // Apply queued direction
        g.dir = queuedDirRef.current;

        const head = g.snake[0];
        const nx = (head.x + g.dir.x + GRID_W) % GRID_W; // wrap
        const ny = (head.y + g.dir.y + GRID_H) % GRID_H;
        const newHead = { x: nx, y: ny };

        const willEat = nx === g.food.x && ny === g.food.y;

        const tail = g.snake[g.snake.length - 1];
        const bodySet = new Set(g.snake.map((p) => `${p.x},${p.y}`));
        const newKey = `${nx},${ny}`;

        // collision rule:
        // hitting your tail is OK only if you are NOT eating (because tail moves away)
        const hitsBody = bodySet.has(newKey);
        const isTailCell = nx === tail.x && ny === tail.y;

        if (hitsBody && !(isTailCell && !willEat)) {
          g.alive = false;
          setUiFlags({ alive: false, paused: false });
        } else {
          g.snake.unshift(newHead);

          if (willEat) {
            g.score += 1;
            setHighScoreIfNeeded(g.score);

            const occ = new Set(g.snake.map((p) => `${p.x},${p.y}`));
            g.food = spawnFood(occ);
            // grow: don't pop tail
          } else {
            g.snake.pop();
            // keep score display in sync (no change)
            setUi((prev) => (prev.score === g.score ? prev : { ...prev, score: g.score }));
          }
        }
      }

      // --- Render ---
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawGrid();

      // food
      drawCell(g.food.x, g.food.y, colors.food);

      // snake
      for (let i = 0; i < g.snake.length; i++) {
        const p = g.snake[i];
        drawCell(p.x, p.y, i === 0 ? colors.head : colors.snake);
      }

      // overlay text
      ctx.fillStyle = colors.text;
      ctx.font = "20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(`Score: ${ui.score}   High: ${ui.highScore}`, 10, 26);

      if (g.paused && g.alive) {
        ctx.fillStyle = colors.text;
        ctx.font = "28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        const msg = "Paused";
        const w = ctx.measureText(msg).width;
        ctx.fillText(msg, (WIDTH - w) / 2, HEIGHT / 2 - 10);

        ctx.fillStyle = colors.subtext;
        ctx.font = "18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        const msg2 = "Press P to resume";
        const w2 = ctx.measureText(msg2).width;
        ctx.fillText(msg2, (WIDTH - w2) / 2, HEIGHT / 2 + 20);
      }

      if (!g.alive) {
        ctx.fillStyle = colors.text;
        ctx.font = "28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        const msg = "Game Over";
        const w = ctx.measureText(msg).width;
        ctx.fillText(msg, (WIDTH - w) / 2, HEIGHT / 2 - 10);

        ctx.fillStyle = colors.subtext;
        ctx.font = "18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        const msg2 = "Press R to restart";
        const w2 = ctx.measureText(msg2).width;
        ctx.fillText(msg2, (WIDTH - w2) / 2, HEIGHT / 2 + 20);
      }

      requestAnimationFrame(step);
    }

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
    // ui is referenced in render; keep loop stable by not depending on ui
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors]);

  // Simple UI controls (nice for mobile + accessibility)
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full max-w-[600px] h-auto rounded-xl border border-white/15"
        style={{
          imageRendering: "pixelated",
        }}
        tabIndex={0}
        aria-label="Snake game canvas"
      />
      <div className="flex flex-wrap gap-3 items-center justify-center text-sm">
        <button 
          onClick={() => resetGame()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          Restart (R)
        </button>
        <button 
          onClick={() => togglePause()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          Pause/Resume (P)
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem("snake_high_score");
            }
            setUi((prev) => ({ ...prev, highScore: 0 }));
          }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          Clear High Score
        </button>
        <span className="text-gray-400">
          Controls: Arrows/WASD • Wrap walls • High score saved
        </span>
      </div>
    </div>
  );
}



