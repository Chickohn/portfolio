import { z } from "zod";
import { OFFICIAL_RELATIONSHIP_DATE } from "./constants";

const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  category: z.string().optional(),
  completed: z.boolean(),
  displayOrder: z.number(),
});

const memorySchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  body: z.string(),
  imageCaption: z.string().optional(),
});

const milestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  occursAt: z.string(),
  displayOrder: z.number(),
});

const eggSchema = z.object({
  id: z.string(),
  triggerLabel: z.string(),
  title: z.string(),
  body: z.string(),
});

export const victoriaWelcome = {
  victoria: [
    "This little place is just for us.",
    "A quiet pocket for notes, memories, countdowns, and all the small lovely things.",
    "No pressure to do anything perfectly. Just arrive, smile if you want to, and make yourself at home.",
  ],
  freddie: [
    "Welcome home, Freddie.",
    "Everything here is private, editable, and ready for the two of you to make it yours.",
  ],
} as const;

export const dailyMessages = [
  "One day closer.",
  "A reason I appreciate you belongs here.",
  "Today can hold something soft.",
  "Save a tiny thought for later.",
  "Distance gets a little less dramatic when there is somewhere warm to leave a note.",
  "Add a message that feels like today.",
] as const;

export const memories = [
  {
    id: "first-memory",
    title: "Add your first memory here",
    date: OFFICIAL_RELATIONSHIP_DATE,
    body: "Write a small memory here. Keep the private details in this source-controlled file or attach private images through the upload flow.",
    imageCaption: "Private photos linked to this memory will appear here.",
  },
  {
    id: "small-moment",
    title: "A small moment worth keeping",
    date: "2026-07-12",
    body: "Use this as a gentle placeholder for something specific Freddie can add later.",
  },
] as const;

export const futurePlans = [
  {
    id: "airport",
    title: "Something to look forward to",
    description: "Replace this with a real plan, a tiny date idea, or a shared promise.",
    targetDate: "2026-09-18",
    category: "Together",
    completed: false,
    displayOrder: 1,
  },
  {
    id: "cosy-day",
    title: "A cosy day with no rush",
    description: "Placeholder plan for Freddie to customise.",
    targetDate: undefined,
    category: "Home",
    completed: false,
    displayOrder: 2,
  },
] as const;

export const milestones = [
  {
    id: "official",
    title: "Became official",
    description: "A quiet little date worth remembering.",
    occursAt: OFFICIAL_RELATIONSHIP_DATE,
    displayOrder: 1,
  },
] as const;

export const easterEggs = [
  {
    id: "since-date",
    triggerLabel: "Since date",
    title: "A hidden note",
    body: "Replace this with something tiny and sincere.",
  },
  {
    id: "countdown-hold",
    triggerLabel: "Countdown hold",
    title: "Still counting",
    body: "A placeholder for a secret countdown note.",
  },
] as const;

planSchema.array().parse(futurePlans);
memorySchema.array().parse(memories);
milestoneSchema.array().parse(milestones);
eggSchema.array().parse(easterEggs);
