/**
 * Hand-authored page copy. Everything here is a literal, so it is checked by
 * TypeScript at build time and by __tests__/lib/victoria/content.test.ts.
 *
 * This file used to validate itself with zod at module scope. Because it is
 * imported by components/victoria/experience.tsx — a client component — that
 * shipped zod to the browser and re-validated constants on every page load.
 * Keep this module dependency-free.
 */
import { OFFICIAL_RELATIONSHIP_DATE } from "./constants";

export type VictoriaMemory = {
  id: string;
  title: string;
  date: string;
  body: string;
  imageCaption?: string;
};

export type VictoriaFuturePlan = {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  category?: string;
  completed: boolean;
  displayOrder: number;
};

export type VictoriaMilestone = {
  id: string;
  title: string;
  description?: string;
  occursAt: string;
  displayOrder: number;
};

export type VictoriaEasterEgg = {
  id: string;
  triggerLabel: string;
  title: string;
  body: string;
};

export const victoriaWelcome = {
  victoria: [
    "I made this for us, I thought it could be cute.",
    "We can keep track of things together if we remember lol",
    "I've started us off with a few things, but hopefully there'll be plenty more to come :)"
  ],
  freddie: [
    "Welcome home, Freddie."
  ],
} as const;

export const dailyMessages = [
  "One day closerr",
  "Thinking about you today. And yesterday. Just thought you should know.",
  "Can't waitt to see you again <333",
  "t'es la numéro 1",
  "Getting the train but it's not to the Victoria I'm hoping for",
  "You're beautiful, funny, and sexy as hell - Of course I'm going to make you mine",
  "Send me a pic of your toes lol - hopefully this isn't the first one that comes up",
  "Tu me rends plus heureux que tu ne le penses <3",
  "I guess I would prioritise you over sam",
  "I miss you </3",
  "Hope you have a great day, I'm thinking about you <3",
  "This countdown moves wayyy too slowly",
  "What noww?"
] as const;

export const memories = [
  {
    id: "sams-bday",
    title: "Sam's birthday",
    date: "2026-06-12",
    body: "Fell into Sams floor and embarrassed myself but that didn't stop the plan I had in mind from before the day started",
  },
  {
    id: "first-date",
    title: "The day I made you mine",
    date: "2026-07-11",
    body: "No amount of A5 wagyu was going to make me less nervous to ask you out 2 mins from Sam's house lol",
  },
  {
    id: "luca-bbq",
    title: "BBQ, missed full-time, no regrets",
    date: "2026-07-18",
    body: "A wonderful wake up before a BBQ with people neither of us knew, there will never be a better idea than leaving before the end of the football to go home with you <3",
  },
  {
    id: "furniture-day",
    title: "The IKEA dream team",
    date: "2026-06-22",
    body: "Early wake up to some useless delivery people, tried to be manly and help build it but couldn't even build a damn chair properly.",
  },
  {
    id: "birthday-garden",
    title: "Your birthday in the garden",
    date: "2026-07-01",
    body: "Pizza and a garden full of your friends, what more could you want?",
  },
] as const satisfies readonly VictoriaMemory[];

/**
 * Display order is the position in this array, not a hand-written number, so
 * two entries can't claim the same slot. Reorder by moving the entry.
 */
const futurePlanEntries = [
  {
    id: "airport",
    title: "Arriving back in London",
    description: "I want to see you as soon as you land, just let me know.",
    targetDate: "2026-09-18",
    category: "Together",
    completed: false,
  },
  {
    id: "tennis",
    title: "An actual tennis match",
    description: "You said tennis keeps you disciplined. Let's see how disciplined you stay once I'm two games up.",
    targetDate: undefined,
    category: "Together",
    completed: false,
  },
  {
    id: "spain-trip",
    title: "Antony's villa in spain",
    description: "I'm sure it'll happen at some point, couples trip to a villa in the middle of nowhere",
    targetDate: undefined,
    category: "Travel",
    completed: false,
  },
  {
    id: "casino-rematch",
    title: "Strip Poker",
    description: "I want to see the gambling queen legacy in action, shame there'll only be five hands before we move on to the good part",
    targetDate: undefined,
    category: "Chaos",
    completed: false,
  },
  {
    id: "ski-trip",
    title: "Ski trip",
    description: "Somewhere cold with good hot chocolate after. You've got the skill, I've got the enthusiasm and none of the technique.",
    targetDate: undefined,
    category: "Adventure",
    completed: false,
  },
  {
    id: "sturgeon-caviar",
    title: "Watching me fish a sturgeon for caviar",
    description: "No further explanation. I wanna do it at some point though now I've thought about it",
    targetDate: undefined,
    category: "Absurd",
    completed: false,
  },
] as const satisfies readonly Omit<VictoriaFuturePlan, "displayOrder">[];

export const futurePlans: readonly VictoriaFuturePlan[] = futurePlanEntries.map((plan, index) => ({
  ...plan,
  displayOrder: index + 1,
}));

/** Same positional ordering as futurePlans above. */
const milestoneEntries = [
  {
    id: "official",
    title: "The day it began",
    description: "I will remember the date now next time you ask",
    occursAt: OFFICIAL_RELATIONSHIP_DATE,
  },
  {
    id: "graduation",
    title: "Your graduation",
    description: "You only went and got a first, wouldn't expect anything less",
    occursAt: "2026-07-21",
  },
  {
    id: "mauritius-departure",
    title: "Off to Mauritius",
    description: "Business class flight away to leave me alone coding this website instead of being with you",
    occursAt: "2026-07-24",
  },
] as const satisfies readonly Omit<VictoriaMilestone, "displayOrder">[];

export const milestones: readonly VictoriaMilestone[] = milestoneEntries.map((milestone, index) => ({
  ...milestone,
  displayOrder: index + 1,
}));

export const easterEggs = [
  {
    id: "since-date",
    triggerLabel: "Since date",
    title: "Gift Certificate",
    body: "If you find this, you are entitled to one free rose toy on me - This took you so much longer than it should have",
  },
  {
    id: "fart-heart",
    triggerLabel: "Countdown heart",
    title: "Excuse you",
    body: "That's the level of romance you can expect from me, sorry lol",
  },
  {
    id: "tile-minigame",
    triggerLabel: "Relationship date",
    title: "Tile minigame",
    body: "If you can beat me at this I'll buy you anything you want.",
  },
] as const satisfies readonly VictoriaEasterEgg[];
