"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { VictoriaUsername } from "@/lib/victoria/types";

type Props = {
  username: VictoriaUsername;
  lines: readonly string[];
  shouldShow: boolean;
};

export function VictoriaWelcome({ username, lines, shouldShow }: Props) {
  const [visible, setVisible] = useState(shouldShow);
  const [isSaving, setIsSaving] = useState(false);

  function finish() {
    setVisible(false);
    setIsSaving(true);
    // Fire-and-forget: the overlay is already gone, and a failed write just means
    // the welcome shows once more. No reason to make the user wait on it.
    void fetch("/api/victoria/welcome", { method: "POST", cache: "no-store" })
      .catch(() => undefined)
      .finally(() => setIsSaving(false));
  }

  if (!visible) {
    return null;
  }

  return (
    // CSS transitions instead of framer-motion — see the note in experience.tsx.
    <div className="motion-safe:animate-victoria-fade fixed inset-0 z-50 grid place-items-center bg-stone-950/80 px-5 backdrop-blur-xl">
      <div className="motion-safe:animate-victoria-rise max-w-md rounded-[2rem] border border-white/50 bg-[#fff8f1] p-7 text-center shadow-2xl">
        <Sparkles aria-hidden className="mx-auto h-8 w-8 text-rose-600" />
        <h2 className="mt-4 text-2xl font-semibold text-stone-950">
          {username === "victoria" ? "Hi Victoria" : "Hi Freddie"}
        </h2>
        <div className="mt-4 space-y-3 text-pretty text-sm leading-6 text-stone-700">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Button
          type="button"
          onClick={finish}
          disabled={isSaving}
          className="mt-6 rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800"
        >
          Come in
        </Button>
      </div>
    </div>
  );
}
