"use client";

import { motion } from "framer-motion";
import { CalendarHeart, Check, Clock, Image as ImageIcon, ShieldCheck } from "lucide-react";

import { VictoriaCountdown } from "./countdown";
import { VictoriaEasterEggs } from "./easter-eggs";
import { VictoriaMessageWall } from "./message-wall";
import { VictoriaUploadForm } from "./upload-form";
import { VictoriaWelcome } from "./welcome";
import { dailyMessages, futurePlans, memories, milestones, victoriaWelcome } from "@/lib/victoria/content";
import { daysSince, formatBritishDate, getDailyMessage } from "@/lib/victoria/dates";
import { OFFICIAL_RELATIONSHIP_DATE } from "@/lib/victoria/constants";
import type { VictoriaCountdownSettings, VictoriaMessage, VictoriaSession } from "@/lib/victoria/types";

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
  realtimeEnabled: boolean;
};

export function VictoriaExperience({ session, countdown, initialNow, messages, media, realtimeEnabled }: Props) {
  const greeting = session.user.username === "victoria" ? "Hi Victoria, this is our quiet corner." : "Hi Freddie, the little corner is ready.";
  const todayMessage = getDailyMessage();
  const sinceDays = daysSince(OFFICIAL_RELATIONSHIP_DATE);

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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-800">Private</p>
              <h1 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-tight text-stone-950 sm:text-6xl">
                {greeting}
              </h1>
            </div>
            <span className="hidden rounded-full border border-white/60 bg-white/55 px-4 py-2 text-xs font-medium text-stone-700 shadow-sm backdrop-blur sm:inline-flex">
              <ShieldCheck aria-hidden className="mr-2 h-4 w-4 text-emerald-700" />
              Device claimed
            </span>
          </div>
          <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-stone-700">
            Countdowns, notes, memories, tiny plans, and a few secrets for exploring. Basic first-party activity is recorded here for visit history and page functionality.
          </p>
        </header>

        <VictoriaCountdown label={countdown.label} targetAt={countdown.targetAt} initialNow={initialNow} />

        <motion.section
          className="rounded-[2rem] border border-white/45 bg-stone-950 p-5 text-white shadow-xl md:p-7"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">Today</p>
          <p className="mt-3 text-2xl font-semibold">{todayMessage}</p>
          <p className="mt-3 text-sm text-white/65">{dailyMessages.length} editable daily placeholders, rotating by the London calendar day.</p>
        </motion.section>

        <section aria-labelledby="memories-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="memories-heading" className="text-2xl font-semibold text-stone-950">
                Memories
              </h2>
              <p className="text-sm text-stone-600">Source-controlled text, private uploaded images.</p>
            </div>
            <ImageIcon aria-hidden className="h-5 w-5 text-rose-700" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {memories.map((memory) => {
              const memoryMedia = media.filter((item) => item.memoryId === memory.id);
              return (
                <article key={memory.id} className="rounded-[2rem] border border-white/45 bg-white/70 p-5 shadow-lg backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-700">{formatBritishDate(memory.date)}</p>
                  <h3 className="mt-2 text-xl font-semibold text-stone-950">{memory.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{memory.body}</p>
                  {memoryMedia.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {memoryMedia.map((item) => (
                        <figure key={item.id} className="overflow-hidden rounded-3xl bg-stone-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.caption ?? memory.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                          {item.caption ? <figcaption className="px-3 py-2 text-xs text-stone-600">{item.caption}</figcaption> : null}
                        </figure>
                      ))}
                    </div>
                  ) : null}
                  <VictoriaUploadForm memoryId={memory.id} />
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/45 bg-white/70 p-5 shadow-lg backdrop-blur">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Clock aria-hidden className="h-5 w-5 text-rose-700" />
              Milestones
            </h2>
            <div className="mt-5 space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="border-l-2 border-rose-200 pl-4">
                  <p className="text-sm font-semibold text-stone-950">{milestone.title}</p>
                  <p className="text-xs text-stone-500">{formatBritishDate(milestone.occursAt)}</p>
                  {milestone.description ? <p className="mt-1 text-sm text-stone-700">{milestone.description}</p> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/45 bg-white/70 p-5 shadow-lg backdrop-blur">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CalendarHeart aria-hidden className="h-5 w-5 text-rose-700" />
              Future Plans
            </h2>
            <div className="mt-5 space-y-3">
              {futurePlans
                .slice()
                .sort((left, right) => left.displayOrder - right.displayOrder)
                .map((plan) => (
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
            </div>
          </div>
        </section>

        <VictoriaMessageWall initialMessages={messages} currentUsername={session.user.username} realtimeEnabled={realtimeEnabled} />

        {session.user.role === "owner" ? (
          <a href="/victoria/admin/activity" className="rounded-full bg-stone-950 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
            Freddie activity dashboard
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
