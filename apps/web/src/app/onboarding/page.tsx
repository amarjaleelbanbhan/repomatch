import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { detectInterests } from "@/lib/github/detectInterests";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("username, topics, languages, skill_level")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const hasExistingInterests = profile.topics.length > 0;
  const suggestions = hasExistingInterests
    ? { languages: profile.languages, topics: profile.topics }
    : await detectInterests(profile.username);

  return (
    <main>
      <h1>{hasExistingInterests ? "Edit your interests" : "Set up your interests"}</h1>
      <OnboardingWizard
        suggestedLanguages={suggestions.languages}
        suggestedTopics={suggestions.topics}
        initialSkillLevel={profile.skill_level}
      />
    </main>
  );
}
