import { headers } from "next/headers";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { isVictoriaFeatureEnabled } from "@/lib/victoria/env";

export const dynamic = "force-dynamic";

export default function VictoriaAccessPage() {
  const enabled = isVictoriaFeatureEnabled(headers().get("host"));

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7efe7] px-5 text-stone-950">
      <div className="max-w-md rounded-[2rem] border border-white/60 bg-white/70 p-7 text-center shadow-2xl backdrop-blur">
        <LockKeyhole aria-hidden className="mx-auto h-9 w-9 text-rose-700" />
        <h1 className="mt-4 text-2xl font-semibold">{enabled ? "Private access" : "Private area unavailable"}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-700">
          {enabled
            ? "This page opens only on a claimed device. Use the one-time claim link Freddie generated for you."
            : "This private area is disabled for this deployment so preview environments cannot expose production data."}
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-2 text-sm font-medium text-white">
          Back to portfolio
        </Link>
      </div>
    </div>
  );
}
