"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onCreated: () => void;
  onCancel: () => void;
};

export function VictoriaNewMemoryForm({ onCreated, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/victoria/memories", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not save that memory.");
        return;
      }

      // Re-render the server component so the new memory (and its photo, if
      // any) shows up, then close this card — the memory now lives in the list.
      router.refresh();
      onCreated();
    });
  }

  return (
    <article className="rounded-[2rem] border border-dashed border-rose-300 bg-white/70 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-stone-950">New memory</h3>
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-stone-500 transition hover:bg-stone-100"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <form action={submit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="new-memory-date" className="block text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
            Date
          </label>
          <input
            id="new-memory-date"
            name="occursOn"
            type="date"
            required
            className="mt-1 w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div>
          <label htmlFor="new-memory-title" className="block text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
            Title
          </label>
          <input
            id="new-memory-title"
            name="title"
            type="text"
            required
            maxLength={120}
            className="mt-1 w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div>
          <label htmlFor="new-memory-body" className="block text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
            Caption
          </label>
          <textarea
            id="new-memory-body"
            name="body"
            required
            rows={3}
            maxLength={2000}
            className="mt-1 w-full resize-none rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div>
          <label htmlFor="new-memory-file" className="block text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
            Photo (optional)
          </label>
          <input
            id="new-memory-file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full text-sm text-stone-700 file:mr-3 file:rounded-full file:border-0 file:bg-stone-950 file:px-4 file:py-2 file:text-sm file:text-white"
          />
        </div>
        <Button type="submit" disabled={isPending} className="rounded-full bg-stone-950 text-white hover:bg-stone-800">
          <ImagePlus aria-hidden className="h-4 w-4" />
          Save memory
        </Button>
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      </form>
    </article>
  );
}
