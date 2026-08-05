-- ============================================================
-- Fix: same bug as 20260722_job_search_rls_fix.sql, reintroduced across four
-- more tables this session (job_skills_learned, job_projects_built,
-- rust_challenge_days, rust_challenge_meta) — all created with "RLS enabled,
-- no policies" copied from the *original, buggy* comment on job_leads/
-- job_applications rather than the corrected pattern.
--
-- lib/supabase/server.ts's createServerClient forwards the logged-in admin's
-- own session cookie into every request, so an authenticated admin session
-- is evaluated under RLS as that user (role: authenticated), not as
-- service_role — even though the client was constructed with the
-- service-role key. With no policy, every read/write from the actual admin
-- UI was silently denied (writes: 42501 error; reads: zero rows, no error
-- at all, which is why the streak/progress showed 0 with no visible failure).
--
-- App-layer auth (requireAdminAuth / the single CONTACT_TO_EMAIL gate) is
-- still the real access control; this just stops RLS from blocking the one
-- legitimate authenticated session on top of it.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

drop policy if exists "job_skills_learned_authenticated" on job_skills_learned;
create policy "job_skills_learned_authenticated" on job_skills_learned
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "job_projects_built_authenticated" on job_projects_built;
create policy "job_projects_built_authenticated" on job_projects_built
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "rust_challenge_days_authenticated" on rust_challenge_days;
create policy "rust_challenge_days_authenticated" on rust_challenge_days
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "rust_challenge_meta_authenticated" on rust_challenge_meta;
create policy "rust_challenge_meta_authenticated" on rust_challenge_meta
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
