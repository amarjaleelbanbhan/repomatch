# Software Requirements Specification
## RepoMatch — Personalized Open-Source Repository Discovery Platform

**Version:** 1.0 | **Date:** 2026-07-05 | **Status:** Draft for Development
**Standard:** IEEE 830-1998 (adapted)

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the functional and non-functional requirements of RepoMatch, a platform that delivers personalized open-source repository recommendations to developers via an embeddable GitHub profile README widget and a companion web application. It is the authoritative reference for development (Claude Code), testing, and acceptance.

### 1.2 Problem Statement
GitHub hosts 400M+ repositories, yet discovery is broken for newcomers:
- **P1:** Students and junior developers cannot find repositories matching their skills and interests; GitHub search requires knowing what to search for.
- **P2:** Many valuable repositories have poor READMEs/descriptions, making them undiscoverable and hard to evaluate.
- **P3:** Newcomers cannot identify which repositories are active, welcoming, and appropriate for a first contribution.
- **P4:** AI assistants answer questions but do not connect users to communities; discovery and belonging remain unsolved.
- **P5:** Non-native English speakers worldwide (e.g., Urdu, Hindi, Chinese, Arabic, Spanish speakers) face an additional language barrier in evaluating projects.

### 1.3 Product Vision
A self-reinforcing discovery network: every user's profile README displays live, personalized repository suggestions; every widget viewed is an acquisition channel; every interaction (click, vote, swipe) improves matching quality for all users.

### 1.4 Scope
**In scope:** GitHub OAuth onboarding; interest/skill profiling; repository indexing and health scoring; matching engine (heuristic → semantic → learned ranker); dynamic SVG widget; web dashboard; feedback capture; maintainer repo claiming; social discovery; localized summaries (English/Urdu); public API.
**Out of scope (v1):** paid features, ads, GitLab/Codeberg support, native mobile apps, code hosting, in-platform messaging.

### 1.5 Definitions
| Term | Definition |
|---|---|
| Widget | Server-rendered SVG image embedded in a GitHub README via markdown |
| Match | A (user, repo, score, reason) tuple produced by the matching engine |
| Health score | 0–100 composite of repo activity, issues, popularity, status |
| Claimed repo | Repository whose maintainer has verified ownership on the platform |
| Indexed repo | Repository stored in the platform corpus and eligible for matching |
| Cycle | One nightly batch computation run |

### 1.6 References
PROJECT_PLAN.md (phased build plan); ROADMAP_6MONTH.md (AI-speed schedule); GitHub REST/GraphQL API docs; Supabase, Vercel, Upstash documentation.

---

## 2. Overall Description

### 2.1 Product Perspective
New, self-contained system depending on external services: GitHub (data source + OAuth identity), Vercel (edge rendering/hosting), Supabase (Postgres, Auth, pgvector), Upstash Redis (cache), GitHub Actions (batch compute), Hugging Face Inference (embeddings), Resend (email).

**Architectural constraint (governs all requirements):** widget-serving requests SHALL NOT invoke the GitHub API synchronously. All GitHub data acquisition occurs in scheduled batch jobs; the serving path reads pre-computed data only.

### 2.2 User Classes
| Class | Characteristics | Priority |
|---|---|---|
| U1 Newcomer | Student/junior dev, ≤2 yrs experience, may be non-native English speaker, unfamiliar with OSS norms | Primary |
| U2 Active developer | Uses profile README for personal branding; wants relevant discovery | Primary |
| U3 Maintainer | Owns repo(s); seeks contributors | Secondary |
| U4 Visitor | Views a user's profile; not registered | Acquisition channel |
| U5 API consumer | Developer integrating match data | Tertiary |

### 2.3 Operating Environment
- Widget: rendered by GitHub's Camo image proxy; static SVG only (no scripts/animation/foreignObject); one hyperlink per image.
- Web app: evergreen browsers, mobile-first responsive.
- Backend: Vercel serverless/edge (Node/TS), Supabase Postgres 15+, GitHub Actions runners (Ubuntu).

