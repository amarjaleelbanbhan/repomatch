import { describe, expect, it } from "vitest";
import { computeClaimedBoost } from "../claimed.js";

describe("computeClaimedBoost", () => {
  it("gives a positive boost to claimed repos", () => {
    expect(computeClaimedBoost(true)).toBeGreaterThan(0);
  });

  it("gives no boost to unclaimed repos", () => {
    expect(computeClaimedBoost(false)).toBe(0);
  });
});
