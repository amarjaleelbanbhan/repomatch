import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchList, type Match } from "./MatchList";

/** FR-5.1: authenticated dashboard listing >=10 matches with filters. */
export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: latestCycle } = await supabase
    .from("recommendations")
    .select("cycle_ts")
    .eq("user_id", user.id)
    .order("cycle_ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  let recs: {
    repo_id: string;
    score: number;
    reason: string;
    rank: number;
    repos: {
      full_name: string;
      description: string | null;
      languages: string[];
      stars: number;
      health_score: number;
      has_contributing: boolean;
    } | null;
  }[] = [];

  if (latestCycle) {
    const { data } = await supabase
      .from("recommendations")
      .select(
        "repo_id, score, reason, rank, repos(full_name, description, languages, stars, health_score, has_contributing)",
      )
      .eq("user_id", user.id)
      .eq("cycle_ts", latestCycle.cycle_ts)
      .order("rank", { ascending: true });
    recs = data ?? [];
  }

  const { data: feedbackRows } = await supabase
    .from("feedback")
    .select("repo_id, signal")
    .eq("user_id", user.id);

  const feedbackByRepo = new Map((feedbackRows ?? []).map((f) => [f.repo_id, f.signal]));

  const matches: Match[] = recs
    .map((rec): Match | null => {
      const repo = Array.isArray(rec.repos) ? rec.repos[0] : rec.repos;
      if (!repo) return null;
      return {
        repoId: rec.repo_id,
        fullName: repo.full_name,
        description: repo.description ?? "",
        languages: repo.languages,
        stars: repo.stars,
        healthScore: repo.health_score,
        hasContributing: repo.has_contributing,
        reason: rec.reason,
        rank: rec.rank,
        feedback: feedbackByRepo.get(rec.repo_id) ?? null,
      };
    })
    .filter((m): m is Match => m !== null)
    // hidden/known matches stay out of the active list — the feedback is still recorded
    .filter((m) => m.feedback !== "hide" && m.feedback !== "known");

  return (
    <main>
      <h1>Your matches</h1>
      <p>{matches.length} repos matched to your interests. React to tune future cycles.</p>
      <MatchList matches={matches} />
    </main>
  );
}
