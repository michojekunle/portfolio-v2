-- ============================================================================
-- Security Hardening: Restrict all private admin, Speaking Ledger, recording
-- storage, and site_videos write policies strictly to the owner email
-- ('info@michaelojekunle.dev'), preventing signed-up users from other features
-- (/french, /spanish, /chapterly, /flowise, /bookbreaks, /journal) from
-- reading or modifying owner data via Supabase PostgREST.
--
-- IMPORTANT: If your Supabase admin email (CONTACT_TO_EMAIL) differs from
-- 'info@michaelojekunle.dev', replace 'info@michaelojekunle.dev' below before running.
-- ============================================================================

-- 1. Speaking Ledger public-curriculum read tables (public SELECT, owner write)
drop policy if exists "speaking_programme_public_read" on speaking_programme;
create policy "speaking_programme_public_read" on speaking_programme
  for select using (true);

drop policy if exists "speaking_curriculum_public_read" on speaking_curriculum_days;
create policy "speaking_curriculum_public_read" on speaking_curriculum_days
  for select using (true);

drop policy if exists "speaking_programme_authenticated" on speaking_programme;
drop policy if exists "speaking_programme_owner" on speaking_programme;
create policy "speaking_programme_owner" on speaking_programme
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_curriculum_authenticated" on speaking_curriculum_days;
drop policy if exists "speaking_curriculum_owner" on speaking_curriculum_days;
create policy "speaking_curriculum_owner" on speaking_curriculum_days
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

-- 2. Private Speaking Ledger tables (NO public access; owner email only)
drop policy if exists "speaking_sessions_authenticated" on speaking_sessions;
drop policy if exists "speaking_sessions_owner" on speaking_sessions;
create policy "speaking_sessions_owner" on speaking_sessions
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_assessments_authenticated" on speaking_assessments;
drop policy if exists "speaking_assessments_owner" on speaking_assessments;
create policy "speaking_assessments_owner" on speaking_assessments
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_publications_authenticated" on speaking_publications;
drop policy if exists "speaking_publications_owner" on speaking_publications;
create policy "speaking_publications_owner" on speaking_publications
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_weekly_challenges_authenticated" on speaking_weekly_challenges;
drop policy if exists "speaking_weekly_challenges_owner" on speaking_weekly_challenges;
create policy "speaking_weekly_challenges_owner" on speaking_weekly_challenges
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_weekly_reviews_authenticated" on speaking_weekly_reviews;
drop policy if exists "speaking_weekly_reviews_owner" on speaking_weekly_reviews;
create policy "speaking_weekly_reviews_owner" on speaking_weekly_reviews
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_idea_bank_authenticated" on speaking_idea_bank;
drop policy if exists "speaking_idea_bank_owner" on speaking_idea_bank;
create policy "speaking_idea_bank_owner" on speaking_idea_bank
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_day90_report_authenticated" on speaking_day90_report;
drop policy if exists "speaking_day90_report_owner" on speaking_day90_report;
create policy "speaking_day90_report_owner" on speaking_day90_report
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

-- 3. site_videos (public read only when is_published = true; owner-only write)
alter table site_videos enable row level security;

drop policy if exists "site_videos_public_read" on site_videos;
create policy "site_videos_public_read" on site_videos
  for select using (is_published = true);

drop policy if exists "site_videos_owner_write" on site_videos;
create policy "site_videos_owner_write" on site_videos
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

-- 4. Private Storage Bucket RLS (speaking-recordings: owner-only; service_role bypasses)
drop policy if exists "speaking_recordings_owner_objects" on storage.objects;
create policy "speaking_recordings_owner_objects" on storage.objects
  for all
  using (
    bucket_id = 'speaking-recordings'
    and coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev'
  )
  with check (
    bucket_id = 'speaking-recordings'
    and coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev'
  );

-- 5. Lock down existing single-owner admin tables (job tracker & rust challenge)
-- Safely runs only on tables that already exist in your database.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'job_leads',
    'job_applications',
    'job_skills_learned',
    'job_projects_built',
    'job_skills_gap',
    'job_projects_to_build',
    'rust_challenge_days',
    'rust_challenge_meta'
  ] loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table %I enable row level security', tbl);
      execute format('drop policy if exists %I on %I', tbl || '_authenticated', tbl);
      execute format('drop policy if exists %I on %I', tbl || '_owner', tbl);
      execute format(
        'create policy %I on %I for all using (coalesce(auth.jwt() ->> ''email'', '''') = ''info@michaelojekunle.dev'') with check (coalesce(auth.jwt() ->> ''email'', '''') = ''info@michaelojekunle.dev'')',
        tbl || '_owner',
        tbl
      );
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
