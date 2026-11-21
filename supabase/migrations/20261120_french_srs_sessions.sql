-- ============================================================
-- French Daily v2 — one-button daily session
--   french_profiles : level + IANA timezone (fixes UTC day-boundary streak bug)
--   french_cards    : personal spaced-repetition deck (backfilled from french_vocabulary)
--   french_lessons  : one cached lesson per user per local day (no more global,
--                     shared "daily prompts" that one user's generation could exhaust for all)
--   french_sessions : what was actually done each day (replaces unverifiable "proof")
--
-- RLS policies are created here, not left as a follow-up: this repo has twice
-- shipped "RLS enabled, no policy" and silently blocked the authenticated user.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists french_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  level         text not null default 'A2' check (level in ('A1', 'A2', 'B1', 'B2')),
  timezone      text not null default 'UTC',
  daily_minutes int  not null default 15 check (daily_minutes in (15, 30, 60)),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists french_cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  french_text      text not null,
  english_meaning  text not null,
  notes            text,
  source           text not null default 'lesson' check (source in ('lesson', 'manual', 'error')),
  state            text not null default 'new'    check (state in ('new', 'learning', 'review')),
  ease             real not null default 2.5      check (ease >= 1.3 and ease <= 3.0),
  interval_days    int  not null default 0        check (interval_days >= 0),
  reps             int  not null default 0,
  lapses           int  not null default 0,
  due_at           timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now(),
  unique (user_id, french_text)
);

create index if not exists french_cards_user_due_idx on french_cards (user_id, due_at);

create table if not exists french_lessons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_date date not null,
  level       text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  content     jsonb not null,
  created_at  timestamptz not null default now(),
  unique (user_id, lesson_date)
);

create table if not exists french_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  -- Client-generated, so a retried "complete" request is recognised and not
  -- applied twice (double-grading a card would compound its interval).
  client_session_id uuid not null,
  session_date     date not null,
  level            text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  duration_seconds int  not null check (duration_seconds between 1 and 7200),
  reviews          int  not null default 0,
  reviews_recalled int  not null default 0,
  new_cards        int  not null default 0,
  speak_score      real check (speak_score is null or (speak_score >= 0 and speak_score <= 1)),
  writing_correct  boolean,
  created_at       timestamptz not null default now(),
  unique (user_id, client_session_id)
);

create index if not exists french_sessions_user_date_idx on french_sessions (user_id, session_date desc);

alter table french_profiles enable row level security;
alter table french_cards    enable row level security;
alter table french_lessons  enable row level security;
alter table french_sessions enable row level security;

drop policy if exists "french_profiles_own" on french_profiles;
create policy "french_profiles_own" on french_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "french_cards_own" on french_cards;
create policy "french_cards_own" on french_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "french_lessons_own" on french_lessons;
create policy "french_lessons_own" on french_lessons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "french_sessions_own" on french_sessions;
create policy "french_sessions_own" on french_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep every word already saved in the old Vocab Vault: it becomes the starting
-- deck. 'on conflict do nothing' also absorbs duplicate (user, text) pairs.
insert into french_cards (user_id, french_text, english_meaning, notes, source, created_at)
select user_id, french_text, english_meaning, notes, 'manual', created_at
from french_vocabulary
where user_id is not null
on conflict (user_id, french_text) do nothing;

notify pgrst, 'reload schema';
