import { describe, expect, it } from "vitest";
import { mapUserStats } from "../userStats.js";

function makeRaw(overrides: Partial<{ totalContributions: number; days: { date: string; contributionCount: number }[]; owned: string[]; starred: string[] }> = {}) {
  const days = overrides.days ?? [
    { date: "2026-07-01", contributionCount: 1 },
    { date: "2026-07-02", contributionCount: 2 },
    { date: "2026-07-03", contributionCount: 0 },
  ];
  return {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: overrides.totalContributions ?? 500,
          weeks: [{ contributionDays: days }],
        },
      },
      repositories: { nodes: (overrides.owned ?? ["me/repo-a"]).map((nameWithOwner) => ({ nameWithOwner })) },
      starredRepositories: {
        nodes: (overrides.starred ?? ["octocat/hello-world"]).map((nameWithOwner) => ({ nameWithOwner })),
      },
    },
  };
}

describe("mapUserStats", () => {
  it("returns null for a user GitHub couldn't resolve", () => {
    expect(mapUserStats({ user: null })).toBeNull();
  });

  it("derives streak, last active date, and repo name lists", () => {
    const result = mapUserStats(makeRaw());
    expect(result).not.toBeNull();
    expect(result!.totalContributions).toBe(500);
    expect(result!.contributionStreak).toBe(0); // most recent day (07-03) has 0 contributions
    expect(result!.lastActiveAt).toBe("2026-07-02");
    expect(result!.ownedRepoNames).toEqual(["me/repo-a"]);
    expect(result!.starredRepoNames).toEqual(["octocat/hello-world"]);
  });

  it("reports a positive streak when the most recent day is active", () => {
    const result = mapUserStats(
      makeRaw({
        days: [
          { date: "2026-07-01", contributionCount: 0 },
          { date: "2026-07-02", contributionCount: 3 },
          { date: "2026-07-03", contributionCount: 1 },
        ],
      }),
    );
    expect(result!.contributionStreak).toBe(2);
  });
});
