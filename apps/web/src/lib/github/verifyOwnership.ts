const GITHUB_API = "https://api.github.com";

/**
 * FR-6.3: ownership verification for repo claiming. Checks whether the given GitHub username
 * is the literal owner of the repo (covers the common personal-repo case; org-owned repos
 * with the user as an admin-but-not-owner are a known limitation for a later iteration).
 */
export async function isRepoOwner(fullName: string, username: string): Promise<boolean> {
  const token = process.env.GITHUB_PAT;
  if (!token) return false;

  const res = await fetch(`${GITHUB_API}/repos/${fullName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "repomatch",
    },
    cache: "no-store",
  });
  if (!res.ok) return false;

  const repo = (await res.json()) as { owner?: { login?: string } };
  return repo.owner?.login?.toLowerCase() === username.toLowerCase();
}
