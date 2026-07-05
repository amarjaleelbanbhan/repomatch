import { describe, expect, it } from "vitest";
import { computeFeedbackAdjustment } from "../feedback.js";

describe("computeFeedbackAdjustment", () => {
  it("boosts repos sharing tags with liked repos", () => {
    const adjustment = computeFeedbackAdjustment(["python", "ml"], ["python"], []);
    expect(adjustment).toBeGreaterThan(0);
  });

  it("penalizes repos sharing tags with disliked repos", () => {
    const adjustment = computeFeedbackAdjustment(["rust", "cli"], [], ["rust"]);
    expect(adjustment).toBeLessThan(0);
  });

  it("is neutral with no overlap", () => {
    expect(computeFeedbackAdjustment(["go"], ["python"], ["rust"])).toBe(0);
  });

  it("is case-insensitive", () => {
    expect(computeFeedbackAdjustment(["Python"], ["python"], [])).toBeGreaterThan(0);
  });

  it("caps the adjustment magnitude", () => {
    const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
    const adjustment = computeFeedbackAdjustment(manyTags, manyTags, []);
    expect(adjustment).toBe(0.3);
  });
});
