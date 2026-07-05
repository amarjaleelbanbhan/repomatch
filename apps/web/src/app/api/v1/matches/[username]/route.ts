import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * FR-7.2: public REST API for a user's current matches.
 * NOTE: per-key rate limiting isn't implemented yet — that needs an API-key issuance system
 * (AG-4 gate) and a request-counting store (Upstash), neither of which exist yet. This endpoint
 * is unauthenticated and rate-limited only by Vercel's platform-level protections.
 */
export async function GET(request: Request, { params }: { params: { username: string } }) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: user } = await admin
    .from("users")
    .select("id, username, contribution_streak, total_contributions, owned_stars, skill_level")
    .eq("username", params.username)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: latestCycle } = await admin
    .from("recommendations")
    .select("cycle_ts")
    .eq("user_id", user.id)
    .order("cycle_ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  let matches: {
    rank: number;
    score: number;
    reason: string;
    repo: { full_name: string; description: string | null; languages: string[]; stars: number } | null;
  }[] = [];

  if (latestCycle) {
    const { data } = await admin
      .from("recommendations")
      .select("rank, score, reason, repos(full_name, description, languages, stars)")
      .eq("user_id", user.id)
      .eq("cycle_ts", latestCycle.cycle_ts)
      .order("rank", { ascending: true });

    matches = (data ?? []).map((rec) => ({
      rank: rec.rank,
      score: rec.score,
      reason: rec.reason,
      repo: Array.isArray(rec.repos) ? (rec.repos[0] ?? null) : rec.repos,
    }));
  }

  return NextResponse.json(
    {
      username: user.username,
      activity: {
        contributionStreak: user.contribution_streak,
        totalContributions: user.total_contributions,
        ownedStars: user.owned_stars,
      },
      skillLevel: user.skill_level,
      cycleTs: latestCycle?.cycle_ts ?? null,
      matches,
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
