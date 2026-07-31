import { dailyMessages } from "./content";

/**
 * Formatters are built once at module load, not per call.
 *
 * Constructing an Intl.DateTimeFormat is expensive relative to using one:
 * measured 94.6ms vs 2.5ms per 1000 formats. experience.tsx calls
 * formatBritishDate roughly ten times per render (memories, milestones, plans,
 * footer), and the message wall formats every message on every keystroke.
 */
const britishDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/London",
});

const londonDayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/London",
});

export function formatBritishDate(value: string | Date) {
  return britishDateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function londonDateKey(now = new Date()) {
  return londonDayKeyFormatter.format(now);
}

export function daysSince(dateKey: string, now = new Date()) {
  const start = Date.UTC(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(5, 7)) - 1,
    Number(dateKey.slice(8, 10)),
  );
  const todayKey = londonDateKey(now);
  const today = Date.UTC(
    Number(todayKey.slice(0, 4)),
    Number(todayKey.slice(5, 7)) - 1,
    Number(todayKey.slice(8, 10)),
  );
  return Math.max(0, Math.floor((today - start) / 86_400_000));
}

export function getDailyMessage(now = new Date()) {
  const key = londonDateKey(now).replaceAll("-", "");
  const index = Number(key) % dailyMessages.length;
  return dailyMessages[index];
}

export function getCountdownParts(targetIso: string, now = new Date()) {
  const remaining = Math.max(0, new Date(targetIso).getTime() - now.getTime());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isComplete: remaining === 0,
  };
}
