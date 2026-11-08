-- Flowise chat-bot linking: connects a Telegram/WhatsApp chat to a Flowise
-- user so receipts forwarded to the bot land in their transactions.
--
-- Flow: the user generates a short-lived link code in Flowise settings, then
-- sends "/link <code>" to the bot. The webhook matches the code, stores the
-- chat id, and clears the code.

create table if not exists fw_bot_links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  platform    text not null check (platform in ('telegram', 'whatsapp')),
  chat_id     text,                    -- null until the user completes /link
  link_code   text,                    -- one-time code, cleared after linking
  code_expires_at timestamptz,
  linked_at   timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, platform)
);

-- A chat can only be linked to one user per platform
create unique index if not exists fw_bot_links_platform_chat
  on fw_bot_links (platform, chat_id) where chat_id is not null;

create index if not exists fw_bot_links_code
  on fw_bot_links (link_code) where link_code is not null;

alter table fw_bot_links enable row level security;

-- Users manage their own links from the app. The webhooks use the service
-- role key and bypass RLS.
create policy "Users can view own bot links"
  on fw_bot_links for select using (auth.uid() = user_id);

create policy "Users can insert own bot links"
  on fw_bot_links for insert with check (auth.uid() = user_id);

create policy "Users can update own bot links"
  on fw_bot_links for update using (auth.uid() = user_id);

create policy "Users can delete own bot links"
  on fw_bot_links for delete using (auth.uid() = user_id);
