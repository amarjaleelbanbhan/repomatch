import { redirect } from "next/navigation";
import { computeUserSimilarity } from "@repomatch/matcher";
import { createClient } from "@/lib/supabase/server";

/** FR-6.1: "Developers like you" — user-user similarity via shared topics/languages. */
export default async function PeoplePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("topics, languages")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  const { data: others } = await supabase
    .from("users")
    .select("username, topics, languages, skill_level")
    .neq("id", user.id);

  const ranked = (others ?? [])
    .map((other) => ({
      ...other,
      similarity: computeUserSimilarity(profile, other),
    }))
    .filter((other) => other.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  return (
    <main id="rm-main-content">
      <h1>Developers like you</h1>
      <p>Other RepoMatch users who share your interests.</p>

      {ranked.length === 0 && <p>No matches yet — check back as more developers join.</p>}

      {ranked.map((other) => (
        <section key={other.username}>
          <h2>
            <a href={`https://github.com/${other.username}`}>@{other.username}</a>
          </h2>
          <div className="badges">
            {other.topics.map((topic) => (
              <span className="chip" key={topic}>
                {topic}
              </span>
            ))}
          </div>
          <p>Skill level: {other.skill_level}</p>
        </section>
      ))}
    </main>
  );
}
