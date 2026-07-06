import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SwipeDeck, type SwipeCard } from "./SwipeDeck";

/** FR-5.6: mobile-first swipe interface — right=save+up signal, left=hide+down signal. */
export default async function SwipePage() {
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
    reason: string;
    repos: { full_name: string; description: string | null; languages: string[]; stars: number } | null;
  }[] = [];

  if (latestCycle) {
    const { data } = await supabase
      .from("recommendations")
      .select("repo_id, reason, repos(full_name, description, languages, stars)")
      .eq("user_id", user.id)
      .eq("cycle_ts", latestCycle.cycle_ts)
      .order("rank", { ascending: true });
    recs = data ?? [];
  }

  const { data: feedbackRows } = await supabase
    .from("feedback")
    .select("repo_id")
    .eq("user_id", user.id);
  const alreadyReactedIds = new Set((feedbackRows ?? []).map((f) => f.repo_id));

  const cards: SwipeCard[] = recs
    .filter((rec) => !alreadyReactedIds.has(rec.repo_id))
    .map((rec): SwipeCard | null => {
      const repo = Array.isArray(rec.repos) ? rec.repos[0] : rec.repos;
      if (!repo) return null;
      return {
        repoId: rec.repo_id,
        fullName: repo.full_name,
        description: repo.description ?? "",
        languages: repo.languages,
        stars: repo.stars,
        reason: rec.reason,
      };
    })
    .filter((c): c is SwipeCard => c !== null);

  return (
    <main id="rm-main-content">
      <h1>Swipe your matches</h1>
      <p>Swipe right (or tap 👍) to save, left (or tap 👎) to pass.</p>
      <SwipeDeck cards={cards} />
    </main>
  );
}
