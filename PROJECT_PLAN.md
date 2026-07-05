# RepoMatch — Full Development Plan
> Reference doc for Claude Code. Har phase = shippable product + 1 new core feature.
> Working name: **RepoMatch** (change anytime).

---

## 1. Product Summary

**One-liner:** Personalized open-source repo suggestions rendered as a live SVG widget inside GitHub profile READMEs, powered by a matching engine ("Tinder for repos" — but widget-first, swipe later).

**Core loop (growth engine):**
User adds widget → profile visitors see suggestions → click → land on our site → sign up → add widget → repeat.

**Non-goals (rejected, do not build early):**
- Swipe UI as core product (Phase 4 novelty only)
- Following-based feed at launch (needs network effect, Phase 3+)
- Paid features (free-first, always)

---

## 2. Free Resource Inventory (use ALL of these)

| Resource | Free Tier | Used For |
|---|---|---|
| **Vercel Hobby** | 100GB bandwidth/mo, serverless functions, 1M edge requests | SVG widget endpoint, landing page, dashboard |
| **Supabase Free** | 500MB DB, 50k MAU auth, 5GB egress, 2 projects | Postgres, GitHub OAuth, cached recommendations |
| **GitHub Actions** | 2,000 min/mo (public repo = UNLIMITED) | Nightly recommendation pre-compute, repo indexing cron |
| **GitHub API** | 5k req/hr (authenticated) | Repo/user data source |
| **GitHub GraphQL API** | 5k points/hr | Batch queries (10x more efficient than REST) |
| **Upstash Redis Free** | 500k commands/mo | Hot cache for widget SVGs (avoid Supabase egress burn) |
| **Cloudflare Pages/Workers Free** | 100k req/day | Backup/CDN layer if Vercel bandwidth tight |
| **Hugging Face Inference (free)** | Rate-limited | Embeddings for semantic matching (Phase 2) |
| **Supabase pgvector** | Included in free tier | Store embeddings, similarity search — NO paid vector DB needed |
| **shields.io pattern** | n/a | SVG design reference |
| **Gorse (self-host later)** | Open source | Optional recommender engine (Phase 3, only if scoring outgrows SQL) |

**Golden rule:** Public repo = unlimited Actions minutes. Keep the project open source — free compute + contributors + credibility.

---

## 3. Architecture (all phases)

```
GitHub Profile README
   └── ![widget](repomatch.vercel.app/api/widget/{username}.svg)
            │
            ▼
   Vercel Edge Function (SVG render, <50ms)
            │  reads cache only, NEVER calls GitHub API live
            ▼
   Upstash Redis (hot SVG cache, 24h TTL)
            │ miss ↓
   Supabase Postgres (recommendations table, pre-computed)
            ▲
   GitHub Actions nightly cron
            │
            ├── fetch user profiles (GraphQL, batched)
            ├── fetch/refresh repo index (active repos only)
            ├── run matching score
            └── write top-N recs per user → Supabase
```

**Why this design:** Widget requests NEVER touch GitHub API → rate limits can't kill us (github-readme-stats' biggest failure). All heavy compute on GitHub's free Actions runners.

---

## 4. Phases

Weightage = % of total product value. Build in order. Each phase ends with a ship.

---

### PHASE 0 — Foundation & Validation (Weight: 5%) — Week 1

**Goal:** Working skeleton + 10 real user interviews.

Claude Code tasks:
1. Init monorepo: `apps/web` (Next.js on Vercel), `apps/widget` (edge functions), `packages/matcher` (scoring logic), `.github/workflows/`
2. Supabase project: schema migration v1
   - `users` (github_id, username, languages[], topics[], created_at)
   - `repos` (github_id, full_name, description, languages[], topics[], stars, last_commit_at, health_score)
   - `recommendations` (user_id, repo_id, score, reason, computed_at)
3. GitHub OAuth via Supabase Auth
4. Deploy "hello world" SVG endpoint on Vercel: `/api/widget/{username}.svg` returns static styled card

