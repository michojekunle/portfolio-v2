-- Persists Vela Guide chat conversations so they survive reloads and can be
-- browsed later, and so the client can cache them locally for offline reads.

create table if not exists jo_chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  -- ExecutedAction[] emitted alongside an assistant reply (set_priorities,
  -- log_note, etc.) — null for plain conversational turns and all user rows.
  executed    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists jo_chats_user_created_idx on jo_chats(user_id, created_at);

alter table jo_chats enable row level security;

create policy "jo_chats_own" on jo_chats for all using (auth.uid() = user_id);
