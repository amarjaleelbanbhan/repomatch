import type { SupabaseClient } from "@supabase/supabase-js";
import type { IndexedRepo } from "./searchRepos.js";

/** FR-2.1/2.4: upserts the nightly candidate corpus, keyed by github_id. */
export async function upsertRepos(supabase: SupabaseClient, repos: IndexedRepo[]): Promise<void> {
  if (repos.length === 0) return;

  const rows = repos.map((repo) => ({
    github_id: repo.githubId,
    full_name: repo.fullName,
    description: repo.description,
    languages: repo.languages,
    topics: repo.topics,
    stars: repo.stars,
    forks: repo.forks,
    open_issues: repo.openIssues,
    gfi_count: repo.gfiCount,
    has_contributing: repo.hasContributing,
    health_score: repo.healthScore,
    last_commit_at: repo.lastCommitAt,
    indexed_at: new Date().toISOString(),
    deleted_at: null,
  }));

  const { error } = await supabase.from("repos").upsert(rows, { onConflict: "github_id" });
  if (error) {
    throw new Error(`Failed to upsert repos: ${error.message}`);
  }
}

/** FR-2.4: soft-delete repos that have dropped out of the candidate corpus for >90 days. */
export async function pruneStaleRepos(supabase: SupabaseClient): Promise<void> {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("repos")
    .update({ deleted_at: new Date().toISOString() })
    .lt("indexed_at", cutoff)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Failed to prune stale repos: ${error.message}`);
  }
}
