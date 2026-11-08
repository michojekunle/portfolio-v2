-- ============================================================
-- Fix: job_leads / job_applications had RLS enabled with zero policies.
-- lib/supabase/server.ts uses @supabase/ssr's createServerClient, which
-- forwards the logged-in admin's own session cookie into every request —
-- so an authenticated admin session is evaluated under RLS as that user,
-- not as service_role. With no policy, every read from the actual admin
-- UI silently returned zero rows (default-deny), even though a cookie-less
-- request (e.g. a bare curl POST) fell through to the raw key and bypassed
-- RLS entirely — which is why the write worked but nothing ever showed up.
--
-- App-layer auth (requireAdminAuth / the single CONTACT_TO_EMAIL gate) is
-- still the real access control; this just stops RLS from blocking the one
-- legitimate authenticated session on top of it.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

drop policy if exists "job_leads_authenticated" on job_leads;
create policy "job_leads_authenticated" on job_leads
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "job_applications_authenticated" on job_applications;
create policy "job_applications_authenticated" on job_applications
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
