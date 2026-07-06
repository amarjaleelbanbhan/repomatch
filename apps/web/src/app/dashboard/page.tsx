import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/app/onboarding/actions";
import { Button, Badge, BadgeGroup, Card } from "@/components/ui";

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
    <main id="rm-main-content">
      <h1>Welcome, {profile.username}</h1>

      {/* Navigation buttons — rendered as anchor <a> via href prop */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        <Button variant="primary" href="/matches">View your matches</Button>
        <Button variant="secondary" href="/claim">Claim a repo you maintain</Button>
        <Button variant="secondary" href="/people">Developers like you</Button>
        <Button variant="secondary" href="/network">Your network&apos;s repos</Button>
        <Button variant="secondary" href="/swipe">Swipe mode</Button>
      </div>

      {/* Widget snippet */}
      <section>
        <h2>Your widget snippet</h2>
        <p>Add this to your GitHub profile README:</p>
        <pre>{snippet}</pre>
      </section>

      {/* Profile */}
      <section>
        <h2>Your profile</h2>
        <BadgeGroup style={{ margin: "12px 0" } as React.CSSProperties}>
          {profile.topics.map((topic) => (
            <Badge variant="primary" key={topic}>{topic}</Badge>
          ))}
        </BadgeGroup>
        <p>
          Skill level: <Badge variant="info">{profile.skill_level}</Badge>
        </p>
        <Button variant="secondary" href="/onboarding" style={{ marginTop: 8 } as React.CSSProperties}>
          Edit interests
        </Button>
      </section>

      {/* Danger zone */}
      <section>
        <h2>Danger zone</h2>
        <p>Deletes your account and all associated data immediately.</p>
        <form action={deleteAccount}>
          <Button type="submit" variant="danger">
            Delete my account
          </Button>
        </form>
      </section>
    </main>
  );
}
