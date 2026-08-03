"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import { easterEggs } from "@/lib/victoria/content";

type EggTrackerValue = {
  foundIds: ReadonlySet<string>;
  foundCount: number;
  totalCount: number;
  markFound: (id: string) => void;
  /**
   * Marks found and logs activity. Eggs whose reveal is the thing you just
   * opened (the minigame) pass `toast: false` so the shared card doesn't
   * appear on top of it and read as a different egg firing.
   */
  discoverEgg: (id: string, options?: { toast?: boolean }) => void;
  toastEggId: string | null;
  dismissToast: () => void;
};

const EggTrackerContext = createContext<EggTrackerValue | null>(null);

const knownEggIds: ReadonlySet<string> = new Set(easterEggs.map((egg) => egg.id));

export function VictoriaEggTrackerProvider({
  initialFoundIds,
  children,
}: {
  initialFoundIds: readonly string[];
  children: ReactNode;
}) {
  const [foundIds, setFoundIds] = useState(() => {
    const next = new Set<string>();
    for (const id of initialFoundIds) {
      if (knownEggIds.has(id)) {
        next.add(id);
      }
    }
    return next;
  });
  const [toastEggId, setToastEggId] = useState<string | null>(null);
  const foundIdsRef = useRef(foundIds);
  foundIdsRef.current = foundIds;

  const markFound = useCallback((id: string) => {
    if (!knownEggIds.has(id)) {
      return;
    }
    setFoundIds((current) => {
      if (current.has(id)) {
        return current;
      }
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const discoverEgg = useCallback(
    (id: string, options?: { toast?: boolean }) => {
      if (!knownEggIds.has(id)) {
        return;
      }
      const alreadyFound = foundIdsRef.current.has(id);
      markFound(id);
      if (options?.toast !== false) {
        setToastEggId(id);
      }
      if (alreadyFound) {
        return;
      }
      void fetch("/api/victoria/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventType: "easter_egg_found", metadata: { eggId: id } }),
      }).catch(() => undefined);
    },
    [markFound],
  );

  const dismissToast = useCallback(() => setToastEggId(null), []);

  const value = useMemo<EggTrackerValue>(
    () => ({
      foundIds,
      foundCount: foundIds.size,
      totalCount: easterEggs.length,
      markFound,
      discoverEgg,
      toastEggId,
      dismissToast,
    }),
    [foundIds, markFound, discoverEgg, toastEggId, dismissToast],
  );

  return <EggTrackerContext.Provider value={value}>{children}</EggTrackerContext.Provider>;
}

export function useVictoriaEggTracker() {
  const value = useContext(EggTrackerContext);
  if (!value) {
    throw new Error("useVictoriaEggTracker requires VictoriaEggTrackerProvider");
  }
  return value;
}

/** Compact fixed badge — safe-area aware so it sits in the phone top-right. */
export function VictoriaEggCounter() {
  const { foundCount, totalCount } = useVictoriaEggTracker();

  return (
    <div className="pointer-events-none fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 sm:right-4">
      <div className="pointer-events-auto rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold tabular-nums text-stone-800 shadow-lg backdrop-blur">
        {foundCount}/{totalCount} eggs
      </div>
    </div>
  );
}

/** Shared reveal card for any egg (star, date, etc.). */
export function VictoriaEggToast() {
  const { toastEggId, dismissToast } = useVictoriaEggTracker();
  const egg = easterEggs.find((item) => item.id === toastEggId);

  if (!egg) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-64 rounded-3xl border border-white/60 bg-[#fff8f1] p-4 text-sm text-stone-800 shadow-2xl">
      <p className="font-semibold text-stone-950">{egg.title}</p>
      <p className="mt-1 leading-6">{egg.body}</p>
      <button type="button" className="mt-3 text-xs font-medium text-rose-700" onClick={dismissToast}>
        Tuck away
      </button>
    </div>
  );
}