### 2.4 Constraints
| ID | Constraint |
|---|---|
| C1 | Total infrastructure cost = $0 (free tiers only) |
| C2 | GitHub API: 5,000 req/hr (OAuth) / GraphQL 5,000 points/hr; later 15,000/hr per GitHub App installation |
| C3 | Vercel Hobby: 100 GB bandwidth/month |
| C4 | Supabase Free: 500 MB database, 5 GB egress/month, 50k MAU |
| C5 | Upstash Free: 500k commands/month |
| C6 | SVG payload ≤ 15 KB per widget |
| C7 | Codebase public (open source) — mandatory for unlimited Actions minutes and community trust |
| C8 | GDPR-aligned handling of user data; only public GitHub data + explicit inputs stored |

### 2.5 Assumptions & Dependencies
- A1: GitHub continues to render external images in READMEs via Camo.
- A2: Free tiers listed in C1–C5 remain materially available; mitigation paths documented in §6.
- A3: Users grant read-only OAuth scopes (public profile, stars, following).

---

## 3. Functional Requirements

Priority: **M** = Must (MVP), **S** = Should (post-MVP), **C** = Could (later).

### FR-1 Authentication & Onboarding
| ID | Requirement | Pri |
|---|---|---|
| FR-1.1 | System shall authenticate users via GitHub OAuth (Supabase Auth), requesting read-only scopes only | M |
| FR-1.2 | On first login, system shall auto-detect user languages and topics from their public repositories and starred repos, and pre-populate the interest profile | M |
| FR-1.3 | User shall select 3–10 interest topics and a self-assessed skill level (beginner/intermediate/advanced) | M |
| FR-1.4 | Onboarding shall complete in ≤3 steps and ≤2 minutes, ending with a copy-ready markdown snippet for the widget | M |
| FR-1.5 | User shall be able to edit interests, skill level, and delete their account (full data erasure ≤30 days) | M |

### FR-2 Repository Indexing
| ID | Requirement | Pri |
|---|---|---|
| FR-2.1 | A scheduled job (nightly) shall index candidate repositories via GitHub GraphQL with batching and ETag caching | M |
| FR-2.2 | Inclusion criteria: pushed within 30 days, ≥10 stars, not archived/disabled/fork, has ≥1 open issue | M |
| FR-2.3 | Each indexed repo shall receive a health score: recency 40% + open issues 25% + stars/forks 20% + repo status 15% | M |
| FR-2.4 | Corpus size shall be capped (5k repos at MVP, 50k by Month 3); repos inactive >90 days shall be pruned | M |
| FR-2.5 | System shall detect CONTRIBUTING.md, code of conduct, and good-first-issue count per repo | S |
| FR-2.6 | For repos with inadequate descriptions, system shall generate and cache a 2-line plain-language summary; localized summary variants shall be supported (Roman Urdu first, then Chinese, Arabic, Hindi, Spanish per demand) | S |

### FR-3 Matching Engine
| ID | Requirement | Pri |
|---|---|---|
| FR-3.1 | v1 (heuristic): score = language overlap 40% + topic overlap 30% + starred-repo similarity 20% + health 10% | M |
| FR-3.2 | Matches shall exclude repos the user owns, has starred, or has hidden | M |
| FR-3.3 | Every match shall carry a human-readable reason string (e.g., "matched: python + ml") | M |
| FR-3.4 | Top-N (N≥10) matches per user shall be pre-computed each cycle and persisted | M |
| FR-3.5 | v2 (semantic): repo descriptions/READMEs and user interests shall be embedded (sentence-transformer class model); cosine similarity shall replace raw topic overlap at 35% weight, via pgvector | S |
| FR-3.6 | v3 (learned): a ranker trained on accumulated feedback (votes/swipes) shall re-rank candidates; ranker versions shall be A/B assignable per user | C |
| FR-3.7 | Matching shall be skill-aware: beginner users shall be biased toward repos with good-first-issues and CONTRIBUTING.md | S |

