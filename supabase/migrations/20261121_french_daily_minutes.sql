-- ============================================================
-- French Daily — daily time commitment (15 / 30 / 60 minutes)
-- Safe to run whether or not 20261120_french_srs_sessions.sql was applied
-- before it was updated: normalises old values, then replaces the check.
-- Run in Supabase SQL editor after 20261120_french_srs_sessions.sql.
-- ============================================================

alter table french_profiles drop constraint if exists french_profiles_daily_minutes_check;

update french_profiles
set daily_minutes = case
  when daily_minutes <= 22 then 15
  when daily_minutes <= 45 then 30
  else 60
end
where daily_minutes not in (15, 30, 60);

alter table french_profiles alter column daily_minutes set default 15;
alter table french_profiles add constraint french_profiles_daily_minutes_check check (daily_minutes in (15, 30, 60));

notify pgrst, 'reload schema';
