"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { easterEggs } from "@/lib/victoria/content";

export function VictoriaEasterEggs() {
  const [tapCount, setTapCount] = useState(0);
  const [found, setFound] = useState<string | null>(null);

  async function reveal(id: string) {
    setFound(id);
    await fetch("/api/victoria/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventType: "easter_egg_found", metadata: { eggId: id } }),
    });
  }

  const egg = easterEggs.find((item) => item.id === found);

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <button
        type="button"
        aria-label="A tiny hidden button"
        className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-rose-700 shadow-lg backdrop-blur transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
        onClick={() => {
          const next = tapCount + 1;
          setTapCount(next);
          if (next >= 5) {
            reveal("since-date").catch(() => undefined);
            setTapCount(0);
          }
        }}
      >
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
