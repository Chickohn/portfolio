import { unstable_noStore as noStore } from "next/cache";

import { requireVictoriaOwner } from "@/lib/victoria/auth";
import { getActivitySummary } from "@/lib/victoria/queries";

export default async function VictoriaActivityPage() {
  noStore();
  await requireVictoriaOwner();
  const summary = await getActivitySummary();

  return (
    <div className="min-h-screen bg-[#f7efe7] px-4 py-8 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <a href="/victoria" className="text-sm font-medium text-rose-800">
          Back to private page
        </a>
        <h1 className="mt-4 text-3xl font-semibold">Victoria activity</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Modest first-party activity only: visits, sessions, messages, welcome state, and configured events. No location history, message bodies, or fingerprints.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
            <h2 className="font-semibold">Users</h2>
            <div className="mt-4 space-y-3 text-sm">
              {summary.users.map((row) => (
                <div key={String(row.username)} className="rounded-2xl bg-stone-50 p-3">
                  <p className="font-medium">{String(row.display_name)}</p>
                  <p className="text-stone-600">Last active: {row.last_seen_at ? new Date(String(row.last_seen_at)).toLocaleString("en-GB") : "never"}</p>
                  <p className="text-stone-600">Welcome: {row.welcome_completed_at ? "complete" : "not complete"}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
            <h2 className="font-semibold">Messages</h2>
            <div className="mt-4 space-y-3 text-sm">
              {summary.messages.map((row) => (
                <p key={String(row.username)} className="rounded-2xl bg-stone-50 p-3">
                  {String(row.username)}: {Number(row.count)} notes
                </p>
              ))}
            </div>
          </section>
          <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
            <h2 className="font-semibold">Visits by Day</h2>
            <div className="mt-4 space-y-2 text-sm">
              {summary.visits.map((row) => (
                <p key={String(row.day)} className="flex justify-between rounded-2xl bg-stone-50 p-3">
                  <span>{new Date(String(row.day)).toLocaleDateString("en-GB")}</span>
                  <span>{Number(row.count)}</span>
                </p>
              ))}
            </div>
          </section>
          <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
            <h2 className="font-semibold">Recent Devices</h2>
            <div className="mt-4 space-y-2 text-sm">
              {summary.sessions.map((row) => (
                <div key={`${String(row.username)}-${String(row.label)}-${String(row.claimed_at)}`} className="rounded-2xl bg-stone-50 p-3">
                  <p className="font-medium">
                    {String(row.username)} · {String(row.label)}
                  </p>
                  <p className="text-stone-600">
                    {String(row.browser_family)} / {String(row.os_family)}
                  </p>
                  <p className="text-stone-600">Last seen: {new Date(String(row.last_seen_at)).toLocaleString("en-GB")}</p>
                  {row.revoked_at ? <p className="text-red-700">Revoked</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
