export interface ContributionDay {
  date: string; // ISO date, YYYY-MM-DD
  contributionCount: number;
}

/**
 * FR-4.8: contribution streak, counted backward from the most recent day in the calendar.
 * Assumes `days` is sorted ascending by date. A day with zero contributions ends the streak.
 */
export function computeContributionStreak(days: ContributionDay[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]!.contributionCount > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Most recent day with at least one contribution, or null if the user has none in the window. */
export function mostRecentActiveDate(days: ContributionDay[]): string | null {
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]!.contributionCount > 0) {
      return days[i]!.date;
    }
  }
  return null;
}

/** Ranks values by frequency of occurrence, most frequent first. */
export function rankByFrequency(values: string[], topN: number): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([value]) => value);
}
