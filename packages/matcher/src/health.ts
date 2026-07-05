export interface RepoHealthInput {
  daysSincePush: number;
  openIssues: number;
  stars: number;
  forks: number;
  isArchived: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** FR-2.3: health score = recency 40% + open issues 25% + stars/forks 20% + repo status 15%, on a 0-100 scale */
export function computeHealthScore(input: RepoHealthInput): number {
  const recency = clamp01(1 - input.daysSincePush / 30);
  const openIssuesScore = clamp01(Math.log10(input.openIssues + 1) / Math.log10(101));
  const popularityScore = clamp01(Math.log10(input.stars + input.forks + 1) / Math.log10(10001));
  const statusScore = input.isArchived ? 0 : 1;

  const score = recency * 0.4 + openIssuesScore * 0.25 + popularityScore * 0.2 + statusScore * 0.15;
  return Math.round(score * 10000) / 100;
}
