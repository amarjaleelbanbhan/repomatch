import { describe, expect, it } from "vitest";
import { computeHealthScore } from "../health.js";

describe("computeHealthScore", () => {
  it("scores a freshly-pushed, popular, active repo near the top", () => {
    const score = computeHealthScore({
      daysSincePush: 0,
      openIssues: 50,
      stars: 5000,
      forks: 500,
      isArchived: false,
    });
    expect(score).toBeGreaterThan(80);
  });

  it("scores a stale repo lower than a fresh one, all else equal", () => {
    const fresh = computeHealthScore({ daysSincePush: 0, openIssues: 5, stars: 20, forks: 2, isArchived: false });
    const stale = computeHealthScore({ daysSincePush: 29, openIssues: 5, stars: 20, forks: 2, isArchived: false });
    expect(fresh).toBeGreaterThan(stale);
  });

  it("zeroes out the status component for archived repos", () => {
    const active = computeHealthScore({ daysSincePush: 0, openIssues: 5, stars: 20, forks: 2, isArchived: false });
    const archived = computeHealthScore({ daysSincePush: 0, openIssues: 5, stars: 20, forks: 2, isArchived: true });
    expect(archived).toBeLessThan(active);
  });

  it("stays within the 0-100 range", () => {
    const max = computeHealthScore({ daysSincePush: 0, openIssues: 1_000_000, stars: 1_000_000, forks: 1_000_000, isArchived: false });
    const min = computeHealthScore({ daysSincePush: 365, openIssues: 0, stars: 0, forks: 0, isArchived: true });
    expect(max).toBeLessThanOrEqual(100);
    expect(min).toBeGreaterThanOrEqual(0);
  });
});
