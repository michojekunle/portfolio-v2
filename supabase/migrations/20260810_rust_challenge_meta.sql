-- ============================================================
-- Single-row "pinned" content for the Rust Challenge page: why you started
-- (editable, rewrite in your own words) and a quotes list (editable —
-- seeded with two book quotes as placeholders, not claimed as your own).
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists rust_challenge_meta (
  id          int primary key default 1,
  why_started text,
  quotes      jsonb not null default '[]',
  updated_at  timestamptz not null default now(),
  constraint rust_challenge_meta_singleton check (id = 1)
);

alter table rust_challenge_meta enable row level security;

insert into rust_challenge_meta (id, why_started, quotes)
values (
  1,
  'I already built something most Rust engineers never touch — a real GKR/KZG/sumcheck implementation from scratch. Systems Rust is the trunk that lets me take any backend or infra role and get paid now. ZK, and eventually zkML, is the crown — the scarce, defensible, long-term thing nobody can easily copy. Six figures in six months is the target. The daily rep is how I get there without burning out or scattering.',
  '[{"quote":"You do not rise to the level of your goals. You fall to the level of your systems.","author":"James Clear, Atomic Habits"},{"quote":"You cannot make progress without making decisions.","author":"John C. Maxwell, How Successful People Think"}]'::jsonb
)
on conflict (id) do nothing;
