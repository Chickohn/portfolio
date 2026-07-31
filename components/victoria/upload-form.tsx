"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  memoryId?: string;
  /** Called right after a successful upload, so the parent can close this
   * form. Without it the form stayed open post-upload with nothing to stop a
   * stray double-click or a forgotten re-submit from uploading the same photo
   * twice. */
  onUploaded?: () => void;
};

export function VictoriaUploadForm({ memoryId, onUploaded }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function upload(formData: FormData) {
    setError(null);
    if (memoryId) {
      formData.set("memoryId", memoryId);
    }

    startTransition(async () => {
      const response = await fetch("/api/victoria/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Upload failed.");
        return;
      }

      // Re-render the server component instead of asking for a full reload,
      // then let the parent close this form now that the photo is saved.
      router.refresh();
      onUploaded?.();
    });
  }

  return (
    <form action={upload} className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white/55 p-3">
      <label className="block text-sm font-medium text-stone-800" htmlFor={`media-${memoryId ?? "gallery"}`}>
        Add a private photo
      </label>
      <input
        id={`media-${memoryId ?? "gallery"}`}
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="mt-3 block w-full text-sm text-stone-700 file:mr-3 file:rounded-full file:border-0 file:bg-stone-950 file:px-4 file:py-2 file:text-sm file:text-white"
        required
      />
      <input name="caption" type="text" placeholder="Optional caption" className="mt-3 w-full rounded-2xl border border-stone-200 bg-white/70 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200" />
      <Button type="submit" disabled={isPending} className="mt-3 rounded-full bg-stone-950 text-white hover:bg-stone-800">
        <ImagePlus aria-hidden className="h-4 w-4" />
        Upload
      </Button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
