"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type FeedbackSignal = Database["public"]["Enums"]["feedback_signal"];

/** FR-5.3: per-match feedback (up/down/known/hide). Only the latest signal per repo is kept. */
export async function submitFeedback(repoId: string, signal: FeedbackSignal): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("feedback").delete().eq("user_id", user.id).eq("repo_id", repoId);

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    repo_id: repoId,
    signal,
  });

  if (error) throw new Error(`Failed to save feedback: ${error.message}`);

  revalidatePath("/matches");
}