Human tasks (not Claude Code):
- Interview 10 students: "open source contribute karne mein kahan atke?" → notes in `docs/research.md`

**Exit criteria:** OAuth works, static SVG renders in a real README.

---

### PHASE 1 — MVP Widget: Core Value (Weight: 40%) — Weeks 2–4

**New feature: OSS Activity Card — installer's own stats first, recommendation secondary.**

> Pivot (2026-07-06): the original widget was other-facing (visitor benefit, not installer benefit) —
> weak install incentive, cold-start problem. The widget now leads with the installer's own
> contribution stats so it has value on day 1, independent of match quality. See SRS FR-4.8–4.11, NFR-12.

Claude Code tasks:
1. **Repo indexer** (GitHub Action, nightly):
   - GraphQL batch fetch: repos matching user languages/topics, filters: pushed within 30 days, >10 stars, has open issues, not archived
   - Health score (borrow ReadmeCodeGen logic): recency 40% + open issues 25% + stars/forks 20% + not-archived 15%
   - Same batch call also computes each user's contribution streak, total contributions, top languages, and total stars across owned repos (no extra rate-limit cost) — written to `users.contribution_streak` / `total_contributions` / `last_active_at`
2. **Matcher v1** (`packages/matcher`, pure SQL/TS — no ML yet):
   - Score = language overlap (40%) + topic overlap (30%) + starred-repo similarity (20%) + health (10%)
   - Top 1 repo surfaced in the widget as "Next repo to try" (dashboard still shows the full top-N list), exclude already-starred/owned
3. **SVG widget v1 — OSS Activity Card:**
   - Primary content: contribution streak, total contributions, top languages, total stars across owned repos
   - Secondary content: 1 recommended repo card, name, 1-line desc, language dot, stars, "why matched" tag (e.g., `matched: python + ml`), labeled "Next repo to try"
   - Must render the activity card even when the matcher returns zero recommendations (graceful degradation, FR-4.11)
   - Themes: dark/light/transparent (URL param)
   - Whole widget = 1 link → user's page on our site (SVG camo limitation)
4. **Onboarding flow (web):**
   - Login → pick 3–5 interests (chips UI) → skill level → copy-paste markdown snippet
   - Auto-detect languages from their repos, pre-fill
   - Copy: "show your OSS activity + get your next repo" (not "get repo recommendations") — value is front-loaded, stats render immediately post-OAuth, before the matcher even runs
5. **Caching:**
   - Upstash: SVG string, key `widget:{username}`, TTL 24h
   - Nightly Action busts + regenerates for all users
6. **Landing page:** demo widget, 3-step setup, open-source badge

