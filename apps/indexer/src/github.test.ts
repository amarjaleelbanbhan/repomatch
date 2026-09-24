import { afterEach, expect, test, vi } from "vitest";
import { GitHubGraphQLError, githubGraphQL } from "./github.js";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("retries transient HTTP failures and returns the recovered result", async () => {
  vi.useFakeTimers();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response("gateway timeout", { status: 504 }))
    .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
    .mockResolvedValueOnce(Response.json({ data: { search: { nodes: [] } } }));
  vi.stubGlobal("fetch", fetchMock);

  const result = githubGraphQL<{ search: { nodes: unknown[] } }>("token", "query", {});
  const assertion = expect(result).resolves.toEqual({ search: { nodes: [] } });
  await vi.runAllTimersAsync();
  await assertion;
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test("stops after three transient HTTP failures", async () => {
  vi.useFakeTimers();
  const fetchMock = vi.fn().mockResolvedValue(new Response("gateway timeout", { status: 504 }));
  vi.stubGlobal("fetch", fetchMock);

  const result = githubGraphQL("token", "query", {});
  const assertion = expect(result).rejects.toThrow("GitHub GraphQL request failed: 504");
  await vi.runAllTimersAsync();
  await assertion;
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test("does not retry authentication errors", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 }));
  vi.stubGlobal("fetch", fetchMock);

  await expect(githubGraphQL("token", "query", {})).rejects.toThrow(
    "GitHub GraphQL request failed: 401",
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("does not retry GraphQL application errors", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ errors: [{ message: "Invalid query" }] }));
  vi.stubGlobal("fetch", fetchMock);

  await expect(githubGraphQL("token", "query", {})).rejects.toBeInstanceOf(GitHubGraphQLError);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
