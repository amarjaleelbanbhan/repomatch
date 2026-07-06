"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGitHub() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        // FR-1.1 / NFR-5: read-only scope only, no write access to repos
        scopes: "read:user",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main id="rm-main-content">
      <h1>Sign in to RepoMatch</h1>
      <button className="btn" onClick={signInWithGitHub}>
        Sign in with GitHub
      </button>
    </main>
  );
}
