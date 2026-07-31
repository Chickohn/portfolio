"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarHeart, Check, Clock, ImagePlus, Plus } from "lucide-react";

import { VictoriaCountdown } from "./countdown";
import { VictoriaEasterEggs } from "./easter-eggs";
import { VictoriaMessageWall } from "./message-wall";
import { VictoriaNewFuturePlanForm } from "./new-future-plan-form";
import { VictoriaNewMemoryForm } from "./new-memory-form";
import { VictoriaNewMilestoneForm } from "./new-milestone-form";
import { VictoriaUploadForm } from "./upload-form";
import { VictoriaWelcome } from "./welcome";
import { futurePlans, memories, milestones, victoriaWelcome, type VictoriaFuturePlan, type VictoriaMilestone } from "@/lib/victoria/content";
import { daysSince, formatBritishDate, getDailyMessage } from "@/lib/victoria/dates";
import { OFFICIAL_RELATIONSHIP_DATE } from "@/lib/victoria/constants";
import type { VictoriaCountdownSettings, VictoriaMessage, VictoriaSession, VictoriaUserMemory } from "@/lib/victoria/types";

type MediaItem = {
  id: string;
  memoryId: string | null;
  url: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

type Props = {
  session: VictoriaSession;
  countdown: VictoriaCountdownSettings;
  initialNow: string;
  messages: VictoriaMessage[];
  media: MediaItem[];
  userMemories: VictoriaUserMemory[];
  userMilestones: VictoriaMilestone[];
  userFuturePlans: VictoriaFuturePlan[];
  realtimeEnabled: boolean;
};

export function VictoriaExperience({
  session,
  countdown,
  initialNow,
  messages,
  media,
  userMemories,
  userMilestones,
  userFuturePlans,
  realtimeEnabled,
}: Props) {
  const greeting = session.user.username === "victoria" ? "Countdown to your arrival" : "Countdown to your arrival";
  const todayMessage = getDailyMessage();
  const sinceDays = daysSince(OFFICIAL_RELATIONSHIP_DATE);

  // Which existing memory cards currently have their "add a photo" form open.
  // Closed by default so the form isn't permanently taking up space on every card.
  const [openUploadIds, setOpenUploadIds] = useState<ReadonlySet<string>>(new Set());
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const newMemoryRef = useRef<HTMLDivElement>(null);
  const newMilestoneRef = useRef<HTMLDivElement>(null);
  const newPlanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAddingMemory) {
      newMemoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isAddingMemory]);

  useEffect(() => {
    if (isAddingMilestone) {
      newMilestoneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isAddingMilestone]);

  useEffect(() => {
    if (isAddingPlan) {
      newPlanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isAddingPlan]);

  function toggleUploadFor(memoryId: string) {
    setOpenUploadIds((current) => {
      const next = new Set(current);
      if (next.has(memoryId)) {
        next.delete(memoryId);
      } else {
        next.add(memoryId);
      }
      return next;
    });
  }

  // Closes the form outright rather than toggling, so a successful upload
  // can't accidentally reopen it if it were somehow already closed.
  function closeUploadFor(memoryId: string) {
    setOpenUploadIds((current) => {
      if (!current.has(memoryId)) {
        return current;
      }
      const next = new Set(current);
      next.delete(memoryId);
      return next;
    });
  }

  // Group once instead of filtering the whole media array per memory.
  const mediaByMemory = new Map<string, MediaItem[]>();
  for (const item of media) {
    if (!item.memoryId) continue;
    const existing = mediaByMemory.get(item.memoryId);
    if (existing) {
      existing.push(item);
    } else {
      mediaByMemory.set(item.memoryId, [item]);
    }
  }

  // Hand-authored memories (lib/victoria/content.ts) plus ones added live
  // through this page, merged into one chronological list.
  const allMemories = [...memories, ...userMemories].sort((left, right) => left.date.localeCompare(right.date));

  // Milestones are each anchored to a date, so merging by date reads as one
  // coherent timeline regardless of which list an entry came from.
  const allMilestones = [...milestones, ...userMilestones].sort((left, right) => left.occursAt.localeCompare(right.occursAt));

  // Future plans aren't all dated (many are open-ended), so there's no single
  // correct sort key across both lists. Hand-authored ones keep their curated
  // displayOrder; user-added ones just follow after, in the order they were made.
  const sortedPlans = [...futurePlans.slice().sort((left, right) => left.displayOrder - right.displayOrder), ...userFuturePlans];

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7efe7] text-stone-950">
      <VictoriaWelcome
        username={session.user.username}
        lines={victoriaWelcome[session.user.username]}
        shouldShow={!session.user.welcomeCompletedAt}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(252,165,165,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.18),transparent_32%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8">
        <header className="pt-7">
          <div>
            <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-tight text-stone-950 sm:text-6xl">
              {greeting}
            </h1>
          </div>
          <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-stone-700">
            I thought I'd make this for when we miss each other or you want to send me a message in secret
          </p>
        </header>

        <VictoriaCountdown label={countdown.label} targetAt={countdown.targetAt} initialNow={initialNow} />

        {/* CSS rather than framer-motion: this was the only animation on the
            route, and the library cost far more than a single fade. */}
        <section className="motion-safe:animate-victoria-rise rounded-[2rem] border border-white/45 bg-stone-950 p-5 text-white shadow-xl md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">Message of the hour</p>
          <p className="mt-3 text-2xl font-semibold">{todayMessage}</p>
          <p className="mt-3 text-sm text-white/65"></p>
        </section>

        <section aria-labelledby="memories-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="memories-heading" className="text-2xl font-semibold text-stone-950">
                Memories
              </h2>
              <p className="text-sm text-stone-600">Here's to many more to come</p>
            </div>
            <button
              type="button"
              aria-label="Add a new memory"
              onClick={() => setIsAddingMemory(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/60 bg-white/70 text-rose-700 shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <Plus aria-hidden className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {allMemories.map((memory) => {
              const memoryMedia = mediaByMemory.get(memory.id) ?? [];
              const uploadOpen = openUploadIds.has(memory.id);
              return (
                <article key={memory.id} className="rounded-[2rem] border border-white/45 bg-white/80 p-5 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-700">{formatBritishDate(memory.date)}</p>
                    <button
                      type="button"
                      aria-label={uploadOpen ? `Hide the photo form for ${memory.title}` : `Add a photo to ${memory.title}`}
                      aria-expanded={uploadOpen}
                      onClick={() => toggleUploadFor(memory.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-700 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    >
                      <ImagePlus aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-stone-950">{memory.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{memory.body}</p>
                  {memoryMedia.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {memoryMedia.map((item) => (
                        <figure key={item.id} className="overflow-hidden rounded-3xl bg-stone-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.caption ?? memory.title} className="block w-full h-auto" loading="lazy" />
                          {item.caption ? <figcaption className="px-3 py-2 text-xs text-stone-600">{item.caption}</figcaption> : null}
                        </figure>
                      ))}
                    </div>
                  ) : null}
                  {uploadOpen ? (
                    <VictoriaUploadForm memoryId={memory.id} onUploaded={() => closeUploadFor(memory.id)} />
                  ) : null}
                </article>
              );
            })}
            {isAddingMemory ? (
              <div ref={newMemoryRef}>
                <VictoriaNewMemoryForm onCancel={() => setIsAddingMemory(false)} onCreated={() => setIsAddingMemory(false)} />
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/45 bg-white/80 p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Clock aria-hidden className="h-5 w-5 text-rose-700" />
                Milestones
              </h2>
              <button
                type="button"
                aria-label="Add a new milestone"
                onClick={() => setIsAddingMilestone(true)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/60 bg-white/70 text-rose-700 shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <Plus aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {allMilestones.map((milestone) => (
                <div key={milestone.id} className="border-l-2 border-rose-200 pl-4">
                  <p className="text-sm font-semibold text-stone-950">{milestone.title}</p>
                  <p className="text-xs text-stone-500">{formatBritishDate(milestone.occursAt)}</p>
                  {milestone.description ? <p className="mt-1 text-sm text-stone-700">{milestone.description}</p> : null}
                </div>
              ))}
              {isAddingMilestone ? (
                <div ref={newMilestoneRef}>
                  <VictoriaNewMilestoneForm onCancel={() => setIsAddingMilestone(false)} onCreated={() => setIsAddingMilestone(false)} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/45 bg-white/80 p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <CalendarHeart aria-hidden className="h-5 w-5 text-rose-700" />
                Future Plans
              </h2>
              <button
                type="button"
                aria-label="Add a new plan"
                onClick={() => setIsAddingPlan(true)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/60 bg-white/70 text-rose-700 shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <Plus aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {sortedPlans.map((plan) => (
                <div key={plan.id} className="rounded-3xl bg-white/65 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-800">
                      <Check aria-hidden className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-stone-950">{plan.title}</p>
                      {plan.description ? <p className="mt-1 text-sm leading-6 text-stone-700">{plan.description}</p> : null}
                      {plan.targetDate ? <p className="mt-2 text-xs text-stone-500">{formatBritishDate(plan.targetDate)}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
              {isAddingPlan ? (
                <div ref={newPlanRef}>
                  <VictoriaNewFuturePlanForm onCancel={() => setIsAddingPlan(false)} onCreated={() => setIsAddingPlan(false)} />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <VictoriaMessageWall initialMessages={messages} currentUsername={session.user.username} realtimeEnabled={realtimeEnabled} />

        {session.user.role === "owner" ? (
          <a href="/victoria/admin/activity" className="rounded-full bg-stone-950 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
            Admin
          </a>
        ) : null}

        <footer className="pb-8 text-center text-xs text-stone-500">
          Since {formatBritishDate(OFFICIAL_RELATIONSHIP_DATE)} · {sinceDays} days and counting.
        </footer>
      </div>
      <VictoriaEasterEggs />
    </div>
  );
}
