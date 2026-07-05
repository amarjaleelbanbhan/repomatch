import { describe, expect, it } from "vitest";
import { computeUserSimilarity } from "../similarity.js";

describe("computeUserSimilarity", () => {
  it("scores higher for users with more shared topics/languages", () => {
    const a = { topics: ["ml", "web"], languages: ["python"] };
    const similar = { topics: ["ml", "web"], languages: ["python"] };
    const different = { topics: ["gamedev"], languages: ["rust"] };
    expect(computeUserSimilarity(a, similar)).toBeGreaterThan(computeUserSimilarity(a, different));
  });

  it("is zero for users with nothing in common", () => {
    expect(computeUserSimilarity({ topics: ["ml"], languages: ["python"] }, { topics: ["cli"], languages: ["rust"] })).toBe(0);
  });

  it("handles empty profiles without throwing", () => {
    expect(computeUserSimilarity({ topics: [], languages: [] }, { topics: ["ml"], languages: ["python"] })).toBe(0);
  });

  it("is symmetric", () => {
    const a = { topics: ["ml", "web"], languages: ["python", "go"] };
    const b = { topics: ["web", "cli"], languages: ["go", "rust"] };
    expect(computeUserSimilarity(a, b)).toBeCloseTo(computeUserSimilarity(b, a));
  });
});
