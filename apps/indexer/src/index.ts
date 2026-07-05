import { createClient } from "@supabase/supabase-js";
import { searchCandidateRepos } from "./searchRepos.js";
import { pruneStaleRepos, upsertRepos } from "./upsertRepos.js";
import { runMatchCycle } from "./matchCycle.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function main() {
  const githubToken = requireEnv("GITHUB_PAT");
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("[indexer] searching candidate repos...");
  const repos = await searchCandidateRepos(githubToken);
  console.log(`[indexer] found ${repos.length} eligible repos`);

  await upsertRepos(supabase, repos);
  await pruneStaleRepos(supabase);
  console.log("[indexer] repo corpus updated");

  console.log("[indexer] running match cycle...");
  await runMatchCycle(supabase, githubToken);
  console.log("[indexer] match cycle complete");
}

main().catch((err) => {
  console.error("[indexer] fatal error:", err);
  process.exitCode = 1;
});
