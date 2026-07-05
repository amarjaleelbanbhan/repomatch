import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/app/onboarding/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, topics, skill_level")
    .eq("id", user!.id)
    .single();

  if (!profile) redirect("/login");

  // FR-1.3/1.4: onboarding must complete before the dashboard is usable
  if (profile.topics.length === 0) {
    redirect("/onboarding");
  }

  const snippet = `[![RepoMatch](https://repomatch-widget.vercel.app/api/widget/${profile.username}.svg)](https://repomatch-web.vercel.app)`;

  return (
    <main>
      <h1>Welcome, {profile.username}</h1>
      <p>Add this to your GitHub profile README:</p>
      <pre>{snippet}</pre>

      <p>Interests: {profile.topics.join(", ")} · Skill level: {profile.skill_level}</p>
      <a href="/onboarding">Edit interests</a>

      <form action={deleteAccount}>
        <button type="submit">Delete my account</button>
      </form>
    </main>
  );
}
