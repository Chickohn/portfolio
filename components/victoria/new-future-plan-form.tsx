"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onCreated: () => void;
  onCancel: () => void;
};

export function VictoriaNewFuturePlanForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/victoria/future-plans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(targetDate ? { targetDate } : {}),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not save that plan.");
        return;
      }

      router.refresh();
      onCreated();
    });
  }

  return (
    <div className="rounded-3xl bg-white/65 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-950">New plan</h3>
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-stone-500 transition hover:bg-white/60"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <label className="sr-only" htmlFor="new-plan-title">
          Title
        </label>
        <input
          id="new-plan-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          maxLength={120}
          required
          className="w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
        />
        <label className="sr-only" htmlFor="new-plan-description">
          Description
        </label>
        <textarea
          id="new-plan-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={2}
          maxLength={2000}
          className="w-full resize-none rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
        />
        <label className="sr-only" htmlFor="new-plan-date">
          Target date
        </label>
        <input
          id="new-plan-date"
          type="date"
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
        />
        <Button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-950 text-white hover:bg-stone-800">
          <Check aria-hidden className="h-4 w-4" />
          Save plan
        </Button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
