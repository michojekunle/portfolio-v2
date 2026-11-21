-- ============================================================
-- Daily reminders for French Daily and Spanish Daily.
-- One row per learner per language. The hourly job (/api/learn/reminders,
-- service role) sends at the learner's local time if today's page isn't done.
-- RLS: learners manage only their own rows; the job uses the service role.
-- Run in Supabase SQL editor after 20261123_learn_variants.sql.
-- ============================================================

create table if not exists learn_reminders (
  user_id           uuid not null references auth.users(id) on delete cascade,
  language          text not null check (language in ('fr', 'es')),
  enabled           boolean not null default true,
  reminder_time     text not null default '20:00' check (reminder_time ~ '^([01][0-9]|2[0-3]):00$'),
  timezone          text not null default 'UTC',
  email             boolean not null default false,
  push_subscription jsonb,
  last_sent_on      date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (user_id, language)
);

create index if not exists learn_reminders_enabled_idx on learn_reminders (enabled) where enabled;

alter table learn_reminders enable row level security;

drop policy if exists "learn_reminders_own" on learn_reminders;
create policy "learn_reminders_own" on learn_reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
