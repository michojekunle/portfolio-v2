-- ============================================================
-- French Daily Challenge PWA — Multi-User Data Isolation Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add user_id column to french_logs (tracks completed challenges per user)
alter table french_logs add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists french_logs_user_id_idx on french_logs(user_id);

-- 2. Add user_id column to french_vocabulary (tracks private Vocab Vault per user)
alter table french_vocabulary add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists french_vocabulary_user_id_idx on french_vocabulary(user_id);

-- 3. Add user_id column and reminder_time to french_subscriptions (tracks push notification endpoints per user)
alter table french_subscriptions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table french_subscriptions add column if not exists reminder_time text default '22:00';

-- 4. Multi-user streaks table (each signed-in user gets their own streak & freeze tracker)
create table if not exists french_user_streaks (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  current_streak      int not null default 0,
  longest_streak      int not null default 0,
  streak_freezes      int not null default 2,
  last_completed_date date,
  total_completions   int not null default 0,
  updated_at          timestamptz not null default now()
);

alter table french_user_streaks enable row level security;

-- Row Level Security policies for user streaks
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'french_user_streaks' and policyname = 'users read own streak') then
    create policy "users read own streak" on french_user_streaks for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'french_user_streaks' and policyname = 'users update own streak') then
    create policy "users update own streak" on french_user_streaks for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'french_user_streaks' and policyname = 'users insert own streak') then
    create policy "users insert own streak" on french_user_streaks for insert with check (auth.uid() = user_id);
  end if;
end
$$;
