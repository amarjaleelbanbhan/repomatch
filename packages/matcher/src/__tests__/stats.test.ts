import { describe, expect, it } from "vitest";
import { computeContributionStreak, mostRecentActiveDate, rankByFrequency } from "../stats.js";
import type { ContributionDay } from "../stats.js";

function days(counts: number[]): ContributionDay[] {
  return counts.map((contributionCount, i) => ({
    date: `2026-07-${String(i + 1).padStart(2, "0")}`,
    contributionCount,
  }));
}

describe("computeContributionStreak", () => {
  it("counts consecutive active days ending at the most recent entry", () => {
    expect(computeContributionStreak(days([1, 0, 2, 3, 4]))).toBe(3);
  });

  it("returns 0 when the most recent day has no contributions", () => {
    expect(computeContributionStreak(days([5, 5, 0]))).toBe(0);
  });

  it("returns the full length when every day is active", () => {
    expect(computeContributionStreak(days([1, 1, 1]))).toBe(3);
  });

  it("handles an empty calendar", () => {
    expect(computeContributionStreak([])).toBe(0);
  });
});

describe("mostRecentActiveDate", () => {
  it("finds the latest day with a contribution", () => {
    expect(mostRecentActiveDate(days([1, 2, 0, 0]))).toBe("2026-07-02");
  });

  it("returns null when nobody has contributed", () => {
    expect(mostRecentActiveDate(days([0, 0]))).toBeNull();
  });
});

describe("rankByFrequency", () => {
  it("orders by descending frequency and truncates to topN", () => {
    const result = rankByFrequency(["ts", "py", "ts", "go", "ts", "py"], 2);
    expect(result).toEqual(["ts", "py"]);
  });

  it("ignores empty values", () => {
    expect(rankByFrequency(["ts", "", "ts"], 5)).toEqual(["ts"]);
  });
});
