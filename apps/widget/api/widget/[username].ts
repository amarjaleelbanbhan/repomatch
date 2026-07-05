import { createClient } from "@supabase/supabase-js";
import { getThemeColors, resolveTheme } from "../../lib/theme.js";
import {
  renderActivityCardSvg,
  renderMyWorkSvg,
  renderSetupCardSvg,
  type ActivityStats,
  type MyWorkCard,
  type RepoCard,
} from "../../lib/svg.js";

export const config = { runtime: "edge" };

function parseCount(value: string | null): number {
  const n = Number(value);
  // FR-4.1: default 1 (activity stats are the primary content; this is the secondary "next repo to try" rec)
  if (!Number.isInteger(n) || n < 1 || n > 5) return 1;
  return n;
}

interface WidgetData {
  stats: ActivityStats;
  nextRepos: RepoCard[];
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // FR-4.5: this reads pre-computed Supabase data only; the GitHub API is never called on this path.
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchWidgetData(username: string, count: number): Promise<WidgetData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, contribution_streak, total_contributions, owned_stars, languages")
    .eq("username", username)
    .maybeSingle();

  if (!user) return null;

  const stats: ActivityStats = {
    contributionStreak: user.contribution_streak,
    totalContributions: user.total_contributions,
    ownedStars: user.owned_stars,
    topLanguages: user.languages.slice(0, 3),
  };

  // FR-4.11: activity stats always render; a matcher/data issue only affects the secondary rec list.
  const { data: recs } = await supabase
    .from("recommendations")
    .select("reason, rank, repos(full_name, description, languages, stars)")
    .eq("user_id", user.id)
    .order("cycle_ts", { ascending: false })
    .order("rank", { ascending: true })
    .limit(count);

  const nextRepos: RepoCard[] = (recs ?? [])
    .map((rec): RepoCard | null => {
      const repo = Array.isArray(rec.repos) ? rec.repos[0] : rec.repos;
      if (!repo) return null;
      return {
        fullName: repo.full_name,
        description: repo.description ?? "",
        primaryLanguage: repo.languages?.[0] ?? "",
        stars: repo.stars ?? 0,
        reason: rec.reason,
      };
    })
    .filter((card): card is RepoCard => card !== null);

  return { stats, nextRepos };
}

/** FR-4.7: `?type=mywork` variant — the user's claimed repos, pitched to attract contributors. */
async function fetchMyWork(username: string): Promise<MyWorkCard[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: user } = await supabase.from("users").select("id").eq("username", username).maybeSingle();
  if (!user) return null;

  const { data: claims } = await supabase
    .from("claims")
    .select("pitch, help_wanted, repos(full_name)")
    .eq("maintainer_user_id", user.id);

  return (claims ?? [])
    .map((claim): MyWorkCard | null => {
      const repo = Array.isArray(claim.repos) ? claim.repos[0] : claim.repos;
      if (!repo) return null;
      return { fullName: repo.full_name, pitch: claim.pitch ?? "", helpWanted: claim.help_wanted };
    })
    .filter((card): card is MyWorkCard => card !== null);
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const username = url.pathname.split("/").pop()?.replace(/\.svg$/, "") ?? "";
  const count = parseCount(url.searchParams.get("count"));
  const theme = resolveTheme(url.searchParams.get("theme"));
  const colors = getThemeColors(theme);
  const type = url.searchParams.get("type");

  let svg: string;
  if (type === "mywork") {
    const cards = await fetchMyWork(username);
    svg = cards !== null ? renderMyWorkSvg(cards, username, colors) : renderSetupCardSvg(username, colors);
  } else {
    const data = await fetchWidgetData(username, count);
    svg = data
      ? renderActivityCardSvg(data.stats, data.nextRepos, colors)
      : renderSetupCardSvg(username, colors);
  }

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
