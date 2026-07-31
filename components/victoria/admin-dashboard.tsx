"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import type {
  VictoriaAdminContentRow,
  VictoriaAdminHideType,
  VictoriaAdminPageViewRow,
  VictoriaAdminUserRow,
  VictoriaAdminVisitRow,
  VictoriaCountdownSettings,
  VictoriaUsername,
} from "@/lib/victoria/types";

type Props = {
  countdown: VictoriaCountdownSettings;
  users: VictoriaAdminUserRow[];
  pageViews: VictoriaAdminPageViewRow[];
  visits: VictoriaAdminVisitRow[];
  messages: VictoriaAdminContentRow[];
  media: VictoriaAdminContentRow[];
  memories: VictoriaAdminContentRow[];
  milestones: VictoriaAdminContentRow[];
  plans: VictoriaAdminContentRow[];
};

const CONTENT_TABS = [
  { key: "messages", label: "Notes", type: "message" as const },
  { key: "media", label: "Photos", type: "media" as const },
  { key: "memories", label: "Memories", type: "memory" as const },
  { key: "milestones", label: "Milestones", type: "milestone" as const },
  { key: "plans", label: "Plans", type: "plan" as const },
] as const;

function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWhen(iso: string | null) {
  if (!iso) {
    return "never";
  }
  return new Date(iso).toLocaleString("en-GB");
}

export function VictoriaAdminDashboard({
  countdown,
  users,
  pageViews,
  visits,
  messages,
  media,
  memories,
  milestones,
  plans,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState(countdown.label);
  const [timezone, setTimezone] = useState(countdown.timezone);
  const [targetLocal, setTargetLocal] = useState(toDatetimeLocalValue(countdown.targetAt));
  const [countdownError, setCountdownError] = useState<string | null>(null);
  const [countdownSaved, setCountdownSaved] = useState(false);
  const [expandedUser, setExpandedUser] = useState<VictoriaUsername | null>(null);
  const [contentTab, setContentTab] = useState<(typeof CONTENT_TABS)[number]["key"]>("messages");
  const [hideError, setHideError] = useState<string | null>(null);

  const pageViewsByUser = useMemo(() => {
    const map = new Map<VictoriaUsername, VictoriaAdminPageViewRow[]>();
    for (const view of pageViews) {
      const list = map.get(view.username) ?? [];
      list.push(view);
      map.set(view.username, list);
    }
    return map;
  }, [pageViews]);

  const contentByTab = {
    messages,
    media,
    memories,
    milestones,
    plans,
  } as const;

  function saveCountdown() {
    setCountdownError(null);
    setCountdownSaved(false);
    if (!label.trim() || !targetLocal || !timezone.trim()) {
      setCountdownError("Fill in label, date/time, and timezone.");
      return;
    }

    const target = new Date(targetLocal);
    if (Number.isNaN(target.getTime())) {
      setCountdownError("Invalid date/time.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/victoria/admin/countdown", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          targetAt: target.toISOString(),
          timezone: timezone.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setCountdownError(payload?.error ?? "Could not update countdown.");
        return;
      }

      setCountdownSaved(true);
      router.refresh();
    });
  }

  function setHidden(type: VictoriaAdminHideType, id: string, hidden: boolean) {
    if (hidden && !window.confirm("Hide this from the private page?")) {
      return;
    }

    setHideError(null);
    startTransition(async () => {
      const response = await fetch("/api/victoria/admin/hide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, id, hidden }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setHideError(payload?.error ?? "Could not update that item.");
        return;
      }

      router.refresh();
    });
  }

  const activeTab = CONTENT_TABS.find((tab) => tab.key === contentTab) ?? CONTENT_TABS[0];
  const activeRows = contentByTab[activeTab.key];

  return (
    <div className="mt-7 space-y-4">
      <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
        <h2 className="font-semibold">Countdown</h2>
        <p className="mt-1 text-sm text-stone-600">Update the destination label, time, and timezone.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-stone-600">Label</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-stone-600">Timezone</span>
            <input
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-stone-600">Target (your local time)</span>
            <input
              type="datetime-local"
              value={targetLocal}
              onChange={(event) => setTargetLocal(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={saveCountdown}
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Save countdown
          </button>
          {countdownSaved ? <p className="text-sm text-emerald-700">Saved.</p> : null}
          {countdownError ? <p className="text-sm text-red-700">{countdownError}</p> : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
          <h2 className="font-semibold">Users</h2>
          <p className="mt-1 text-sm text-stone-600">Click a user to see their page views.</p>
          <div className="mt-4 space-y-2 text-sm">
            {users.map((user) => {
              const open = expandedUser === user.username;
              const userViews = pageViewsByUser.get(user.username) ?? [];
              return (
                <div key={user.username} className="overflow-hidden rounded-2xl bg-stone-50">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 p-3 text-left transition hover:bg-stone-100"
                    onClick={() => setExpandedUser(open ? null : user.username)}
                    aria-expanded={open}
                  >
                    {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-stone-600">
                        Last active {formatWhen(user.lastSeenAt)} · Welcome {user.welcomeCompletedAt ? "complete" : "not complete"}
                      </p>
                    </div>
                    <span className="text-xs text-stone-500">{userViews.length}</span>
                  </button>
                  {open ? (
                    <div className="border-t border-stone-200/80 px-3 pb-3 pt-2">
                      {userViews.length === 0 ? (
                        <p className="text-stone-600">No page views yet.</p>
                      ) : (
                        <div className="max-h-[9.75rem] space-y-1.5 overflow-y-auto overscroll-contain pr-1">
                          {userViews.map((view) => (
                            <div key={view.id} className="rounded-xl bg-white/80 px-3 py-2">
                              <p className="font-medium">{formatWhen(view.createdAt)}</p>
                              <p className="truncate text-stone-600">
                                {view.deviceLabel} · {view.browserFamily} / {view.osFamily}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
          <h2 className="font-semibold">Visits by day</h2>
          <div className="mt-4 space-y-2 text-sm">
            {visits.length === 0 ? (
              <p className="rounded-2xl bg-stone-50 p-3 text-stone-600">No visits yet.</p>
            ) : (
              visits.map((row) => (
                <p key={row.day} className="flex justify-between rounded-2xl bg-stone-50 p-3">
                  <span>{new Date(row.day).toLocaleDateString("en-GB")}</span>
                  <span>{row.count}</span>
                </p>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-white/75 p-5 shadow-lg">
        <h2 className="font-semibold">Content</h2>
        <p className="mt-1 text-sm text-stone-600">Soft-hide user-created items. Hidden rows stay listed so you can unhide them.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setContentTab(tab.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                contentTab === tab.key ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">{contentByTab[tab.key].length}</span>
            </button>
          ))}
        </div>
        {hideError ? <p className="mt-3 text-sm text-red-700">{hideError}</p> : null}
        <div className="mt-4 space-y-2 text-sm">
          {activeRows.length === 0 ? (
            <p className="rounded-2xl bg-stone-50 p-3 text-stone-600">Nothing here yet.</p>
          ) : (
            activeRows.map((row) => {
              const hidden = Boolean(row.hiddenAt);
              return (
                <div key={row.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-stone-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-950">{row.preview}</p>
                    <p className="mt-1 text-stone-600">
                      {row.authorUsername} · {formatWhen(row.createdAt)}
                      {row.meta ? ` · ${row.meta}` : ""}
                      {hidden ? " · hidden" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setHidden(activeTab.type, row.id, !hidden)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${
                      hidden ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {hidden ? "Unhide" : "Hide"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
