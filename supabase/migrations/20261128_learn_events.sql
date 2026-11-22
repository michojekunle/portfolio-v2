-- ============================================================
-- First-party product events for French/Spanish Daily.
-- Run in Supabase SQL editor after 20261127_learn_review_fixes.sql.
--
-- Answers "where do learners drop off?", "does anyone turn on the natural
-- voice?" and "are reminders going out?" without a third-party tracker or
-- cookies. Rows hold an event name, language, the signed-in user id (if any)
-- and a few small non-sensitive properties: never text a learner typed,
-- words, or scores. Written by the server (service role) only.
-- ============================================================

create table if not exists learn_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete set null,
  language   text check (language in ('fr', 'es')),
  name       text not null check (name ~ '^[a-z][a-z0-9_]{2,40}$'),
  props      jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and pg_column_size(props) < 1024)
);

create index if not exists learn_events_name_time_idx on learn_events (name, created_at desc);
create index if not exists learn_events_user_idx on learn_events (user_id, created_at desc);

-- RLS on and no policies: only the service role can read or write.
alter table learn_events enable row level security;

create or replace view learn_event_daily as
  select date_trunc('day', created_at)::date as day, language, name, count(*) as events, count(distinct user_id) as learners
  from learn_events
  group by 1, 2, 3;

revoke all on learn_event_daily from anon, authenticated;

notify pgrst, 'reload schema';
