# RepoMatch — 6-Month Roadmap (AI-Speed Edition)
> Assumption: Claude Code builds features in days, not weeks. Code is cheap.
> Bottleneck shifts: NOT development → USERS, DATA, QUALITY, DISTRIBUTION.
> Rule: build fast, but never ship faster than you can validate.

## Core Insight
Old world: 6 months = build 1 product.
AI world: 6 months = build product (Month 1) + iterate on real usage (Months 2–6).
Code = 20% of effort. Users + feedback + distribution = 80%.

---

## MONTH 1 — Ship Everything Core (old Phases 0–2 compressed)

**Week 1:** Monorepo, Supabase schema, OAuth, static SVG live in a real README.
**Week 2:** Repo indexer (GitHub Actions + GraphQL), matcher v1 (language/topic/health scoring), widget v1 with 3 recs, onboarding flow, Upstash caching, landing page. SHIP.
**Week 3:** pgvector + HF embeddings, semantic matcher v2, 👍/👎 feedback loop, web dashboard with filters.
**Week 4:** Plain-English/Urdu repo summaries, widget themes/params, SEO explore pages, browser extension MVP. 
**Parallel (human, non-compressible):** 15 user interviews, recruit first 50 users by hand, manual quality check on every recommendation set.

Exit: full product live, 50 quality-verified users.

## MONTH 2 — Data Flywheel + Social (old Phases 3–4)

**Week 1:** Swipe UI (moved UP — it's a feedback-data collector, and data is now the bottleneck, so collect early).
**Week 2:** User-user similarity, "people like you contribute to X", following-graph recs.
**Week 3:** Maintainer side: repo claiming, plain-language pitch, "welcoming" badge, maintainer dashboard v1.
**Week 4:** Weekly digest emails (Resend), contributor widget variant, public API v1.
**Parallel:** 2 university workshops (Karachi first), Discord launch, 10 interviews.

Exit: 500 users, 20 claimed repos, feedback data flowing.

## MONTH 3 — Quality War (slow month BY DESIGN)

Code is done fast; trust is not. This month = make recommendations genuinely great.
- Train ranker on Month 1–2 feedback (logistic regression in Actions).
- A/B matcher versions (Supabase flag per user).
- Kill/fix every recurring 👎 pattern.
- GitHub App migration (15k req/hr per install, webhook real-time indexing).
- Scale index 5k → 50k repos with pruning + HNSW.
- Contributor passport (public proof-of-work page).

Exit: 👍 >65%, 1,500 users. If quality bar missed → Month 4 repeats this. No exceptions.

## MONTH 4 — Distribution Blitz

Product proven → now 100% growth focus. AI-speed applies to content too:
- Ambassador kits for 10 unis (slides/guides generated fast, delivered by humans).
- SEO scale-out: thousands of generated explore/compare pages.
- "Built on $0" blog + HN/dev.to/Product Hunt launch.
- Hacktoberfest-style event: "First PR Week" with partner repos.
- GitLab support (widens market, mostly config work).
- Mobile app (Expo) — feasible now because code is cheap; ship if Discord asks for it.

Exit: 5,000 users, 3 launch spikes survived (infra guards hold).

## MONTH 5 — Ecosystem Lock-In

- Mentor matching full version (newcomer ↔ experienced, per repo).
- Classroom mode: instructor creates cohort, tracks students' first PRs (unis = recurring user pipeline).
- Hackathon team-matching mode.
- LLM chat search: "describe what you want to build" → matched repos (HF free/user's key).
- Embeddable widgets for org sites ("our repos welcome contributors").

Exit: 3 unis using classroom mode, 200 merged PRs traced to platform.

## MONTH 6 — Sustainability + Moat

- Sponsors/Open Collective, transparent infra costs, supporter badge.
- Community governance: top contributors get triage rights (project itself = best example of open source onboarding).
- Ranker v2 on 5 months of swipe data — this dataset is now the moat; no competitor has it.
- Write public dataset/paper-style report on "what makes students contribute" → credibility + press.
- Decide: keep indie / apply GitHub Accelerator / grants (GitHub Fund, OSS grants).

Exit: 10k+ users, income ≥ infra ($0), self-sustaining community.

---

## What AI-Speed Does NOT Compress (plan around these)
1. User trust — earned weekly, not generated.
2. Feedback data — needs calendar time to accumulate. (Why swipe moved to Month 2.)
3. Community — Discord, workshops, mentors = human pace.
4. GitHub API limits — 5k/hr regardless of how fast you code.
5. Word of mouth — the growth loop needs profile-visitor cycles.

## Standing Rules
- Ship weekly, but every ship behind a quality gate.
- 10+ interviews/month, features from research not imagination.
- 👍 <55% → feature freeze, fix matching.
- Free tier forever; public repo; weekly changelog.
