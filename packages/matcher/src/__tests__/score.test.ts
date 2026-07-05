import { describe, expect, it } from "vitest";
import { isEligible, rankMatches, scoreRepo } from "../score.js";
import type { CandidateRepo, UserProfile } from "../types.js";

function makeUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: "u1",
    languages: ["TypeScript", "Python"],
    topics: ["ml", "web"],
    starredRepoIds: [],
    ownedRepoIds: [],
    hiddenRepoIds: [],
    skillLevel: "intermediate",
    ...overrides,
  };
}

function makeRepo(overrides: Partial<CandidateRepo> = {}): CandidateRepo {
  return {
    repoId: "r1",
    languages: ["Python"],
    topics: ["ml"],
    healthScore: 80,
    hasGoodFirstIssues: false,
    hasContributing: false,
    ...overrides,
  };
}

describe("scoreRepo", () => {
  it("scores higher when languages and topics overlap", () => {
    const user = makeUser();
    const matching = scoreRepo(user, makeRepo());
    const nonMatching = scoreRepo(user, makeRepo({ languages: ["Rust"], topics: ["gamedev"] }));
    expect(matching.score).toBeGreaterThan(nonMatching.score);
  });

  it("produces a human-readable reason string", () => {
    const user = makeUser();
    const result = scoreRepo(user, makeRepo());
    expect(result.reason).toContain("matched:");
  });

  it("falls back to health match reason when nothing overlaps", () => {
    const user = makeUser();
    const result = scoreRepo(user, makeRepo({ languages: ["Rust"], topics: ["gamedev"] }));
    expect(result.reason).toBe("health match");
  });
});

describe("isEligible", () => {
  it("excludes owned, starred, and hidden repos", () => {
    const user = makeUser({ ownedRepoIds: ["a"], starredRepoIds: ["b"], hiddenRepoIds: ["c"] });
    expect(isEligible(user, "a")).toBe(false);
    expect(isEligible(user, "b")).toBe(false);
    expect(isEligible(user, "c")).toBe(false);
    expect(isEligible(user, "d")).toBe(true);
  });
});

describe("rankMatches", () => {
  it("returns top N eligible matches sorted by score", () => {
    const user = makeUser({ ownedRepoIds: ["r2"] });
    const candidates = [
      makeRepo({ repoId: "r1", healthScore: 90 }),
      makeRepo({ repoId: "r2", healthScore: 100 }),
      makeRepo({ repoId: "r3", languages: ["Rust"], topics: ["gamedev"], healthScore: 50 }),
    ];
    const results = rankMatches(user, candidates, 2);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.repoId)).not.toContain("r2");
    expect(results[0]!.score).toBeGreaterThanOrEqual(results[1]!.score);
  });
});
