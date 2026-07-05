import { describe, expect, it } from "vitest";
import { computeSkillAdjustment } from "../skill.js";

describe("computeSkillAdjustment", () => {
  it("boosts beginner-friendly repos for beginners", () => {
    expect(computeSkillAdjustment("beginner", true, true)).toBeGreaterThan(0);
  });

  it("does not adjust for intermediate/advanced users", () => {
    expect(computeSkillAdjustment("intermediate", true, true)).toBe(0);
    expect(computeSkillAdjustment("advanced", true, true)).toBe(0);
  });

  it("gives no boost to a beginner when the repo has neither signal", () => {
    expect(computeSkillAdjustment("beginner", false, false)).toBe(0);
  });

  it("boosts good-first-issues more than CONTRIBUTING.md alone", () => {
    const gfiOnly = computeSkillAdjustment("beginner", true, false);
    const contributingOnly = computeSkillAdjustment("beginner", false, true);
    expect(gfiOnly).toBeGreaterThan(contributingOnly);
  });
});
