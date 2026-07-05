import { computeContributionStreak, mostRecentActiveDate } from "@repomatch/matcher";
import type { ContributionDay } from "@repomatch/matcher";
import { githubGraphQL } from "./github.js";

const USER_STATS_QUERY = `
  query UserStats($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        nodes { nameWithOwner stargazerCount }
      }
      starredRepositories(first: 100) {
        nodes { nameWithOwner }
      }
    }
  }
`;

interface RawUserStats {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: ContributionDay[] }[];
      };
    };
    repositories: { nodes: { nameWithOwner: string; stargazerCount: number }[] };
    starredRepositories: { nodes: { nameWithOwner: string }[] };
  } | null;
}

export interface UserStats {
  totalContributions: number;
  contributionStreak: number;
  lastActiveAt: string | null;
  ownedRepoNames: string[];
  ownedStars: number;
  starredRepoNames: string[];
}

/** FR-4.8/4.10: derives activity-card stats from a raw contribution calendar + repo lists. */
export function mapUserStats(raw: RawUserStats): UserStats | null {
  if (!raw.user) return null;

  const days = raw.user.contributionsCollection.contributionCalendar.weeks.flatMap(
    (week) => week.contributionDays,
  );

  return {
    totalContributions: raw.user.contributionsCollection.contributionCalendar.totalContributions,
    contributionStreak: computeContributionStreak(days),
    lastActiveAt: mostRecentActiveDate(days),
    ownedRepoNames: raw.user.repositories.nodes.map((n) => n.nameWithOwner),
    ownedStars: raw.user.repositories.nodes.reduce((sum, n) => sum + n.stargazerCount, 0),
    starredRepoNames: raw.user.starredRepositories.nodes.map((n) => n.nameWithOwner),
  };
}

export async function fetchUserStats(token: string, username: string): Promise<UserStats | null> {
  const data = await githubGraphQL<RawUserStats>(token, USER_STATS_QUERY, { login: username });
  return mapUserStats(data);
}