### FR-4 Widget (SVG)
| ID | Requirement | Pri |
|---|---|---|
| FR-4.1 | Endpoint `GET /api/widget/{username}.svg` shall return the user's current top matches (default 1, param `count` 1–5) as a styled SVG card set, rendered below the OSS Activity Card per FR-4.8 | M |
| FR-4.2 | Each card shall display: repo name, one-line description, primary language indicator, star count, match reason | M |
| FR-4.3 | Themes: dark, light, transparent, selectable via URL parameter | M |
| FR-4.4 | The widget shall link to the user's public match page on the platform (single-link constraint per §2.3) | M |
| FR-4.5 | Serving path: Upstash cache (24h TTL) → Supabase fallback → generic "setup" card for unknown users; GitHub API shall never be called in this path | M |
| FR-4.6 | Response: `Cache-Control: max-age=86400`, payload ≤15 KB, p95 latency ≤300 ms cache-hit | M |
| FR-4.7 | Additional widget variant `type=mywork` (user's projects + "contributors wanted") | S |
| FR-4.8 | The widget's primary content shall be an OSS Activity Card showing the installer's own contribution streak, total contributions, top languages used, and total stars across owned repos | M |
| FR-4.9 | The widget shall render exactly 1 recommended repo as secondary content beneath the activity card, labeled "Next repo to try" | M |
| FR-4.10 | Activity Card stats shall be computed nightly via the same GitHub GraphQL batch job used for repo indexing (no additional live API calls) and cached with 24h TTL alongside recommendation data | M |
| FR-4.11 | The widget shall render the Activity Card even when the recommendation engine returns zero matches for the user (graceful degradation — activity stats must never depend on matcher success) | M |

### FR-5 Web Dashboard
| ID | Requirement | Pri |
|---|---|---|
| FR-5.1 | Authenticated dashboard shall list ≥10 matches with filters: language, activity, difficulty (good-first-issue presence) | M |
| FR-5.2 | Repo detail view: health breakdown, welcome signals (CONTRIBUTING/CoC badges), suggested first issues | S |
| FR-5.3 | Feedback controls per match: 👍, 👎, "already know it", hide | M |
| FR-5.4 | Feedback shall influence the next matching cycle (boost/penalize similar repos) | M |
| FR-5.5 | Public match page per user (target of widget link), viewable without login, with sign-up CTA | M |
| FR-5.6 | Swipe interface (mobile-first): right=save+positive signal, left=hide+negative signal | S |

### FR-6 Social & Maintainer Features
| ID | Requirement | Pri |
|---|---|---|
| FR-6.1 | "Developers like you" recommendations via user-user similarity (shared stars/embeddings) | S |
| FR-6.2 | Following-graph discovery: surface repos the user's GitHub network contributes to | S |
| FR-6.3 | Maintainers shall claim repos via ownership verification (OAuth admin check); claimed repos gain a pitch field, "help wanted" areas, and a welcoming badge | S |
| FR-6.4 | Maintainer dashboard: match impressions, click-throughs, contributor funnel | C |
| FR-6.5 | Contributor passport: public page of contributions attributed to platform-originated discovery | C |

### FR-7 Notifications & API
| ID | Requirement | Pri |
|---|---|---|
| FR-7.1 | Opt-in weekly digest email with top new matches (≤3k emails/mo tier) | S |
| FR-7.2 | Public REST API `GET /api/v1/matches/{username}` with per-key rate limiting | C |
| FR-7.3 | Localized UI via i18n framework (English + Urdu at launch; architecture shall support adding any language, e.g., Chinese, Arabic, Hindi, Spanish) | S |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Widget p95 ≤300 ms (cache hit), ≤1.5 s (cache miss); dashboard TTI ≤3 s on 3G-class connection |
| NFR-2 | Availability | Widget path 99.5% monthly; degradation shall render last-cached or fallback SVG, never a broken image |
| NFR-3 | Scalability | Architecture shall sustain 10k users / 50k repos within constraints C1–C6 without redesign |
| NFR-4 | Cost | Zero-spend guardrails: bandwidth, egress, and command budgets monitored; alerts at 70% of any free-tier limit |
| NFR-5 | Security | Read-only OAuth scopes; secrets in platform vaults only; RLS enabled on all Supabase tables; no tokens in client code |
| NFR-6 | Privacy | Store only public GitHub data + explicit user inputs; account deletion erases all rows ≤30 days; no tracking pixels |
| NFR-7 | Quality gate | Recommendation 👍 rate ≥60% rolling 14-day; below 55% triggers feature freeze (process requirement) |
| NFR-8 | Maintainability | TypeScript strict; matcher as pure functions with unit tests ≥80% coverage; schema changes via migrations only |
| NFR-9 | Accessibility | Web app WCAG 2.1 AA; widget text contrast ≥4.5:1 in all themes |
| NFR-10 | Localization | All user-facing strings externalized; RTL-safe layout (Urdu, Arabic); CJK-safe rendering (Chinese) |
| NFR-11 | Observability | Structured logs; nightly-job success/failure alerting; public status of last cycle timestamp |
| NFR-12 | Cold-start resilience | Widget value must be visible to the installer without requiring recommendation quality (activity stats decouple install incentive from matcher accuracy) |

---

## 5. Data Requirements

### 5.1 Logical Model (principal entities)
- **users**(id, github_id, username, languages[], topics[], skill_level, locale, contribution_streak, total_contributions, last_active_at, created_at)
- **repos**(id, github_id, full_name, description, summary_en, summary_ur, languages[], topics[], stars, forks, open_issues, gfi_count, has_contributing, health_score, embedding vector, last_commit_at, indexed_at)
- **recommendations**(user_id, repo_id, score, reason, rank, cycle_ts) — unique(user_id, repo_id, cycle_ts)
- **feedback**(user_id, repo_id, signal ∈ {up, down, known, hide, swipe_r, swipe_l}, ts)
- **claims**(repo_id, maintainer_user_id, pitch, help_wanted[], verified_at)

### 5.2 Retention
Feedback retained indefinitely (model training asset). Recommendations retained 2 cycles. Pruned repos soft-deleted 30 days, then purged.

---

## 6. Risk Register & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| GitHub API throttling | Stale index | Batch GraphQL + ETags; GitHub App migration (C2); degrade to longer cycles |
| Free-tier withdrawal/limit cut | Service outage | NFR-4 alerts; Cloudflare Workers/D1 as documented fallback; SVG smallness keeps bandwidth low |
| Poor match quality at cold start | User churn, reputation | Manual review of first 50 users (acceptance gate AG-2); reason strings for transparency; NFR-7 |
| Widget abuse (hotlink spam of endpoint) | Bandwidth burn | Per-username cache keys; unknown-user fallback is a tiny static SVG; optional allowlist mode |
| Camo/SVG policy change by GitHub (A1) | Widget breaks | GitHub-Action variant: pre-render SVG committed into user's own repo (zero external serving) |
| Single-maintainer bus factor | Project stall | C7 open source; docs-first rule; contributor onboarding from Month 2 |

---

## 7. Acceptance Criteria (release gates)

| Gate | Criteria |
|---|---|
| AG-1 MVP | OAuth→onboarding→widget live in a real README end-to-end; FR-1–FR-4 (M) pass; NFR-1/2/5 verified |
| AG-2 Quality | 50 users onboarded; 100% of their match sets manually reviewed as relevant; 👍 instrumentation live |
| AG-3 Growth-ready | FR-5 complete; feedback loop demonstrably alters next-cycle output; free-tier telemetry green at projected 1k users |
| AG-4 Ecosystem | FR-6.1–6.3 live; ≥20 claimed repos; API keys issuable |

---

## 8. Appendix A — Traceability
P1 → FR-1.2/1.3, FR-3.*, FR-4.* | P2 → FR-2.6, FR-6.3 | P3 → FR-2.3/2.5, FR-3.7, FR-5.2 | P4 → FR-5.6, FR-6.*, community features | P5 → FR-2.6, FR-7.3, NFR-10.

*End of SRS v1.0*
