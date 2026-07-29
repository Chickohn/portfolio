import { OFFICIAL_RELATIONSHIP_DATE } from "@/lib/victoria/constants";
import { dailyMessages } from "@/lib/victoria/content";
import { daysSince, getCountdownParts, getDailyMessage, londonDateKey } from "@/lib/victoria/dates";

describe("victoria dates", () => {
  it("uses Europe/London as the daily boundary", () => {
    expect(londonDateKey(new Date("2026-07-29T12:00:00Z"))).toBe("2026-07-29");
  });

  it("calculates days since the official date without negative values", () => {
    expect(daysSince(OFFICIAL_RELATIONSHIP_DATE, new Date("2026-07-12T12:00:00Z"))).toBe(1);
    expect(daysSince(OFFICIAL_RELATIONSHIP_DATE, new Date("2026-07-01T12:00:00Z"))).toBe(0);
  });

  it("rotates daily messages deterministically", () => {
    expect(getDailyMessage(new Date("2026-07-29T12:00:00Z"))).toBe(dailyMessages[Number("20260729") % dailyMessages.length]);
  });

  it("does not show a negative countdown after completion", () => {
    expect(getCountdownParts("2026-09-18T15:00:00.000Z", new Date("2026-09-18T15:00:02.000Z"))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
    });
  });
});
