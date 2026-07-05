import type { CandidateRepo, MatchResult, UserProfile } from "./types.js";

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map((v) => v.toLowerCase()));
  const setB = new Set(b.map((v) => v.toLowerCase()));
  let intersection = 0;
  for (const v of setA) if (setB.has(v)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** FR-3.1: score = language overlap 40% + topic overlap 30% + starred-repo similarity 20% + health 10% */
export function scoreRepo(
  user: UserProfile,
  repo: CandidateRepo,
  starredRepoTopics: string[] = [],
): MatchResult {
  const languageOverlap = jaccard(user.languages, repo.languages);
  const topicOverlap = jaccard(user.topics, repo.topics);
  const starredSimilarity = jaccard(starredRepoTopics, repo.topics);
  const health = repo.healthScore / 100;

  const score =
    languageOverlap * 0.4 + topicOverlap * 0.3 + starredSimilarity * 0.2 + health * 0.1;

  const matchedLanguages = repo.languages.filter((l) =>
    user.languages.some((ul) => ul.toLowerCase() === l.toLowerCase()),
  );
  const matchedTopics = repo.topics.filter((t) =>
    user.topics.some((ut) => ut.toLowerCase() === t.toLowerCase()),
  );
  const reasonParts = [...matchedLanguages, ...matchedTopics].slice(0, 3);
  const reason = reasonParts.length > 0 ? `matched: ${reasonParts.join(" + ")}` : "health match";

  return { repoId: repo.repoId, score, reason };
}

/** FR-3.2: excludes repos the user owns, has starred, or has hidden */
export function isEligible(user: UserProfile, repoId: string): boolean {
  return (
    !user.ownedRepoIds.includes(repoId) &&
    !user.starredRepoIds.includes(repoId) &&
    !user.hiddenRepoIds.includes(repoId)
  );
}

/** FR-3.4: top-N matches per user */
export function rankMatches(
  user: UserProfile,
  candidates: CandidateRepo[],
  n: number,
): MatchResult[] {
  return candidates
    .filter((repo) => isEligible(user, repo.repoId))
    .map((repo) => scoreRepo(user, repo))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
