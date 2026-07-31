"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

import { easterEggs } from "@/lib/victoria/content";
import { useVictoriaEggTracker } from "./egg-tracker";

/** Each tap adds this much charge; nothing pins it to round stages. */
const PROGRESS_PER_TAP = 0.2;
/** Quick fill per tap vs. the slow, deliberate retreat once it's settled. */
const GROW_TRANSITION_MS = 320;
const RETRACT_TRANSITION_MS = 2000;

// A ring just inside the 44px button (h-11/w-11), leaving a few px of margin
// so it reads as an outline growing toward the star, not touching the edge.
const RING_RADIUS = 19;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function VictoriaEasterEggs() {
  const { markFound } = useVictoriaEggTracker();
  const [progress, setProgress] = useState(0);
  const [found, setFound] = useState<string | null>(null);
  // Same stroke-dashoffset transition covers both directions; only its
  // duration changes, so growth (fast) and retraction (slow) share one value.
  const [transitionMs, setTransitionMs] = useState(GROW_TRANSITION_MS);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearIdleTimer() {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }

  // Cancel any pending retract if the component unmounts mid-countdown.
  useEffect(() => clearIdleTimer, []);

  /**
   * The ring's true current charge, read straight off the DOM rather than from
   * `progress` state.
   *
   * Once a retract starts, `progress` snaps to 0 immediately — only the ring's
   * on-screen position eases toward it over RETRACT_TRANSITION_MS. Basing the
   * next tap's charge on `progress` therefore meant tapping mid-drain always
   * restarted from empty, no matter how much was still visibly left. Reading
   * getComputedStyle instead reports the actual interpolated value at the
   * instant of the click (browsers keep this live during a CSS transition), so
   * a tap always builds on what's really on screen — mid-grow or mid-drain —
   * rather than a state value that already jumped ahead of it.
   */
  function getCurrentProgress(): number {
    const circle = circleRef.current;
    if (!circle) {
      return progress;
    }
    const offset = Number.parseFloat(getComputedStyle(circle).strokeDashoffset);
    if (Number.isNaN(offset)) {
      return progress;
    }
    return clamp01(1 - offset / RING_CIRCUMFERENCE);
  }

  async function reveal(id: string) {
    setFound(id);
    markFound(id);
    await fetch("/api/victoria/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventType: "easter_egg_found", metadata: { eggId: id } }),
    });
  }

  function handleTap() {
    clearIdleTimer();
    const next = clamp01(getCurrentProgress() + PROGRESS_PER_TAP);
    setTransitionMs(GROW_TRANSITION_MS);
    setProgress(next);

    if (next >= 1) {
      reveal("since-date").catch(() => undefined);
      setProgress(0);
      return;
    }

    // Start unwinding right as this tap's growth finishes, not after some
    // separate pause — a further tap before then just clears this and charges
    // on from wherever it's actually gotten to.
    idleTimerRef.current = setTimeout(() => {
      setTransitionMs(RETRACT_TRANSITION_MS);
      setProgress(0);
    }, GROW_TRANSITION_MS);
  }

  const egg = easterEggs.find((item) => item.id === found);
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <button
        type="button"
        aria-label="A tiny hidden button"
        className="relative grid h-11 w-11 place-items-center rounded-full bg-white/70 text-rose-700 shadow-lg backdrop-blur transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
        onClick={handleTap}
      >
        <svg aria-hidden viewBox="0 0 44 44" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90">
          <circle
            ref={circleRef}
            cx="22"
            cy="22"
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            // strokeDashoffset lives in `style`, not as a plain attribute — CSS
            // transitions only reliably animate a property when both its value
            // and the `transition` declaration come from computed style.
            style={{
              strokeDashoffset: dashOffset,
              transition: `stroke-dashoffset ${transitionMs}ms ease-in-out`,
            }}
          />
        </svg>
        <Star aria-hidden className="h-5 w-5" />
      </button>
      {egg ? (
        <div className="absolute bottom-14 right-0 w-64 rounded-3xl border border-white/60 bg-[#fff8f1] p-4 text-sm text-stone-800 shadow-2xl">
          <p className="font-semibold text-stone-950">{egg.title}</p>
          <p className="mt-1 leading-6">{egg.body}</p>
          <button type="button" className="mt-3 text-xs font-medium text-rose-700" onClick={() => setFound(null)}>
            Tuck away
          </button>
        </div>
      ) : null}
    </div>
  );
}
