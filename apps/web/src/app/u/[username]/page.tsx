import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

interface Props {
  params: { username: string };
}

/** FR-5.5: public match page per user, viewable without login, with a sign-up CTA. */
export default async function PublicMatchPage({ params }: Props) {
  const admin = createAdminClient();
  if (!admin) notFound();

  const { data: profile } = await admin
    .from("users")
    .select("id, username, contribution_streak, total_contributions, owned_stars")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: latestCycle } = await admin
    .from("recommendations")
    .select("cycle_ts")
    .eq("user_id", profile.id)
    .order("cycle_ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  let recs: {
    reason: string;
    rank: number;
    repos: { full_name: string; description: string | null; languages: string[]; stars: number } | null;
  }[] = [];

  if (latestCycle) {
    const { data } = await admin
      .from("recommendations")
      .select("reason, rank, repos(full_name, description, languages, stars)")
      .eq("user_id", profile.id)
      .eq("cycle_ts", latestCycle.cycle_ts)
      .order("rank", { ascending: true })
      .limit(10);
    recs = data ?? [];
  }

  return (
    <main>
      <h1>@{profile.username} on RepoMatch</h1>
      <p>
        🔥 {profile.contribution_streak}-day streak · {profile.total_contributions} contributions
        this year · {profile.owned_stars} ★ across owned repos
      </p>

      <section>
        <h2>Matched repos</h2>
        {recs.length === 0 && <p>No matches yet — check back after the next nightly cycle.</p>}
        {recs.map((rec) => {
          const repo = Array.isArray(rec.repos) ? rec.repos[0] : rec.repos;
          if (!repo) return null;
          return (
            <div key={repo.full_name}>
              <h3>{repo.full_name}</h3>
              <p>{repo.description}</p>
              <p>
                {repo.languages.join(", ")} · ★ {repo.stars} · {rec.reason}
              </p>
            </div>
          );
        })}
      </section>

      <section>
        <h2>Get your own</h2>
        <p>See your own OSS activity and personalized repo recommendations in your GitHub README.</p>
        <a className="btn" href="/login">
          Sign in with GitHub
        </a>
      </section>
    </main>
  );
}
