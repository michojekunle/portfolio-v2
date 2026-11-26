-- ============================================================
-- Site Videos (Videos page) Schema
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists site_videos (
  id                  uuid primary key default gen_random_uuid(),
  platform            text not null check (platform in ('youtube', 'instagram', 'tiktok')),
  url                 text not null,
  title               text not null,
  description         text,
  section             text not null default 'highlight' check (section in ('intro', 'featured', 'highlight')),
  category            text not null default 'General',
  speaking_day_number int check (speaking_day_number is null or (speaking_day_number between 1 and 90)),
  display_order       int not null default 0,
  is_published        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Only one intro video makes sense at a time — enforce it at the DB level
-- rather than relying on the admin UI to behave.
create unique index if not exists site_videos_single_intro_idx
  on site_videos (section)
  where section = 'intro';

create index if not exists site_videos_section_idx on site_videos(section, display_order);
create index if not exists site_videos_highlight_cat_idx on site_videos(section, is_published, category, display_order asc, created_at desc);

-- ── Row Level Security ───────────────────────────────────────
-- This is site-wide public content (not per-user data), so: anyone can
-- read published rows, and any authenticated session (the single site
-- owner) can manage everything — same trust model as the `projects` table.

alter table site_videos enable row level security;

create policy "site_videos_public_read" on site_videos
  for select using (is_published = true);

create policy "site_videos_owner_write" on site_videos
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

-- ── updated_at trigger ───────────────────────────────────────

create or replace function update_site_videos_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger site_videos_updated_at
  before update on site_videos
  for each row execute function update_site_videos_updated_at();

notify pgrst, 'reload schema';
