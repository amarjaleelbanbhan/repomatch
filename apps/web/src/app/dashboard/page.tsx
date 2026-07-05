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

  const widgetBaseUrl = process.env.NEXT_PUBLIC_WIDGET_BASE_URL ?? "https://repomatch-widget-kappa.vercel.app";
  const snippet = `[![RepoMatch](${widgetBaseUrl}/api/widget/${profile.username}.svg)](https://repomatch-web.vercel.app/u/${profile.username})`;

  return (
    <main>
      <h1>Welcome, {profile.username}</h1>
      <p>
        <a className="btn" href="/matches">
          View your matches
        </a>{" "}
        <a className="btn" href="/claim">
          Claim a repo you maintain
        </a>
      </p>

      <section>
        <h2>Your widget snippet</h2>
        <p>Add this to your GitHub profile README:</p>
        <pre>{snippet}</pre>
      </section>

      <section>
        <h2>Your profile</h2>
        <div className="badges">
          {profile.topics.map((topic) => (
            <span className="chip" key={topic}>
              {topic}
            </span>
          ))}
        </div>
        <p>Skill level: {profile.skill_level}</p>
        <a className="btn" href="/onboarding">
          Edit interests
        </a>
      </section>

      <section>
        <h2>Danger zone</h2>
        <p>Deletes your account and all associated data immediately.</p>
        <form action={deleteAccount}>
          <button type="submit" className="btn-danger">
            Delete my account
          </button>
        </form>
      </section>
    </main>
  );
}
