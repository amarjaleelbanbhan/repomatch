import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchFollowing } from "@/lib/github/fetchFollowing";

/** FR-6.2: following-graph discovery — repos owned by people the user follows on GitHub. */
export default async function NetworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("username").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const following = await fetchFollowing(profile.username);
  const followingSet = new Set(following.map((f) => f.toLowerCase()));

  const { data: repos } = await supabase
    .from("repos")
    .select("full_name, description, languages, stars")
    .is("deleted_at", null);

  const networkRepos = (repos ?? []).filter((repo) => {
    const owner = repo.full_name.split("/")[0]?.toLowerCase();
    return owner && followingSet.has(owner);
  });

  return (
    <main>
      <h1>Your network's repos</h1>
      <p>
        Repos in RepoMatch's index owned by the {following.length} people you follow on GitHub.
      </p>

      {following.length === 0 && <p>We couldn't read your GitHub following list.</p>}
      {following.length > 0 && networkRepos.length === 0 && (
        <p>None of your network's repos are indexed by RepoMatch yet — check back after future cycles.</p>
      )}

      {networkRepos.map((repo) => (
        <section key={repo.full_name}>
          <h2>{repo.full_name}</h2>
          <p>{repo.description}</p>
          <p>
            {repo.languages.join(", ")} · ★ {repo.stars}
          </p>
        </section>
      ))}
    </main>
  );
}
