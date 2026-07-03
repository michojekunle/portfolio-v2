-- ============================================================
-- Flowise Database Schema Additions
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
--
-- Note: fw_accounts, fw_categories, fw_transactions, fw_budgets, fw_goals,
-- and fw_transfers already exist on the live database but predate this
-- file, so they aren't defined here. This file only adds fw_profiles,
-- the new table backing the onboarding wizard.
-- ============================================================

-- Onboarding + personalization profile (one row per user)
create table if not exists fw_profiles (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  persona               text,
  primary_goal          text,
  income_type           text,
  monthly_income_range  text,
  currency              text not null default 'NGN',
  onboarded             boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table fw_profiles enable row level security;

create policy "fw_profiles_own" on fw_profiles for all using (auth.uid() = user_id);

create or replace function update_fw_profiles_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger fw_profiles_updated_at before update on fw_profiles for each row execute function update_fw_profiles_updated_at();
