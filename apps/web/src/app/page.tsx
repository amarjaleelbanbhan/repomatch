import { createClient } from "@/lib/supabase/server";

const DEMO_USERNAME = "octocat";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const widgetBaseUrl = process.env.NEXT_PUBLIC_WIDGET_BASE_URL ?? "https://repomatch-widget-kappa.vercel.app";

  return (
    <main>
      <header>
        <h1>RepoMatch</h1>
        <p>Show your OSS activity and get your next repo to try, right in your GitHub README.</p>
        {user ? (
          <>
            <p>Signed in as {user.user_metadata.user_name ?? user.email}</p>
            <a className="btn" href="/dashboard">
              Go to dashboard
            </a>{" "}
            <form action="/auth/signout" method="post" style={{ display: "inline" }}>
              <button type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <a className="btn" href="/login">
            Sign in with GitHub
          </a>
        )}
        <p>
          <a href="https://github.com/amarjaleelbanbhan/repomatch">Open source on GitHub</a> · MIT
          licensed · $0 infrastructure
        </p>
      </header>

      <section>
        <h2>Live demo</h2>
        <img
          src={`${widgetBaseUrl}/api/widget/${DEMO_USERNAME}.svg`}
          alt="RepoMatch widget demo"
          width={420}
        />
      </section>

      <section>
        <h2>Get your own widget in 3 steps</h2>
        <ol>
          <li>Sign in with GitHub (read-only access — we never write to your repos).</li>
          <li>Pick 3–10 interests and your skill level. Takes under 2 minutes.</li>
          <li>Copy the generated markdown snippet into your GitHub profile README.</li>
        </ol>
      </section>
    </main>
  );
}
