"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { easterEggs } from "@/lib/victoria/content";

type EggTrackerValue = {
  foundIds: ReadonlySet<string>;
  foundCount: number;
  totalCount: number;
  markFound: (id: string) => void;
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

  const value = useMemo<EggTrackerValue>(
    () => ({
      foundIds,
      foundCount: foundIds.size,
      totalCount: easterEggs.length,
      markFound(id: string) {
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
      },
    }),
    [foundIds],
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
