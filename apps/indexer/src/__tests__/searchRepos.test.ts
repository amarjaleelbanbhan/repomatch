import { describe, expect, it } from "vitest";
import { isEligibleRepo, mapToIndexedRepo } from "../searchRepos.js";

function makeNode(overrides: Partial<Parameters<typeof isEligibleRepo>[0]> = {}) {
  return {
    databaseId: 1,
    nameWithOwner: "octocat/hello-world",
    description: "A demo repo",
    primaryLanguage: { name: "TypeScript" },
    repositoryTopics: { nodes: [{ topic: { name: "cli" } }] },
    stargazerCount: 100,
    forkCount: 10,
    issues: { totalCount: 5 },
    gfi: { totalCount: 2 },
    isArchived: false,
    isFork: false,
    pushedAt: new Date().toISOString(),
    contributing: { id: "abc" },
    ...overrides,
  };
}

describe("isEligibleRepo", () => {
  it("accepts a repo meeting all FR-2.2 criteria", () => {
    expect(isEligibleRepo(makeNode())).toBe(true);
  });

  it("rejects archived repos", () => {
    expect(isEligibleRepo(makeNode({ isArchived: true }))).toBe(false);
  });

  it("rejects forks", () => {
    expect(isEligibleRepo(makeNode({ isFork: true }))).toBe(false);
  });

  it("rejects repos with zero open issues", () => {
    expect(isEligibleRepo(makeNode({ issues: { totalCount: 0 } }))).toBe(false);
  });

  it("rejects repos with a null databaseId", () => {
    expect(isEligibleRepo(makeNode({ databaseId: null }))).toBe(false);
  });
});

describe("mapToIndexedRepo", () => {
  it("maps fields and computes a health score", () => {
    const now = new Date();
    const result = mapToIndexedRepo(makeNode(), now);
    expect(result.fullName).toBe("octocat/hello-world");
    expect(result.languages).toEqual(["TypeScript"]);
    expect(result.topics).toEqual(["cli"]);
    expect(result.hasContributing).toBe(true);
    expect(result.gfiCount).toBe(2);
    expect(result.healthScore).toBeGreaterThan(0);
  });

  it("marks contributing as false when the file lookup returns null", () => {
    const result = mapToIndexedRepo(makeNode({ contributing: null }), new Date());
    expect(result.hasContributing).toBe(false);
  });

  it("handles repos with no detected primary language", () => {
    const result = mapToIndexedRepo(makeNode({ primaryLanguage: null }), new Date());
    expect(result.languages).toEqual([]);
  });
});
