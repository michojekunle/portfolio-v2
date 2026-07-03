-- ============================================================
-- Chapterly Database Schema
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- Books library
create table if not exists ch_books (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  author          text,
  cover_url       text,
  file_url        text not null,
  file_format     text not null check (file_format in ('pdf','epub','docx','txt','md','html','azw3','mobi','fb2','cbz','other')),
  file_size_bytes bigint not null default 0,
  total_pages     int,
  current_page    int not null default 0,
  progress_pct    numeric(5,2) not null default 0,
  status          text not null default 'unread' check (status in ('unread','reading','finished','abandoned','on_hold')),
  genres          text[] not null default '{}',
  tags            text[] not null default '{}',
  rating          int check (rating between 1 and 5),
  description     text,
  language        text not null default 'en',
  published_year  int,
  is_private      boolean not null default false,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Reading sessions
create table if not exists ch_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  book_id          uuid not null references ch_books(id) on delete cascade,
  started_at       timestamptz not null,
  ended_at         timestamptz not null,
  pages_read       int not null default 0,
  duration_seconds int not null default 0,
  chapter_title    text,
  created_at       timestamptz not null default now()
);

-- Highlights & annotations
create table if not exists ch_highlights (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  book_id          uuid not null references ch_books(id) on delete cascade,
  page_number      int,
  cfi_range        text,
  text             text not null,
  color            text not null default 'yellow' check (color in ('yellow','green','blue','pink')),
  note             text,
  is_flashcard     boolean not null default false,
  flashcard_due_at timestamptz,
  created_at       timestamptz not null default now()
);

-- Chapter & book notes
create table if not exists ch_notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  book_id       uuid not null references ch_books(id) on delete cascade,
  chapter_ref   text,
  chapter_title text,
  content_md    text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Reading goals & streaks
create table if not exists ch_goals (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  daily_minutes       int not null default 15,
  annual_books        int not null default 12,
  streak_count        int not null default 0,
  longest_streak      int not null default 0,
  streak_freeze_count int not null default 0,
  streak_freeze_until timestamptz,
  onboarded           boolean not null default false,
  learning_plan       jsonb not null default '[]',
  last_read_date      date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Achievement badges
create table if not exists ch_achievements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  badge_id   text not null,
  earned_at  timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- AI chat history per book
create table if not exists ch_chat_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  book_id    uuid not null references ch_books(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- Flashcard review queue (spaced repetition)
create table if not exists ch_flashcards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  highlight_id uuid not null references ch_highlights(id) on delete cascade,
  book_id      uuid not null references ch_books(id) on delete cascade,
  front        text not null,
  back         text,
  due_at       timestamptz not null default now(),
  interval_days int not null default 1,
  ease_factor  numeric(4,2) not null default 2.5,
  review_count int not null default 0,
  created_at   timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────

create index if not exists ch_books_user_id_idx       on ch_books(user_id);
create index if not exists ch_books_status_idx        on ch_books(user_id, status);
create index if not exists ch_sessions_user_id_idx    on ch_sessions(user_id);
create index if not exists ch_sessions_book_id_idx    on ch_sessions(book_id);
create index if not exists ch_sessions_started_at_idx on ch_sessions(user_id, started_at desc);
create index if not exists ch_highlights_book_id_idx  on ch_highlights(book_id);
create index if not exists ch_notes_book_id_idx       on ch_notes(book_id);
create index if not exists ch_chat_history_book_idx   on ch_chat_history(user_id, book_id, created_at);
create index if not exists ch_flashcards_due_at_idx   on ch_flashcards(user_id, due_at);

-- ── Row Level Security ───────────────────────────────────────

alter table ch_books         enable row level security;
alter table ch_sessions      enable row level security;
alter table ch_highlights    enable row level security;
alter table ch_notes         enable row level security;
alter table ch_goals         enable row level security;
alter table ch_achievements  enable row level security;
alter table ch_chat_history  enable row level security;
alter table ch_flashcards    enable row level security;

-- Users see only their own rows
create policy "ch_books_own"        on ch_books        for all using (auth.uid() = user_id);
create policy "ch_sessions_own"     on ch_sessions     for all using (auth.uid() = user_id);
create policy "ch_highlights_own"   on ch_highlights   for all using (auth.uid() = user_id);
create policy "ch_notes_own"        on ch_notes        for all using (auth.uid() = user_id);
create policy "ch_goals_own"        on ch_goals        for all using (auth.uid() = user_id);
create policy "ch_achievements_own" on ch_achievements for all using (auth.uid() = user_id);
create policy "ch_chat_own"         on ch_chat_history for all using (auth.uid() = user_id);
create policy "ch_flashcards_own"   on ch_flashcards   for all using (auth.uid() = user_id);

-- ── updated_at triggers ──────────────────────────────────────

create or replace function update_ch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger ch_books_updated_at  before update on ch_books  for each row execute function update_ch_updated_at();
create trigger ch_notes_updated_at  before update on ch_notes  for each row execute function update_ch_updated_at();
create trigger ch_goals_updated_at  before update on ch_goals  for each row execute function update_ch_updated_at();

-- ============================================================
-- Schema Migrations & Alterations (Chapterly Headway Update)
-- Run these statements to add new columns to your live database
-- ============================================================

-- Add onboarding status and learning plan storage
alter table ch_goals add column if not exists onboarded boolean not null default false;
alter table ch_goals add column if not exists learning_plan jsonb not null default '[]';

-- Add streak freeze capabilities
alter table ch_goals add column if not exists streak_freeze_until timestamptz;
alter table ch_goals add column if not exists streak_freeze_count int not null default 0;

