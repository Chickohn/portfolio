import { dailyMessages, easterEggs, futurePlans, memories, milestones } from "@/lib/victoria/content";

describe("victoria content", () => {
  it("ships safe placeholder content", () => {
    expect(dailyMessages.length).toBeGreaterThan(1);
    expect(memories[0]?.title).toContain("Add your first memory");
    expect(milestones[0]?.occursAt).toBe("2026-07-11");
    expect(futurePlans.every((plan) => typeof plan.displayOrder === "number")).toBe(true);
    expect(easterEggs.length).toBeGreaterThanOrEqual(2);
  });
});