**Exit criteria:** stats card renders correctly for 50 users; recs directionally reasonable (lower bar than before — activity stats carry the widget's value even while match quality is still maturing).

**Distribution note (human task, not Claude Code):** don't rely solely on README virality for the first cohort. Seed via student communities/hackathons to reach the first 50–200 users manually.

---

### PHASE 2 — Smart Matching + Dashboard (Weight: 25%) — Weeks 5–7

**New feature: semantic matching + user feedback loop.**

Claude Code tasks:
1. **Embeddings upgrade:**
   - Enable pgvector on Supabase
   - Hugging Face free inference (`all-MiniLM-L6-v2`) → embed repo descriptions + READMEs (first 500 words) + user interest text
   - Matcher v2: cosine similarity (35%) replaces raw topic overlap; keep language + health weights
   - Run in GitHub Actions (free compute), store vectors in Supabase
2. **Feedback loop (critical for quality):**
   - On user's match page: 👍 / 👎 / "already know it" per repo
   - Feedback table → matcher penalizes/boosts similar repos next cycle
3. **Web dashboard:**
   - Full match list (10–20 repos, not just widget's 3)
   - Filters: language, difficulty (good-first-issue count), activity
   - Per-repo detail: health breakdown, first-issue suggestions, CONTRIBUTING.md detected badge
4. **Simple-English/Urdu repo summaries:**
   - Nightly Action: for indexed repos with bad READMEs, generate 2-line plain summary (batch, cached forever, regenerate only on major repo change)
   - Differentiator for non-native-English students
5. **Widget v2:** refresh param, more themes, `?count=1..5`

**Exit criteria:** 👍 rate >60% on recommendations; 200 users.

---

### PHASE 3 — Social Layer (Weight: 20%) — Weeks 8–10

**New feature: discovery through people (following-based).**
(Only start if 500+ users; otherwise extend Phase 2 growth.)

Claude Code tasks:
1. **"People like you" matching:**
   - User-user similarity via existing embeddings + shared stars
   - "Developers with your interests also contribute to X"
2. **Follow graph integration:**
   - Fetch user's GitHub following (nightly) → surface "repos your network contributes to"
3. **Project owners side (two-sided market begins):**
   - Repo owners claim their repo → add plain-language pitch + "help wanted" areas
   - Claimed repos get boost in matching + "actively welcoming" badge in widget
4. **Contributor widget variant:** `?type=mywork` — shows repos user contributes to + invites others ("looking for contributors in: X")
5. **Optional Gorse migration:** only if SQL matcher slow at scale; deploy on free Fly.io/Railway trial or keep Actions-based

**Exit criteria:** 20+ claimed repos, first "I found my project here" testimonial.

---

### PHASE 4 — Swipe + Community (Weight: 10%) — Weeks 11+

**New feature: the Tinder mode (engagement layer, not identity).**

Claude Code tasks:
1. **Swipe UI (mobile-first web):** right = save + train matcher, left = hide + train. Every swipe = feedback data → matching improves (this is why swipe exists — data collection disguised as fun)
2. **Match streaks/gamification:** "5 repos explored this week" — lightweight, no dark patterns
3. **Weekly digest email (Supabase edge function + free Resend tier 3k emails/mo):** top 3 new matches
4. **Community:** GOOD FIRST ISSUES from matched repos surfaced directly; Urdu/regional-language onboarding guides (community-contributed, this is the open-source contribution entry point for your own users)

**Exit criteria:** organic growth without you pushing.

---

## 5. Free-Tier Budget Guards (build these IN, not later)

| Risk | Guard |
|---|---|
| Vercel 100GB bandwidth | SVG <15KB, aggressive `Cache-Control: max-age=86400`, GitHub camo caches too |
| Supabase 5GB egress | Widget reads from Upstash, NOT Supabase; Supabase only for auth + dashboard + writes |
| GitHub API 5k/hr | ALL fetching in nightly Actions with GraphQL batching + etag caching; live requests = 0 |
| Supabase 500MB DB | Index only ~5–10k quality repos (curated, not all of GitHub); prune repos inactive >90 days |
| HF inference limits | Embed once, cache forever; batch nightly with backoff |
| Actions 2k min | Public repo = unlimited. Keep it public. |

---

## 6. Claude Code Working Instructions

- Monorepo, TypeScript everywhere, pnpm
- Every phase = separate milestone branch, PR to main, Vercel preview deploy
- Write tests for matcher scoring (pure functions, easy to test)
- Schema changes ONLY via Supabase migrations (`supabase/migrations/`)
- Secrets: `GITHUB_PAT`, `SUPABASE_SERVICE_KEY`, `UPSTASH_URL/TOKEN` in Vercel env + Actions secrets
- Every feature lands with docs in `docs/` — the project itself must be contribution-friendly (dogfooding: good README, CONTRIBUTING.md, labeled good-first-issues from day 1)

## 7. Success Metrics per Phase

| Phase | Metric |
|---|---|
| 0 | OAuth + static widget live |
| 1 | 50 activity-card widgets live, stats verified, recs directionally reasonable |
| 2 | 👍 >60%, 200 users |
| 3 | 500 users, 20 claimed repos |
| 4 | Week-over-week organic signup growth |
