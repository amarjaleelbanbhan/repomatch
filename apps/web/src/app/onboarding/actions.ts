"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

/** FR-1.3/1.4: save the user's chosen interests + skill level and land on the dashboard. */
export async function saveOnboarding(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const topics = formData.getAll("topics").map(String);
  const languages = formData.getAll("languages").map(String);
  const skillLevel = String(formData.get("skillLevel") ?? "beginner");

  if (topics.length < 3 || topics.length > 10) {
    throw new Error("Pick between 3 and 10 interests.");
  }

  const { error } = await supabase
    .from("users")
    .update({
      topics,
      languages,
      skill_level: skillLevel as Database["public"]["Enums"]["skill_level"],
    })
    .eq("id", user!.id);

  if (error) throw new Error(`Failed to save onboarding: ${error.message}`);

  redirect("/dashboard");
}

/** FR-1.5: full account deletion — cascades to recommendations/feedback/claims via FK, erased immediately (well within the 30-day ceiling). */
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Account deletion is not configured.");

  const admin = createServiceClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(user!.id);
  if (error) throw new Error(`Failed to delete account: ${error.message}`);

  await supabase.auth.signOut();
  redirect("/");
}
