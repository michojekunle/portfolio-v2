-- ============================================================
-- Opt-in weekly summary email and group-streak nudges.
-- Run in Supabase SQL editor after 20261128_learn_events.sql.
--
-- Both are OFF until the learner turns them on next to their reminder
-- settings. They reuse learn_reminders (one row per learner per language),
-- so the existing RLS policies already limit each learner to their own row.
-- ============================================================

alter table learn_reminders add column if not exists weekly_summary boolean not null default false;
alter table learn_reminders add column if not exists last_weekly_on date;
alter table learn_reminders add column if not exists group_nudges   boolean not null default false;
alter table learn_reminders add column if not exists last_nudge_on  date;

-- The hourly job now also looks at learners who only want the weekly summary or nudges.
create index if not exists learn_reminders_opt_in_idx
  on learn_reminders (language)
  where enabled or weekly_summary or group_nudges;

notify pgrst, 'reload schema';
