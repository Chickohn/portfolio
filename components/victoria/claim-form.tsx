"use client";

import { useState } from "react";

export function VictoriaClaimForm({ token }: { token: string }) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={`/victoria/claim/${encodeURIComponent(token)}/submit`}
      method="post"
      onSubmit={() => setSubmitting(true)}
      className="max-w-md rounded-[2rem] border border-white/60 bg-white/75 p-7 text-center shadow-2xl backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-800">One-time link</p>
      <h1 className="mt-4 text-2xl font-semibold">Claim this device</h1>
      <p className="mt-3 text-sm leading-6 text-stone-700">
        Hi Victoria, I have been working on this for you cos I'm cute as hell, press this button to enter this cute as hell website.
      </p>
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? "Claiming..." : "Claim device"}
      </button>
    </form>
  );
}
