-- ============================================================================
-- Migration: Add TikTok to Speaking Ledger publications, video categories,
-- and direct sync columns between speaking_publications and site_videos.
-- Run in Supabase SQL Editor.
-- ============================================================================

-- 1. Ensure site_videos has category + speaking_day_number + pagination index
create table if not exists site_videos (
  id                  uuid primary key default gen_random_uuid(),
  platform            text not null check (platform in ('youtube', 'instagram', 'tiktok')),
  url                 text not null,
  title               text not null,
  description         text,
  section             text not null default 'highlight' check (section in ('intro', 'featured', 'highlight')),
  category            text not null default 'General',
  speaking_day_number int check (speaking_day_number between 1 and 90),
  display_order       int not null default 0,
  is_published        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table site_videos
  add column if not exists category text not null default 'General';

alter table site_videos
  add column if not exists speaking_day_number int;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_videos_speaking_day_number_check'
  ) then
    alter table site_videos
      add constraint site_videos_speaking_day_number_check
      check (speaking_day_number is null or (speaking_day_number between 1 and 90));
  end if;
end $$;

create index if not exists site_videos_highlight_cat_idx
  on site_videos (section, is_published, category, display_order asc, created_at desc);

alter table site_videos enable row level security;

drop policy if exists "site_videos_public_read" on site_videos;
create policy "site_videos_public_read" on site_videos
  for select using (is_published = true);

drop policy if exists "site_videos_owner_write" on site_videos;
create policy "site_videos_owner_write" on site_videos
  for all
  using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

-- 2. Update speaking_publications to allow 'tiktok' and store video sync fields
alter table speaking_publications
  drop constraint if exists speaking_publications_platform_check;

alter table speaking_publications
  add constraint speaking_publications_platform_check
  check (platform in ('instagram', 'tiktok', 'x', 'youtube', 'website'));

alter table speaking_publications
  add column if not exists video_category text not null default 'Speaking Challenge';

alter table speaking_publications
  add column if not exists sync_to_videos boolean not null default true;

alter table speaking_publications
  add column if not exists site_video_id uuid references site_videos(id) on delete set null;

notify pgrst, 'reload schema';
