import { createClient } from "@supabase/supabase-js";
import { getThemeColors, resolveTheme } from "../../lib/theme.js";
import { renderSetupCardSvg, renderWidgetSvg, type RepoCard } from "../../lib/svg.js";

export const config = { runtime: "edge" };

function parseCount(value: string | null): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) return 3;
  return n;
}

async function fetchTopMatches(username: string, count: number): Promise<RepoCard[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  // FR-4.5: this reads pre-computed Supabase data only; the GitHub API is never called on this path.
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!user) return [];

  const { data: recs } = await supabase
    .from("recommendations")
    .select("reason, rank, repos(full_name, languages, stars)")
    .eq("user_id", user.id)
    .order("cycle_ts", { ascending: false })
    .order("rank", { ascending: true })
    .limit(count);

  if (!recs || recs.length === 0) return [];

  return recs
    .map((rec): RepoCard | null => {
      const repo = Array.isArray(rec.repos) ? rec.repos[0] : rec.repos;
      if (!repo) return null;
      return {
        fullName: repo.full_name,
        description: "",
        primaryLanguage: repo.languages?.[0] ?? "",
        stars: repo.stars ?? 0,
        reason: rec.reason,
      };
    })
    .filter((card): card is RepoCard => card !== null);
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const username = url.pathname.split("/").pop()?.replace(/\.svg$/, "") ?? "";
  const count = parseCount(url.searchParams.get("count"));
  const theme = resolveTheme(url.searchParams.get("theme"));
  const colors = getThemeColors(theme);

  const cards = await fetchTopMatches(username, count);
  const svg = cards.length > 0 ? renderWidgetSvg(cards, colors) : renderSetupCardSvg(username, colors);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
