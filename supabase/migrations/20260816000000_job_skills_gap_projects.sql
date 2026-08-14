-- ============================================================
-- Skills-to-add and proof-of-work-project recommendations, made live:
-- previously hardcoded in lib/admin/job-search-data.ts, now growable both
-- by the scheduled task's POST to /api/job-leads and by manually adding
-- one from the Resources tab.
--
-- RLS policy is included from the start (not a follow-up fix) — this repo's
-- own migration history (20260722_job_search_rls_fix.sql,
-- 20260812_rls_fix_second_pass.sql) already hit "RLS enabled, no policy"
-- silently blocking the authenticated admin session twice; do not repeat it
-- a third time.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists job_skills_gap (
  id          uuid primary key default gen_random_uuid(),
  role        text not null check (role in ('flutter', 'rust')),
  name        text not null,
  priority    text not null check (priority in ('critical', 'high', 'medium', 'low')),
  why         text not null,
  resource    text not null,
  created_at  timestamptz not null default now(),
  -- Same upsert-to-dedupe pattern as job_leads(url) — a skill spotted again
  -- in a later scheduled-task run refreshes its why/resource/priority
  -- instead of creating a duplicate row.
  unique (role, name)
);

create table if not exists job_projects_to_build (
  id          uuid primary key default gen_random_uuid(),
  role        text not null check (role in ('flutter', 'rust')),
  name        text not null,
  description text not null,
  skills      text[] not null default '{}',
  difficulty  text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  weeks       integer not null check (weeks >= 1 and weeks <= 52),
  created_at  timestamptz not null default now(),
  unique (role, name)
);

create index if not exists job_skills_gap_role_idx        on job_skills_gap(role);
create index if not exists job_projects_to_build_role_idx on job_projects_to_build(role);

alter table job_skills_gap        enable row level security;
alter table job_projects_to_build enable row level security;

create policy "job_skills_gap_authenticated" on job_skills_gap
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "job_projects_to_build_authenticated" on job_projects_to_build
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
