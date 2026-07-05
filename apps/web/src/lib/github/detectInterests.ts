import { rankByFrequency } from "@repomatch/matcher";

const GITHUB_API = "https://api.github.com";

export interface DetectedInterests {
  languages: string[];
  topics: string[];
}

interface GitHubRepoSummary {
  language: string | null;
  topics?: string[];
}

async function githubFetch(path: string, token: string): Promise<GitHubRepoSummary[]> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "repomatch",
    },
    // this is a one-off, user-initiated onboarding lookup, not the widget serving path (FR-4.5 scope)
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) as GitHubRepoSummary[];
}

/**
 * FR-1.2: auto-detects languages/topics from the user's own public repos and starred repos,
 * to pre-populate the onboarding interest profile. Uses our server-side token (not the widget
 * serving path) since public repo/star lists don't need the user's own OAuth token.
 */
export async function detectInterests(username: string): Promise<DetectedInterests> {
  const token = process.env.GITHUB_PAT;
  if (!token) return { languages: [], topics: [] };

  const [repos, starred] = await Promise.all([
    githubFetch(`/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner`, token),
    githubFetch(`/users/${encodeURIComponent(username)}/starred?per_page=100`, token),
  ]);

  const all = [...repos, ...starred];
  const languages = rankByFrequency(all.map((r) => r.language ?? "").filter(Boolean), 5);
  const topics = rankByFrequency(all.flatMap((r) => r.topics ?? []), 10);

  return { languages, topics };
}
