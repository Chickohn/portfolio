import { dailyMessages, easterEggs, futurePlans, memories, milestones, victoriaWelcome } from "@/lib/victoria/content";

/**
 * lib/victoria/content.ts used to validate itself with zod at module scope, which
 * shipped zod into the /victoria client bundle to re-check constants in the
 * browser on every load. The shape checks live here instead, where they cost
 * nothing at runtime.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("victoria content", () => {
  it("ships safe placeholder content", () => {
    expect(dailyMessages.length).toBeGreaterThan(1);
    expect(memories.length).toBeGreaterThan(0);
    expect(milestones[0]?.occursAt).toBe("2026-07-11");
    expect(futurePlans.every((plan) => typeof plan.displayOrder === "number")).toBe(true);
    expect(easterEggs.length).toBeGreaterThanOrEqual(2);
  });

  it("has a welcome script for both users", () => {
    for (const username of ["freddie", "victoria"] as const) {
      expect(victoriaWelcome[username].length).toBeGreaterThan(0);
      expect(victoriaWelcome[username].every((line) => line.trim().length > 0)).toBe(true);
    }
  });

  it("uses unique ids within each collection", () => {
    for (const collection of [memories, futurePlans, milestones, easterEggs]) {
      const ids = collection.map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => id.length > 0)).toBe(true);
    }
  });

  it("uses parseable ISO dates everywhere a date is rendered", () => {
    for (const memory of memories) {
      expect(memory.date).toMatch(ISO_DATE);
      expect(Number.isNaN(new Date(memory.date).getTime())).toBe(false);
    }
    for (const milestone of milestones) {
      expect(milestone.occursAt).toMatch(ISO_DATE);
      expect(Number.isNaN(new Date(milestone.occursAt).getTime())).toBe(false);
    }
    for (const plan of futurePlans) {
      if (plan.targetDate !== undefined) {
        expect(plan.targetDate).toMatch(ISO_DATE);
        expect(Number.isNaN(new Date(plan.targetDate).getTime())).toBe(false);
      }
    }
  });

  it("derives display order from list position, so no two entries can collide", () => {
    for (const collection of [futurePlans, milestones]) {
      expect(collection.map((entry) => entry.displayOrder)).toEqual(collection.map((_, index) => index + 1));
    }
  });

  it("has non-empty copy for every renderable field", () => {
    for (const memory of memories) {
      expect(memory.title.trim()).not.toBe("");
      expect(memory.body.trim()).not.toBe("");
    }
    for (const egg of easterEggs) {
      expect(egg.triggerLabel.trim()).not.toBe("");
      expect(egg.title.trim()).not.toBe("");
      expect(egg.body.trim()).not.toBe("");
    }
    expect(dailyMessages.every((message) => message.trim().length > 0)).toBe(true);
  });
});
