-- ============================================================
-- Goal-oriented learning tracks for French Daily & Spanish Daily.
-- Adds track/focus/goal_note + daily refresh cap on *_profiles,
-- track + mission_slug on *_lessons, and track + register +
-- starter/custom sources on *_cards.
-- Run in Supabase SQL editor after 20261129_learn_digests.sql.
-- ============================================================

alter table french_profiles
  add column if not exists track                text not null default 'general',
  add column if not exists goal_focus           text,
  add column if not exists goal_note            text,
  add column if not exists lesson_refresh_date  date,
  add column if not exists lesson_refresh_count int  not null default 0;

alter table spanish_profiles
  add column if not exists track                text not null default 'general',
  add column if not exists goal_focus           text,
  add column if not exists goal_note            text,
  add column if not exists lesson_refresh_date  date,
  add column if not exists lesson_refresh_count int  not null default 0;

alter table french_profiles  drop constraint if exists french_profiles_track_check;
alter table french_profiles  add  constraint french_profiles_track_check
  check (track in ('general', 'tech', 'medical', 'student', 'business', 'relocation', 'exams'));

alter table spanish_profiles drop constraint if exists spanish_profiles_track_check;
alter table spanish_profiles add  constraint spanish_profiles_track_check
  check (track in ('general', 'tech', 'medical', 'student', 'business', 'relocation', 'exams'));

alter table french_profiles  drop constraint if exists french_profiles_goal_note_len;
alter table french_profiles  add  constraint french_profiles_goal_note_len
  check (goal_note is null or char_length(goal_note) <= 120);

alter table spanish_profiles drop constraint if exists spanish_profiles_goal_note_len;
alter table spanish_profiles add  constraint spanish_profiles_goal_note_len
  check (goal_note is null or char_length(goal_note) <= 120);

alter table french_lessons
  add column if not exists track        text not null default 'general',
  add column if not exists mission_slug text;

alter table spanish_lessons
  add column if not exists track        text not null default 'general',
  add column if not exists mission_slug text;

alter table french_cards
  add column if not exists track    text,
  add column if not exists register text;

alter table spanish_cards
  add column if not exists track    text,
  add column if not exists register text;

alter table french_cards  drop constraint if exists french_cards_source_check;
alter table french_cards  add  constraint french_cards_source_check
  check (source in ('lesson', 'manual', 'error', 'starter', 'custom'));

alter table spanish_cards drop constraint if exists spanish_cards_source_check;
alter table spanish_cards add  constraint spanish_cards_source_check
  check (source in ('lesson', 'manual', 'error', 'starter', 'custom'));

alter table french_cards  drop constraint if exists french_cards_register_check;
alter table french_cards  add  constraint french_cards_register_check
  check (register is null or register in ('tu', 'vous', 'mixed'));

alter table spanish_cards drop constraint if exists spanish_cards_register_check;
alter table spanish_cards add  constraint spanish_cards_register_check
  check (register is null or register in ('tu', 'vous', 'mixed'));

notify pgrst, 'reload schema';
