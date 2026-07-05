# RepoMatch — Progress Report

> Living checklist of what's shipped vs. remaining. Cross-references SRS.md (FR/NFR IDs) and
> PROJECT_PLAN.md (phases). Update this file as work lands — don't let it go stale.

**Live:**
- Web app: https://repomatch-web.vercel.app
- Widget: https://repomatch-widget-kappa.vercel.app/api/widget/{username}.svg
- Repo: https://github.com/amarjaleelbanbhan/repomatch

---

## Phase 0 — Foundation & Validation

- [x] Monorepo: `apps/web`, `apps/widget`, `apps/indexer`, `packages/matcher`, `.github/workflows/`
- [x] Supabase schema migration v1 — users, repos, recommendations, feedback, claims (RLS enabled on all tables, SRS §5.1)
- [x] GitHub OAuth via Supabase Auth, read-only `read:user` scope (FR-1.1)
- [x] Widget endpoint deployed: `GET /api/widget/{username}.svg`
- [x] Deployed to Vercel (`repomatch-web`, `repomatch-widget`), git-integration auto-deploy on push to `main`
- [x] CI green (typecheck + test on every push)
- [x] Repo polish: description, topics, MIT license, README

**Exit criteria met:** OAuth works, SVG renders in a real README. ✅

## Pivot — OSS Activity Card (2026-07-06)

- [x] SRS updated: FR-4.8–4.11 (activity card primary content), NFR-12 (cold-start resilience)
- [x] PROJECT_PLAN.md / ROADMAP_6MONTH.md updated to reflect the pivot
- [x] Schema: `users.contribution_streak`, `total_contributions`, `last_active_at`, `owned_stars`
- [x] Widget default rec count changed from 3 → 1

## Phase 1 — MVP Widget: OSS Activity Card

- [x] Nightly repo indexer: GraphQL batch search, health scoring, upsert + prune (FR-2.1–2.4) — **verified live**: first run indexed 567 eligible repos
- [x] User stats + match cycle job: contribution streak/total/owned stars, matcher v1 scoring, writes recommendations (FR-3.1–3.4, FR-4.8–4.10) — **verified live**: real user now shows 6-day streak, 457 contributions, 18 owned stars, 10 recommendations written
- [x] OSS Activity Card widget rendering: streak, contributions, stars, top languages, 1 "next repo to try" card, graceful degradation to zero-state (FR-4.8–4.11) — **verified live** with real (non-zero) data end-to-end
- [x] Onboarding flow: auto-detected interests (FR-1.2), 3-step wizard (FR-1.3–1.4), edit + account deletion (FR-1.5) — **code complete**; `GITHUB_PAT` set on `repomatch-web` Vercel env, live interest-detection not yet manually verified through the actual wizard UI
- [ ] Upstash widget caching (24h TTL, `widget:{username}` key) — **not started**, needs an Upstash account (new signup, not yet requested from user)
- [x] Landing page: live demo widget, 3-step setup, open-source badge

**Secrets wired:** `INDEXER_GITHUB_PAT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (GitHub Actions repo secrets) + `GITHUB_PAT`, `SUPABASE_SERVICE_ROLE_KEY` (repomatch-web Vercel env). Nightly indexer runs on cron `17 3 * * *` UTC and via manual `workflow_dispatch`.

**Exit criteria (not yet met):** stats card renders correctly for 50 users; recs directionally reasonable. Currently verified for 1 real user (the platform's own first signup).

## Phase 2 — Smart Matching + Dashboard — not started

- [ ] pgvector + Hugging Face embeddings, matcher v2 semantic scoring (FR-3.5)
- [ ] 👍/👎/hide feedback loop influencing next cycle (FR-3.6, FR-5.3–5.4)
- [ ] Web dashboard: full match list, filters (FR-5.1–5.2)
- [ ] Public match page per user (FR-5.5)
- [ ] Plain-English/Urdu repo summaries (FR-2.6)

## Phase 3 — Social Layer — not started

- [ ] "Developers like you" via user-user similarity (FR-6.1)
- [ ] Following-graph discovery (FR-6.2)
- [ ] Maintainer repo claiming, welcoming badge (FR-6.3)
- [ ] `?type=mywork` widget variant (FR-4.7)

## Phase 4 — Swipe + Community — not started

- [ ] Swipe UI (FR-5.6)
- [ ] Weekly digest email via Resend (FR-7.1)
- [ ] Public REST API (FR-7.2)

## Human tasks (not Claude Code) — not started

- [ ] User interviews (10+/month per ROADMAP_6MONTH.md)
- [ ] Manual quality review of first 50 users' match sets (AG-2 gate)
- [ ] Community seeding (student groups, hackathons)
