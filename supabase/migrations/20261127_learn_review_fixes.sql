-- ============================================================
-- Fixes from the review of groups and reminders.
-- Run in Supabase SQL editor after 20261126_learn_plus.sql.
--
-- 1. Create/join take a per-learner lock, so a double-tap or two invite tabs
--    can't leave someone in two groups for one language.
-- 2. Moving a voice note (storage UPDATE) re-checks group membership on the
--    destination, like uploads do.
-- 3. Learners who turned on reminders on the old French page are carried over
--    to learn_reminders (the old 10 PM workflow is gone), and new sign-ups on
--    that page keep flowing through.
-- ============================================================

-- ── 1. Serialised create / join ─────────────────────────────────────────
create or replace function learn_create_group(p_language text, p_name text, p_display_name text, p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  -- One membership per learner per language: serialise this learner's create/join calls.
  perform pg_advisory_xact_lock(hashtext('learn_group_member:' || auth.uid()::text || ':' || p_language));
  if exists (
    select 1 from learn_group_members m join learn_groups g on g.id = m.group_id
    where m.user_id = auth.uid() and g.language = p_language
  ) then
    raise exception 'already in a group for this language';
  end if;
  insert into learn_groups (language, name, invite_code, created_by)
  values (p_language, trim(p_name), p_invite_code, auth.uid())
  returning id into new_id;
  insert into learn_group_members (group_id, user_id, display_name)
  values (new_id, auth.uid(), trim(p_display_name));
  return new_id;
end;
$$;

create or replace function learn_join_group(p_invite_code text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target learn_groups%rowtype;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into target from learn_groups where invite_code = upper(trim(p_invite_code));
  if not found then raise exception 'invite not found'; end if;
  perform pg_advisory_xact_lock(hashtext('learn_group_member:' || auth.uid()::text || ':' || target.language));
  if exists (select 1 from learn_group_members where group_id = target.id and user_id = auth.uid()) then
    return target.id;
  end if;
  if exists (
    select 1 from learn_group_members m join learn_groups g on g.id = m.group_id
    where m.user_id = auth.uid() and g.language = target.language
  ) then
    raise exception 'already in a group for this language';
  end if;
  -- Serialise joins per group so two people can't both take the fifth seat.
  perform 1 from learn_groups where id = target.id for update;
  if (select count(*) from learn_group_members where group_id = target.id) >= 5 then
    raise exception 'group is full';
  end if;
  insert into learn_group_members (group_id, user_id, display_name)
  values (target.id, auth.uid(), trim(p_display_name));
  return target.id;
end;
$$;


-- ── 2. Moving a voice note keeps the membership check ──────────────────
drop policy if exists "learn_voice_update_own" on storage.objects;
create policy "learn_voice_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'learn-voice' and storage.filename(name) like auth.uid()::text || '.%')
  with check (
    learn_voice_member(bucket_id, name)
    and storage.filename(name) like auth.uid()::text || '.%'
  );

-- ── 3. Old French page subscribers → learn_reminders ───────────────────
-- The old page stored "HH:MM" in West Africa Time; the new job runs hourly.
create or replace function learn_reminder_from_legacy(p_time text)
returns text
language sql
immutable
as $$
  select case when p_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then left(p_time, 2) || ':00' else '22:00' end;
$$;

create or replace function learn_push_from_legacy(p_endpoint text, p_p256dh text, p_auth text)
returns jsonb
language sql
immutable
as $$
  -- Placeholder rows ("user-<id>", "default_p256dh") were never real browser subscriptions.
  select case
    when p_endpoint like 'https://%' and p_p256dh <> 'default_p256dh' and p_auth <> 'default_auth'
      then jsonb_build_object('endpoint', p_endpoint, 'keys', jsonb_build_object('p256dh', p_p256dh, 'auth', p_auth))
    else null
  end;
$$;

-- Existing settings in learn_reminders always win: those learners already chose.
insert into learn_reminders (user_id, language, enabled, reminder_time, timezone, email, push_subscription)
select distinct on (s.user_id)
  s.user_id, 'fr', true, learn_reminder_from_legacy(s.reminder_time), 'Africa/Lagos', false,
  learn_push_from_legacy(s.endpoint, s.p256dh, s.auth)
from french_subscriptions s
where s.user_id is not null
  and learn_push_from_legacy(s.endpoint, s.p256dh, s.auth) is not null
order by s.user_id, s.created_at desc
on conflict (user_id, language) do nothing;

create or replace function learn_sync_legacy_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  push jsonb := learn_push_from_legacy(new.endpoint, new.p256dh, new.auth);
begin
  if new.user_id is null or push is null then return new; end if;
  insert into learn_reminders (user_id, language, enabled, reminder_time, timezone, email, push_subscription)
  values (new.user_id, 'fr', true, learn_reminder_from_legacy(new.reminder_time), 'Africa/Lagos', false, push)
  on conflict (user_id, language) do update
    set push_subscription = excluded.push_subscription, updated_at = now();
  return new;
end;
$$;

revoke all on function learn_sync_legacy_subscription() from public;

drop trigger if exists learn_sync_legacy_subscription on french_subscriptions;
create trigger learn_sync_legacy_subscription
  after insert or update on french_subscriptions
  for each row execute function learn_sync_legacy_subscription();

notify pgrst, 'reload schema';
