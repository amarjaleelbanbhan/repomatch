import type { SupabaseClient } from "@supabase/supabase-js";
import { rankMatches } from "@repomatch/matcher";
import type { CandidateRepo, SkillLevel, UserProfile } from "@repomatch/matcher";
import { fetchUserStats } from "./userStats.js";

const TOP_N = 10;

interface UserRow {
  id: string;
  username: string;
  languages: string[];
  topics: string[];
  skill_level: SkillLevel;
}

interface RepoRow {
  id: string;
  full_name: string;
  languages: string[];
  topics: string[];
  health_score: number;
  gfi_count: number;
  has_contributing: boolean;
}

async function loadCandidateRepos(supabase: SupabaseClient): Promise<RepoRow[]> {
  const { data, error } = await supabase
    .from("repos")
    .select("id, full_name, languages, topics, health_score, gfi_count, has_contributing")
    .is("deleted_at", null);

  if (error) throw new Error(`Failed to load candidate repos: ${error.message}`);
  return data ?? [];
}

async function loadHiddenRepoIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("repo_id")
    .eq("user_id", userId)
    .eq("signal", "hide");

  if (error) throw new Error(`Failed to load hidden feedback: ${error.message}`);
  return (data ?? []).map((row) => row.repo_id);
}

/** FR-3.1-3.4: runs one match cycle for a single user against the current candidate corpus. */
export async function matchCycleForUser(
  supabase: SupabaseClient,
  githubToken: string,
  user: UserRow,
  candidates: RepoRow[],
  cycleTs: string,
): Promise<void> {
  const byFullName = new Map(candidates.map((repo) => [repo.full_name, repo]));

  let ownedRepoIds: string[] = [];
  let starredRepoIds: string[] = [];

  try {
    const stats = await fetchUserStats(githubToken, user.username);
    if (stats) {
      ownedRepoIds = stats.ownedRepoNames.flatMap((name) => {
        const repo = byFullName.get(name);
        return repo ? [repo.id] : [];
      });
      starredRepoIds = stats.starredRepoNames.flatMap((name) => {
        const repo = byFullName.get(name);
        return repo ? [repo.id] : [];
      });

      const { error } = await supabase
        .from("users")
        .update({
          contribution_streak: stats.contributionStreak,
          total_contributions: stats.totalContributions,
          last_active_at: stats.lastActiveAt,
        })
        .eq("id", user.id);
      if (error) throw new Error(`Failed to update user stats: ${error.message}`);
    }
  } catch (err) {
    // FR-4.11: activity stats and matching must degrade gracefully per-user, not fail the whole cycle
    console.error(`[matchCycle] stats fetch failed for ${user.username}:`, err);
  }

  const hiddenRepoIds = await loadHiddenRepoIds(supabase, user.id);

  const profile: UserProfile = {
    userId: user.id,
    languages: user.languages,
    topics: user.topics,
    starredRepoIds,
    ownedRepoIds,
    hiddenRepoIds,
    skillLevel: user.skill_level,
  };

  const candidateRepos: CandidateRepo[] = candidates.map((repo) => ({
    repoId: repo.id,
    languages: repo.languages,
    topics: repo.topics,
    healthScore: repo.health_score,
    hasGoodFirstIssues: repo.gfi_count > 0,
    hasContributing: repo.has_contributing,
  }));

  const matches = rankMatches(profile, candidateRepos, TOP_N);
  if (matches.length === 0) return;

  const rows = matches.map((match, index) => ({
    user_id: user.id,
    repo_id: match.repoId,
    score: match.score,
    reason: match.reason,
    rank: index + 1,
    cycle_ts: cycleTs,
  }));

  const { error } = await supabase.from("recommendations").upsert(rows, {
    onConflict: "user_id,repo_id,cycle_ts",
  });
  if (error) throw new Error(`Failed to write recommendations for ${user.username}: ${error.message}`);
}

export async function runMatchCycle(supabase: SupabaseClient, githubToken: string): Promise<void> {
  const cycleTs = new Date().toISOString();
  const candidates = await loadCandidateRepos(supabase);

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, languages, topics, skill_level");
  if (error) throw new Error(`Failed to load users: ${error.message}`);

  for (const user of users ?? []) {
    try {
      await matchCycleForUser(supabase, githubToken, user, candidates, cycleTs);
    } catch (err) {
      console.error(`[matchCycle] cycle failed for ${user.username}:`, err);
    }
  }
}
