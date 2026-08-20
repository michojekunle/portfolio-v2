-- ============================================================
-- French Daily Challenge PWA — Vocabulary Edit & Isolation RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop old lax anonymous policies
drop policy if exists "anon insert vocab" on french_vocabulary;
drop policy if exists "anon read vocab" on french_vocabulary;
drop policy if exists "anon delete vocab" on french_vocabulary;

-- Drop any previous update/delete policies
drop policy if exists "users update own vocab" on french_vocabulary;
drop policy if exists "users delete own vocab" on french_vocabulary;
drop policy if exists "users read own vocab" on french_vocabulary;
drop policy if exists "users insert own vocab" on french_vocabulary;

-- 1. Read policy (user can read their own entries OR public shared defaults)
create policy "users read own vocab" on french_vocabulary
  for select using (auth.uid() = user_id or user_id is null);

-- 2. Insert policy (user can only insert entries linked to themselves)
create policy "users insert own vocab" on french_vocabulary
  for insert with check (auth.uid() = user_id);

-- 3. Update policy (user can only update their own entries)
create policy "users update own vocab" on french_vocabulary
  for update using (auth.uid() = user_id);

-- 4. Delete policy (user can only delete their own entries)
create policy "users delete own vocab" on french_vocabulary
  for delete using (auth.uid() = user_id);
