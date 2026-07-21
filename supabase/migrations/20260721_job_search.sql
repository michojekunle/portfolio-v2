-- ============================================================
-- Job Search Tracker — leads (from the scheduled Cowork task) and
-- logged applications, both managed from /admin/jobs.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists job_leads (
  id          uuid primary key default gen_random_uuid(),
  role        text not null check (role in ('flutter', 'rust')),
  company     text not null,
  title       text not null,
  board       text,
  url         text,
  tip         text,
  created_at  timestamptz not null default now(),
  -- One row per distinct listing URL — the scheduled task posts every run,
  -- so this lets a repeat sighting refresh the row (upsert) instead of
  -- piling up duplicates. Leads without a URL always insert as new.
  unique (url)
);

create table if not exists job_applications (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  role        text not null check (role in ('flutter', 'rust')),
  company     text not null,
  board       text,
  status      text not null default 'applied'
                check (status in ('toapply', 'applied', 'interviewing', 'offer', 'rejected', 'ghosted')),
  followup    date,
  url         text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists job_leads_role_created_idx  on job_leads(role, created_at desc);
create index if not exists job_applications_status_idx on job_applications(status);
create index if not exists job_applications_role_idx   on job_applications(role);

-- ── Row Level Security ───────────────────────────────────────
-- Both tables are only ever touched by Next.js server routes using the
-- service-role Supabase client (lib/supabase/server.ts), which bypasses RLS —
-- application code (requireAdminAuth / the JOB_LEADS_API_SECRET bearer check)
-- is the real gate. RLS is enabled with no policies as defense-in-depth: it
-- blocks any accidental direct access from an anon/browser-key client.

alter table job_leads       enable row level security;
alter table job_applications enable row level security;
