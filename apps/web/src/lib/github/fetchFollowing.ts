const GITHUB_API = "https://api.github.com";

/** FR-6.2: fetches the usernames a given GitHub user follows (public data). */
export async function fetchFollowing(username: string): Promise<string[]> {
  const token = process.env.GITHUB_PAT;
  if (!token) return [];

  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}/following?per_page=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "repomatch",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];

  const following = (await res.json()) as { login: string }[];
  return following.map((f) => f.login);
}
