-- ============================================================
-- Vela (Journal) Database Schema
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- Objectives (long-running goals a user is working toward)
create table if not exists jo_objectives (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  target_date  date,
  status       text not null default 'active' check (status in ('active','completed','dropped','paused')),
  priority     text not null default 'medium' check (priority in ('high','medium','low')),
  color        text not null default '#7C3AED',
  icon         text not null default '🎯',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Milestones (checkpoints under an objective)
create table if not exists jo_milestones (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  objective_id  uuid not null references jo_objectives(id) on delete cascade,
  title         text not null,
  is_done       boolean not null default false,
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Daily log entries
create table if not exists jo_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  date            date not null,
  top_priorities  text[] not null default '{}',
  accomplished    text[] not null default '{}',
  blockers        text,
  notes           text,
  energy_level    int check (energy_level between 1 and 5),
  objective_ids   uuid[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Indexes ─────────────────────────────────────────────────

create index if not exists jo_objectives_user_id_idx      on jo_objectives(user_id);
create index if not exists jo_objectives_status_idx       on jo_objectives(user_id, status);
create index if not exists jo_milestones_user_id_idx      on jo_milestones(user_id);
create index if not exists jo_milestones_objective_id_idx on jo_milestones(objective_id);
create index if not exists jo_entries_user_date_idx       on jo_entries(user_id, date desc);

-- ── Row Level Security ───────────────────────────────────────

alter table jo_objectives enable row level security;
alter table jo_milestones enable row level security;
alter table jo_entries    enable row level security;

-- Users see only their own rows
create policy "jo_objectives_own" on jo_objectives for all using (auth.uid() = user_id);
create policy "jo_milestones_own" on jo_milestones for all using (auth.uid() = user_id);
create policy "jo_entries_own"    on jo_entries    for all using (auth.uid() = user_id);

-- ── updated_at triggers ──────────────────────────────────────

create or replace function update_jo_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger jo_objectives_updated_at before update on jo_objectives for each row execute function update_jo_updated_at();
create trigger jo_milestones_updated_at before update on jo_milestones for each row execute function update_jo_updated_at();
create trigger jo_entries_updated_at    before update on jo_entries    for each row execute function update_jo_updated_at();

-- ============================================================
-- If jo_objectives / jo_milestones already existed before this file was
-- written (they were hand-created, never tracked here), the FK below may
-- be missing — that's the most common cause of PostgREST embedded-select
-- 500s. Run this block to backfill it, then reload the schema cache.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'jo_milestones' and constraint_name = 'jo_milestones_objective_id_fkey'
  ) then
    alter table jo_milestones
      add constraint jo_milestones_objective_id_fkey
      foreign key (objective_id) references jo_objectives(id) on delete cascade;
  end if;
end $$;

notify pgrst, 'reload schema';
