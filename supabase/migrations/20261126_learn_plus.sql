-- ============================================================
-- "Plus" subscriptions (Stripe) and the natural-voice audio cache.
--
-- learn_entitlements is written only by the Stripe webhook (service role);
-- learners can read their own row so the app knows what to unlock.
-- learn-tts is a private bucket used only by the server (service role) to
-- cache synthesised audio; clients get short-lived signed URLs.
-- Run in Supabase SQL editor after 20261125_learn_groups.sql.
-- ============================================================

create table if not exists learn_entitlements (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  plan                text not null default 'plus' check (plan in ('plus')),
  status              text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused')),
  current_period_end  timestamptz,
  stripe_customer_id  text,
  stripe_subscription_id text unique,
  updated_at          timestamptz not null default now()
);

alter table learn_entitlements enable row level security;

drop policy if exists "learn_entitlements_read_own" on learn_entitlements;
create policy "learn_entitlements_read_own" on learn_entitlements
  for select using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role (webhook) writes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learn-tts', 'learn-tts', false, 1048576, array['audio/mpeg'])
on conflict (id) do nothing;
-- No storage policies for learn-tts: only the service role reads and writes it.

notify pgrst, 'reload schema';
