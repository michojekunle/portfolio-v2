-- ============================================================
-- Job leads enrichment: richer per-lead data from the scheduled task
-- (salary, requirements, skills, suggested projects), plus global,
-- shared-across-all-jobs tracking of which skills/projects are done.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

alter table job_leads
  add column if not exists salary       text,
  add column if not exists requirements text,
  add column if not exists skills       text[] not null default '{}',
  add column if not exists projects     jsonb  not null default '[]';

-- Shared, deduped-by-name tracking — marking a skill/project done from any
-- one lead's detail view marks it done everywhere else it appears too.
create table if not exists job_skills_learned (
  skill      text primary key,
  learned_at timestamptz not null default now()
);

create table if not exists job_projects_built (
  project  text primary key,
  built_at timestamptz not null default now()
);

alter table job_skills_learned  enable row level security;
alter table job_projects_built  enable row level security;
