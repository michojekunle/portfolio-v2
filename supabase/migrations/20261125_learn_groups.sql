-- ============================================================
-- Groups of five for French Daily and Spanish Daily.
--
-- A small private group: who finished today's page, a shared group streak,
-- and one voice note per member per day answering the day's question.
--
-- Privacy model: members can see their own group, its members' display
-- names, which days each member finished a page (dates only — no scores,
-- words or mistakes), and the group's voice notes. Nothing else.
-- Creating and joining go through SECURITY DEFINER functions so the
-- five-member cap and invite codes can't be bypassed from the client.
--
-- RLS policies are created here, not left as a follow-up: this repo has
-- twice shipped "RLS enabled, no policy" and silently blocked users.
-- Run in Supabase SQL editor after 20261124_learn_reminders.sql.
-- ============================================================

create table if not exists learn_groups (
  id          uuid primary key default gen_random_uuid(),
  language    text not null check (language in ('fr', 'es')),
  name        text not null check (char_length(name) between 1 and 40),
  invite_code text not null unique check (invite_code ~ '^[A-Z2-9]{8}$'),
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists learn_group_members (
  group_id     uuid not null references learn_groups(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  joined_at    timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists learn_group_members_user_idx on learn_group_members (user_id);

create table if not exists learn_group_posts (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references learn_groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  post_date   date not null,
  audio_path  text not null,
  duration_ms int  not null check (duration_ms between 500 and 65000),
  created_at  timestamptz not null default now(),
  unique (group_id, user_id, post_date)
);

-- Membership check used by every policy. SECURITY DEFINER avoids RLS recursion
-- on learn_group_members; it only ever answers "is the caller in this group?".
create or replace function learn_is_group_member(target_group uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from learn_group_members m
    where m.group_id = target_group and m.user_id = auth.uid()
  );
$$;

alter table learn_groups        enable row level security;
alter table learn_group_members enable row level security;
alter table learn_group_posts   enable row level security;

drop policy if exists "learn_groups_member_read" on learn_groups;
create policy "learn_groups_member_read" on learn_groups
  for select using (learn_is_group_member(id));

drop policy if exists "learn_group_members_read" on learn_group_members;
create policy "learn_group_members_read" on learn_group_members
  for select using (learn_is_group_member(group_id));

-- Leaving is a delete of your own membership row.
drop policy if exists "learn_group_members_leave" on learn_group_members;
create policy "learn_group_members_leave" on learn_group_members
  for delete using (user_id = auth.uid());

drop policy if exists "learn_group_posts_read" on learn_group_posts;
create policy "learn_group_posts_read" on learn_group_posts
  for select using (learn_is_group_member(group_id));

drop policy if exists "learn_group_posts_write_own" on learn_group_posts;
create policy "learn_group_posts_write_own" on learn_group_posts
  for insert with check (user_id = auth.uid() and learn_is_group_member(group_id));

drop policy if exists "learn_group_posts_update_own" on learn_group_posts;
create policy "learn_group_posts_update_own" on learn_group_posts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid() and learn_is_group_member(group_id));

drop policy if exists "learn_group_posts_delete_own" on learn_group_posts;
create policy "learn_group_posts_delete_own" on learn_group_posts
  for delete using (user_id = auth.uid());

-- ── Create / join (the only ways in) ─────────────────────────────────────

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

-- Days each member finished a page (dates only), for today's status and the
-- group streak. Members only; reads the private session tables on their behalf.
create or replace function learn_group_activity(p_group uuid, p_days int default 60)
returns table (user_id uuid, display_name text, joined_on date, completed_on date[])
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  lang text;
begin
  if not learn_is_group_member(p_group) then raise exception 'not a member'; end if;
  select language into lang from learn_groups where id = p_group;
  return query
    select m.user_id, m.display_name, m.joined_at::date,
      coalesce(array(
        select distinct s.session_date
        from (
          select fs.user_id, fs.session_date from french_sessions fs where lang = 'fr'
          union all
          select ss.user_id, ss.session_date from spanish_sessions ss where lang = 'es'
        ) s
        where s.user_id = m.user_id and s.session_date >= current_date - least(greatest(p_days, 1), 366)
        order by s.session_date
      ), '{}')
    from learn_group_members m
    where m.group_id = p_group
    order by m.joined_at;
end;
$$;

revoke all on function learn_create_group(text, text, text, text) from public;
revoke all on function learn_join_group(text, text) from public;
revoke all on function learn_group_activity(uuid, int) from public;
grant execute on function learn_create_group(text, text, text, text) to authenticated;
grant execute on function learn_join_group(text, text) to authenticated;
grant execute on function learn_group_activity(uuid, int) to authenticated;
grant execute on function learn_is_group_member(uuid) to authenticated;

-- ── Voice notes: private bucket, readable and writable by the group only ──
-- Path convention: <group_id>/<post_date>/<user_id>.webm

-- Policies on storage.objects apply to EVERY bucket, and Postgres doesn't
-- promise to evaluate "bucket_id = 'learn-voice'" before a ::uuid cast. A
-- non-uuid folder in another bucket would then raise and break storage
-- site-wide. This helper only casts after checking bucket and shape.
create or replace function learn_voice_member(p_bucket text, p_name text)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  folder text := (storage.foldername(p_name))[1];
begin
  if p_bucket <> 'learn-voice' or folder is null
     or folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return learn_is_group_member(folder::uuid);
end;
$$;

grant execute on function learn_voice_member(text, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learn-voice', 'learn-voice', false, 3145728, array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac'])
on conflict (id) do nothing;

drop policy if exists "learn_voice_read_group" on storage.objects;
create policy "learn_voice_read_group" on storage.objects
  for select to authenticated
  using (learn_voice_member(bucket_id, name));

drop policy if exists "learn_voice_write_own" on storage.objects;
create policy "learn_voice_write_own" on storage.objects
  for insert to authenticated
  with check (
    learn_voice_member(bucket_id, name)
    and storage.filename(name) like auth.uid()::text || '.%'
  );

drop policy if exists "learn_voice_update_own" on storage.objects;
create policy "learn_voice_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'learn-voice' and storage.filename(name) like auth.uid()::text || '.%')
  with check (bucket_id = 'learn-voice' and storage.filename(name) like auth.uid()::text || '.%');

drop policy if exists "learn_voice_delete_own" on storage.objects;
create policy "learn_voice_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'learn-voice' and storage.filename(name) like auth.uid()::text || '.%');

notify pgrst, 'reload schema';
