import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata.user_name as string | undefined;
  const snippet = `[![RepoMatch](https://repomatch-widget.vercel.app/api/widget/${username ?? "your-username"}.svg)](https://repomatch.dev/u/${username ?? "your-username"})`;

  return (
    <main>
      <h1>Welcome, {username}</h1>
      <p>Add this to your GitHub profile README:</p>
      <pre>{snippet}</pre>
    </main>
  );
}
