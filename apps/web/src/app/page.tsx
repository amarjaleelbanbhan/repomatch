import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <h1>RepoMatch</h1>
      <p>Show your OSS activity and get your next repo to try, right in your GitHub README.</p>
      {user ? (
        <>
          <p>Signed in as {user.user_metadata.user_name ?? user.email}</p>
          <a href="/dashboard">Go to dashboard</a>
          <form action="/auth/signout" method="post">
            <button type="submit">Sign out</button>
          </form>
        </>
      ) : (
        <a href="/login">Sign in with GitHub</a>
      )}
    </main>
  );
}
