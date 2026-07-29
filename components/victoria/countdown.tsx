"use client";

import { useEffect, useState } from "react";
import { HeartHandshake } from "lucide-react";

import { getCountdownParts } from "@/lib/victoria/dates";

type Props = {
  label: string;
  targetAt: string;
  initialNow: string;
};

export function VictoriaCountdown({ label, targetAt, initialNow }: Props) {
  const [parts, setParts] = useState(() => getCountdownParts(targetAt, new Date(initialNow)));

  useEffect(() => {
    const interval = window.setInterval(() => setParts(getCountdownParts(targetAt)), 1000);
    return () => window.clearInterval(interval);
  }, [targetAt]);

  const units = [
    ["days", parts.days],
    ["hours", parts.hours],
    ["minutes", parts.minutes],
    ["seconds", parts.seconds],
  ] as const;

  return (
    <section
      className="rounded-[2rem] border border-white/45 bg-white/65 p-5 shadow-[0_24px_80px_rgba(131,88,79,0.22)] backdrop-blur md:p-7"
      aria-labelledby="victoria-countdown-heading"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-100 text-rose-700">
          <HeartHandshake aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <h2 id="victoria-countdown-heading" className="text-lg font-semibold text-stone-950">
            {label}
          </h2>
          <p className="text-sm text-stone-600">
            {parts.isComplete ? "The wait is over." : "Kept timezone-safe from the server target."}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map(([unit, value]) => (
          <div key={unit} className="rounded-2xl bg-stone-950 px-2 py-4 text-center text-white shadow-inner">
            <div className="font-mono text-2xl font-semibold tabular-nums sm:text-4xl">{String(value).padStart(2, "0")}</div>
            <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-rose-100">{unit}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
