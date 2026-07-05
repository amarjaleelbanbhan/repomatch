"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRepoOwner } from "@/lib/github/verifyOwnership";

export interface ClaimResult {
  error?: string;
  success?: boolean;
}

/** FR-6.3: maintainers claim repos via ownership verification; claimed repos gain a pitch + help-wanted areas. */
export async function claimRepo(_prevState: ClaimResult, formData: FormData): Promise<ClaimResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user!.id)
    .single();
  if (!profile) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const helpWanted = String(formData.get("helpWanted") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data: repo } = await supabase.from("repos").select("id").eq("full_name", fullName).maybeSingle();
  if (!repo) {
    return { error: `${fullName} isn't indexed by RepoMatch yet — it needs to appear in the nightly corpus first.` };
  }

  const owned = await isRepoOwner(fullName, profile.username);
  if (!owned) {
    return { error: `We couldn't verify you as the owner of ${fullName} on GitHub.` };
  }

  const { error } = await supabase.from("claims").upsert(
    {
      repo_id: repo.id,
      maintainer_user_id: user!.id,
      pitch,
      help_wanted: helpWanted,
      verified_at: new Date().toISOString(),
    },
    { onConflict: "repo_id" },
  );

  if (error) return { error: `Failed to save claim: ${error.message}` };

  return { success: true };
}
