# RepoMatch

**Personalized open-source repo discovery, delivered as a live SVG widget inside your GitHub profile README.**

[![CI](https://github.com/amarjaleelbanbhan/repomatch/actions/workflows/ci.yml/badge.svg)](https://github.com/amarjaleelbanbhan/repomatch/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![$0 infra](https://img.shields.io/badge/infra%20cost-%240%2Fmonth-brightgreen)](PROJECT_PLAN.md#2-free-resource-inventory-use-all-of-these)

---

## What is RepoMatch?

GitHub hosts 400M+ repositories, but discovery is broken for newcomers. You don't know what
to search for, good projects with weak READMEs stay invisible, and it's hard to tell which
repos are active and welcoming to a first-time contributor.

RepoMatch solves this with one embed. Add a widget to your GitHub profile README and it shows,
**live**:

- Your own open-source activity — contribution streak, total contributions, top languages, stars
  across your repos
- One personalized "next repo to try" recommendation, matched to your languages, topics, and
  starred repos

Every profile that embeds the widget is also a discovery surface for whoever views that profile —
the widget's own visitors are the platform's growth loop.

## Demo

Embed one line of markdown in your `README.md`:

```md
[![RepoMatch](https://repomatch-widget-kappa.vercel.app/api/widget/YOUR_USERNAME.svg)](https://repomatch-web.vercel.app/u/YOUR_USERNAME)
```

Live example (renders a "not set up yet" fallback until you've signed in at least once):

[![RepoMatch](https://repomatch-widget-kappa.vercel.app/api/widget/octocat.svg)](https://repomatch-web.vercel.app)

Query parameters:

| Param | Values | Default | Effect |
|---|---|---|---|
| `theme` | `dark`, `light`, `transparent` | `dark` | Card color scheme |
| `count` | `1`–`5` | `1` | Number of "next repo to try" cards shown below your activity stats |

## How it works

The widget-serving path never calls the GitHub API directly — all GitHub data acquisition happens
in a nightly batch job, and the widget only ever reads pre-computed data. This is the same lesson
`github-readme-stats` learned the hard way: live API calls in the request path get you rate-limited
into oblivion.

```
GitHub Profile README
   └── ![widget](.../api/widget/{username}.svg)
            │
            ▼
   Vercel Function (SVG render, reads cache/DB only)
            │  cache miss ↓
   Supabase Postgres (users, repos, recommendations — pre-computed)
            ▲
   GitHub Actions nightly cron
            ├── index candidate repos (GraphQL, batched, health-scored)
            ├── compute each user's contribution stats
            ├── run the matcher (packages/matcher, pure TS)
            └── write top recommendations per user
```

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for the full architecture and phased build plan, and
[SRS.md](SRS.md) for the requirements every feature is built against (cited as `FR-x.x` /
`NFR-x` throughout the codebase).

## Tech stack

Every piece is chosen to keep infrastructure cost at **$0**, running entirely on free tiers:

| Layer | Tech | Free tier |
|---|---|---|
| Web app | Next.js on Vercel | 100 GB bandwidth/mo |
| Widget endpoint | Vercel Functions | included |
| Auth | Supabase Auth (GitHub OAuth, read-only scopes) | 50k MAU |
| Database | Supabase Postgres + pgvector | 500 MB DB, 5 GB egress |
| Cache | Upstash Redis | 500k commands/mo |
| Batch compute | GitHub Actions (nightly cron) | unlimited on public repos |
| Data source | GitHub GraphQL API | 5,000 points/hr |
| Language | TypeScript (strict) everywhere | — |

## Project structure

```
apps/
  web/       Next.js app — auth, onboarding, dashboard, public match pages
  widget/    Vercel Functions — GET /api/widget/{username}.svg
packages/
  matcher/   Pure-function scoring engine (unit tested, no I/O)
supabase/
  migrations/  Schema history — the only way schema changes happen
.github/
  workflows/   CI + nightly indexing/matching cron
```

## Getting started (local development)

```bash
git clone https://github.com/amarjaleelbanbhan/repomatch.git
cd repomatch
pnpm install
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in your own Supabase project's
URL and anon key:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```bash
pnpm dev         # runs apps/web on localhost:3000
pnpm typecheck   # strict TS across the whole monorepo
pnpm test        # matcher + widget unit tests (vitest)
```

Schema changes are only ever made via `supabase/migrations/*.sql` — never edit the database by
hand.

## Roadmap

RepoMatch ships in phases, each ending with a real deploy. See:

- [PROJECT_PLAN.md](PROJECT_PLAN.md) — phase-by-phase architecture and scope
- [ROADMAP_6MONTH.md](ROADMAP_6MONTH.md) — the 6-month, AI-speed timeline
- [SRS.md](SRS.md) — the requirements (FR/NFR) everything is built against
- [PROGRESS.md](PROGRESS.md) — living checklist of what's shipped vs. remaining

Currently shipping: **Phase 1 — MVP Widget** (OSS Activity Card + nightly indexer + matcher v1).

## Contributing

RepoMatch is open source by design — a public repo gets unlimited GitHub Actions minutes, and
that's the entire batch-compute budget this project runs on. Issues labeled `good first issue`
are a welcoming place to start. Pull requests should keep `pnpm typecheck` and `pnpm test` green.

## License

[MIT](LICENSE)
