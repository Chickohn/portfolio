"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isPending, startTransition] = useTransition();

  function finish() {
    setVisible(false);
    startTransition(async () => {
      await fetch("/api/victoria/welcome", { method: "POST", cache: "no-store" });
    });
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-stone-950/80 px-5 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-md rounded-[2rem] border border-white/50 bg-[#fff8f1] p-7 text-center shadow-2xl"
            initial={{ y: 18, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 18, scale: 0.98 }}
          >
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
              disabled={isPending}
              className="mt-6 rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800"
            >
              Come in
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
