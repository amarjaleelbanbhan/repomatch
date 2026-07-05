-- Initial schema per SRS §5.1
-- Tables: users, repos, recommendations, feedback, claims

create extension if not exists vector;
create extension if not exists pgcrypto;

create type skill_level as enum ('beginner', 'intermediate', 'advanced');
create type feedback_signal as enum ('up', 'down', 'known', 'hide', 'swipe_r', 'swipe_l');

-- users: id mirrors auth.users(id) issued by Supabase Auth (GitHub OAuth, FR-1.1)
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  github_id bigint not null unique,
  username text not null unique,
  languages text[] not null default '{}',
  topics text[] not null default '{}',
  skill_level skill_level not null default 'beginner',
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table repos (
  id uuid primary key default gen_random_uuid(),
  github_id bigint not null unique,
  full_name text not null unique,
  description text,
  summary_en text,
  summary_ur text,
  languages text[] not null default '{}',
  topics text[] not null default '{}',
  stars integer not null default 0,
  forks integer not null default 0,
  open_issues integer not null default 0,
  gfi_count integer not null default 0,
  has_contributing boolean not null default false,
  health_score numeric(5, 2) not null default 0,
  embedding vector(384),
  last_commit_at timestamptz,
  indexed_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  repo_id uuid not null references repos (id) on delete cascade,
  score numeric(6, 4) not null,
  reason text not null,
  rank integer not null,
  cycle_ts timestamptz not null default now(),
  unique (user_id, repo_id, cycle_ts)
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  repo_id uuid not null references repos (id) on delete cascade,
  signal feedback_signal not null,
  ts timestamptz not null default now()
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null unique references repos (id) on delete cascade,
  maintainer_user_id uuid not null references users (id) on delete cascade,
  pitch text,
  help_wanted text[] not null default '{}',
  verified_at timestamptz not null default now()
);

create index recommendations_user_cycle_idx on recommendations (user_id, cycle_ts desc, rank);
create index feedback_user_idx on feedback (user_id);
create index repos_deleted_at_idx on repos (deleted_at);

-- NFR-5: RLS enabled on all Supabase tables
alter table users enable row level security;
alter table repos enable row level security;
alter table recommendations enable row level security;
alter table feedback enable row level security;
alter table claims enable row level security;

-- users: readable by anyone (public GitHub username/profile, non-sensitive), writable only by owner
create policy "users_select_all" on users for select using (true);
create policy "users_update_own" on users for update using (auth.uid() = id);

-- repos: public data, read-only to clients; writes happen via service role (nightly indexer)
create policy "repos_select_all" on repos for select using (deleted_at is null);

-- recommendations: visible only to the owning user
create policy "recommendations_select_own" on recommendations for select using (auth.uid() = user_id);

-- feedback: owner can read and write their own feedback (FR-5.3)
create policy "feedback_select_own" on feedback for select using (auth.uid() = user_id);
create policy "feedback_insert_own" on feedback for insert with check (auth.uid() = user_id);

-- claims: public read (welcoming badge), maintainer manages their own claim
create policy "claims_select_all" on claims for select using (true);
create policy "claims_insert_own" on claims for insert with check (auth.uid() = maintainer_user_id);
create policy "claims_update_own" on claims for update using (auth.uid() = maintainer_user_id);
