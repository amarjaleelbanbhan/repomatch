import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "./ClaimForm";

export default async function ClaimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("username").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: claims } = await supabase
    .from("claims")
    .select("pitch, help_wanted, verified_at, repos(full_name)")
    .eq("maintainer_user_id", user.id);

  return (
    <main id="rm-main-content">
      <h1>Claim a repo you maintain</h1>
      <p>
        Ownership is verified against GitHub — you can only claim repos where{" "}
        <strong>{profile.username}</strong> is the repo owner, and the repo must already be
        indexed by RepoMatch's nightly corpus.
      </p>
      <ClaimForm />

      {claims && claims.length > 0 && (
        <section>
          <h2>Your claimed repos</h2>
          {claims.map((claim) => {
            const repo = Array.isArray(claim.repos) ? claim.repos[0] : claim.repos;
            return (
              <div key={repo?.full_name}>
                <h3>{repo?.full_name}</h3>
                <p>{claim.pitch}</p>
                {claim.help_wanted.length > 0 && <p>Help wanted: {claim.help_wanted.join(", ")}</p>}
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
