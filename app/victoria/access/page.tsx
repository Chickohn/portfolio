import { headers } from "next/headers";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { isVictoriaDevBypassEnabled, isVictoriaFeatureEnabled } from "@/lib/victoria/env";

export const dynamic = "force-dynamic";

export default function VictoriaAccessPage({
  searchParams,
}: {
  searchParams?: { claim?: string; dev?: string };
}) {
  const host = headers().get("host");
  const enabled = isVictoriaFeatureEnabled(host);
  const devBypass = isVictoriaDevBypassEnabled(host);
  const claimInvalid = searchParams?.claim === "invalid";
  const devFailed = searchParams?.dev === "failed" || searchParams?.dev === "invalid";

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7efe7] px-5 text-stone-950">
      <div className="max-w-md rounded-[2rem] border border-white/60 bg-white/70 p-7 text-center shadow-2xl backdrop-blur">
        <LockKeyhole aria-hidden className="mx-auto h-9 w-9 text-rose-700" />
        <h1 className="mt-4 text-2xl font-semibold">{enabled ? "Private access" : "Private area unavailable"}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-700">
          {enabled
            ? "This page opens only on a claimed device. Message me if it breaks and you can't access it anymore."
            : "This private area is disabled for this deployment so preview environments cannot expose production data."}
        </p>
        {claimInvalid ? (
          <p className="mt-3 text-sm text-rose-800">That claim link is invalid or already used.</p>
        ) : null}
        {devFailed ? (
          <p className="mt-3 text-sm text-rose-800">Dev login failed. Seed users with `npm run victoria:seed`.</p>
        ) : null}

        {devBypass ? (
          <div className="mt-6 rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Dev bypass</p>
            <p className="mt-2 text-xs leading-5 text-amber-950/80">
              Local development only. Skips claim links and creates a real session cookie. Never available on
              production.
            </p>
            <div className="mt-4 grid gap-2">
              <form action="/victoria/dev-login" method="post">
                <input type="hidden" name="username" value="freddie" />
                <button
                  type="submit"
                  className="w-full rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white"
                >
                  Continue as Freddie
                </button>
              </form>
              <form action="/victoria/dev-login" method="post">
                <input type="hidden" name="username" value="victoria" />
                <button
                  type="submit"
                  className="w-full rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-950"
                >
                  Continue as Victoria
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <Link href="/" className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-2 text-sm font-medium text-white">
          Back to portfolio
        </Link>
      </div>
    </div>
  );
}
