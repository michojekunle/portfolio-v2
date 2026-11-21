-- ============================================================
-- Spanish Daily — the same daily-page engine as French Daily, separate data.
--
-- Separate tables (not a `language` column on the French ones) so each
-- language keeps its own streak, deck, level and commitment, and neither app
-- can ever read or corrupt the other's rows.
--
-- RLS policies are created here, in the same migration, on purpose: this repo
-- has twice shipped "RLS enabled, no policy" and silently blocked users.
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists spanish_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  level         text not null default 'A2' check (level in ('A1', 'A2', 'B1', 'B2')),
  timezone      text not null default 'UTC',
  daily_minutes int  not null default 15 check (daily_minutes in (15, 30, 60)),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists spanish_user_streaks (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  current_streak      int not null default 0,
  longest_streak      int not null default 0,
  streak_freezes      int not null default 2,
  last_completed_date date,
  total_completions   int not null default 0,
  updated_at          timestamptz not null default now()
);

create table if not exists spanish_cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  target_text      text not null,
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
  unique (user_id, target_text)
);

create index if not exists spanish_cards_user_due_idx on spanish_cards (user_id, due_at);

create table if not exists spanish_lessons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_date date not null,
  level       text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  content     jsonb not null,
  created_at  timestamptz not null default now(),
  unique (user_id, lesson_date)
);

create table if not exists spanish_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  client_session_id uuid not null,
  session_date      date not null,
  level             text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  duration_seconds  int  not null check (duration_seconds between 1 and 7200),
  reviews           int  not null default 0,
  reviews_recalled  int  not null default 0,
  new_cards         int  not null default 0,
  speak_score       real check (speak_score is null or (speak_score >= 0 and speak_score <= 1)),
  writing_correct   boolean,
  created_at        timestamptz not null default now(),
  unique (user_id, client_session_id)
);

create index if not exists spanish_sessions_user_date_idx on spanish_sessions (user_id, session_date desc);

alter table spanish_profiles     enable row level security;
alter table spanish_user_streaks enable row level security;
alter table spanish_cards        enable row level security;
alter table spanish_lessons      enable row level security;
alter table spanish_sessions     enable row level security;

drop policy if exists "spanish_profiles_own" on spanish_profiles;
create policy "spanish_profiles_own" on spanish_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "spanish_user_streaks_own" on spanish_user_streaks;
create policy "spanish_user_streaks_own" on spanish_user_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "spanish_cards_own" on spanish_cards;
create policy "spanish_cards_own" on spanish_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "spanish_lessons_own" on spanish_lessons;
create policy "spanish_lessons_own" on spanish_lessons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "spanish_sessions_own" on spanish_sessions;
create policy "spanish_sessions_own" on spanish_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
