-- ============================================================================
-- The Speaking Ledger — 90 Days of Speaking (Nov 30, 2026 -> Feb 27, 2027)
-- Timezone: Africa/Lagos
-- Run in Supabase SQL Editor or via `supabase db push`
-- ============================================================================

create table if not exists speaking_programme (
  id          text primary key,
  name        text not null,
  tagline     text not null,
  start_date  date not null,
  end_date    date not null,
  timezone    text not null default 'Africa/Lagos',
  status      text not null default 'active',
  created_at  timestamptz not null default now()
);

create table if not exists speaking_curriculum_days (
  id                          uuid primary key default gen_random_uuid(),
  day_number                  int not null unique check (day_number between 1 and 90),
  date                        date not null unique,
  phase                       int not null check (phase between 1 and 3),
  week_number                 int not null check (week_number between 1 and 13),
  topic                       text not null,
  description                 text not null,
  skill                       text not null,
  duration                    text not null default '3-5 minutes',
  thinking_prompts            jsonb not null default '[]'::jsonb,
  recommended_format          text not null default 'conversational_talk',
  weekly_challenge_reference  text not null default '',
  created_at                  timestamptz not null default now()
);

create table if not exists speaking_sessions (
  id                          uuid primary key default gen_random_uuid(),
  day_number                  int not null unique check (day_number between 1 and 90),
  status                      text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  prep_completed              boolean not null default false,
  first_take_completed        boolean not null default false,
  first_recording_url         text not null default '',
  first_recording_duration    text not null default '',
  first_recording_minutes     numeric not null default 0,
  review_completed            boolean not null default false,
  second_take_completed       boolean not null default false,
  second_recording_url        text not null default '',
  second_recording_duration   text not null default '',
  final_recording_url         text not null default '',
  preparation_notes           text not null default '',
  prem_point                  text not null default '',
  prem_reason                 text not null default '',
  prem_example                text not null default '',
  prem_meaning                text not null default '',
  selected_audience           text not null default 'mixed',
  selected_format             text not null default 'conversational_talk',
  daily_learning_summary      text not null default '',
  linked_building_ids         jsonb not null default '[]'::jsonb,
  linked_book_ids             jsonb not null default '[]'::jsonb,
  linked_learning_ids         jsonb not null default '[]'::jsonb,
  linked_project_ids          jsonb not null default '[]'::jsonb,
  carousel_slides             jsonb not null default '[]'::jsonb,
  practice_only               boolean not null default false,
  is_public                   boolean not null default false,
  audience_interactions_count int not null default 0,
  reflection_what_worked      text not null default '',
  reflection_weakest          text not null default '',
  reflection_lost_train       text not null default '',
  reflection_improve_tomorrow text not null default '',
  reflection_what_learned     text not null default '',
  reflection_notes            text not null default '',
  completed_at                timestamptz,
  updated_at                  timestamptz not null default now()
);

create table if not exists speaking_assessments (
  id            uuid primary key default gen_random_uuid(),
  day_number    int not null unique check (day_number between 1 and 90),
  clarity       int not null check (clarity between 1 and 5),
  structure     int not null check (structure between 1 and 5),
  confidence    int not null check (confidence between 1 and 5),
  voice         int not null check (voice between 1 and 5),
  storytelling  int not null check (storytelling between 1 and 5),
  connection    int not null check (connection between 1 and 5),
  originality   int not null check (originality between 1 and 5),
  average_score numeric(4, 2) not null,
  notes         text not null default '',
  updated_at    timestamptz not null default now()
);

create table if not exists speaking_publications (
  id              uuid primary key default gen_random_uuid(),
  day_number      int not null check (day_number between 1 and 90),
  platform        text not null check (platform in ('instagram', 'tiktok', 'x', 'youtube', 'website')),
  published       boolean not null default false,
  url             text not null default '',
  caption         text not null default '',
  published_at    timestamptz,
  notes           text not null default '',
  video_category  text not null default 'Speaking Challenge',
  sync_to_videos  boolean not null default true,
  site_video_id   uuid,
  updated_at      timestamptz not null default now(),
  unique (day_number, platform)
);

create table if not exists speaking_weekly_challenges (
  id           uuid primary key default gen_random_uuid(),
  week_number  int not null unique check (week_number between 1 and 13),
  title        text not null,
  description  text not null default '',
  completed    boolean not null default false,
  completed_at timestamptz,
  reflection   text not null default ''
);

create table if not exists speaking_weekly_reviews (
  id                    uuid primary key default gen_random_uuid(),
  week_number           int not null unique check (week_number between 1 and 13),
  completed_days        int not null default 0,
  average_score         numeric(4, 2),
  strongest_recording   text not null default '',
  weakest_recording     text not null default '',
  speaking_habit        text not null default '',
  what_improved         text not null default '',
  still_struggling      text not null default '',
  most_interesting_idea text not null default '',
  connected_someone     text not null default '',
  next_week_focus       text not null default '',
  audience_interactions int not null default 0,
  weekly_article_title  text not null default '',
  weekly_article_body   text not null default '',
  weekly_article_slug   text not null default '',
  reflection            text not null default '',
  submitted_at          timestamptz,
  updated_at            timestamptz not null default now()
);

create table if not exists speaking_idea_bank (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  category          text not null check (category in (
    'observation',
    'question',
    'reading',
    'disagreement',
    'technical_concept',
    'business_idea',
    'personal_experience',
    'conversation'
  )),
  body              text not null default '',
  source_ref        text not null default '',
  tags              jsonb not null default '[]'::jsonb,
  linked_day_number int check (linked_day_number between 1 and 90),
  status            text not null default 'raw' check (status in ('raw', 'developing', 'used')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists speaking_day90_report (
  id                              int primary key default 1 check (id = 1),
  presentation_outline            text not null default '',
  final_recording_url             text not null default '',
  q1_organise_thoughts            text not null default '',
  q2_without_script               text not null default '',
  q3_explain_complicated          text not null default '',
  q4_better_storyteller           text not null default '',
  q5_habits_overcome              text not null default '',
  q6_still_needs_improvement      text not null default '',
  q7_conversations_opportunities  text not null default '',
  q8_continue_doing               text not null default '',
  updated_at                      timestamptz not null default now()
);

-- Indexes
create index if not exists speaking_sessions_status_idx on speaking_sessions(status);
create index if not exists speaking_publications_day_idx on speaking_publications(day_number);
create index if not exists speaking_idea_bank_category_idx on speaking_idea_bank(category);
create index if not exists speaking_idea_bank_day_idx on speaking_idea_bank(linked_day_number);

-- Row Level Security: protect all private sessions, scores, reviews, and ideas.
alter table speaking_programme enable row level security;
alter table speaking_curriculum_days enable row level security;
alter table speaking_sessions enable row level security;
alter table speaking_assessments enable row level security;
alter table speaking_publications enable row level security;
alter table speaking_weekly_challenges enable row level security;
alter table speaking_weekly_reviews enable row level security;
alter table speaking_idea_bank enable row level security;
alter table speaking_day90_report enable row level security;

-- Public read access ONLY for programme metadata & canonical curriculum prompts
drop policy if exists "speaking_programme_public_read" on speaking_programme;
create policy "speaking_programme_public_read" on speaking_programme
  for select using (true);

drop policy if exists "speaking_curriculum_public_read" on speaking_curriculum_days;
create policy "speaking_curriculum_public_read" on speaking_curriculum_days
  for select using (true);

-- Authenticated owner access across all Speaking Ledger tables (restricted strictly to owner email)
drop policy if exists "speaking_programme_authenticated" on speaking_programme;
create policy "speaking_programme_authenticated" on speaking_programme
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_curriculum_authenticated" on speaking_curriculum_days;
create policy "speaking_curriculum_authenticated" on speaking_curriculum_days
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_sessions_authenticated" on speaking_sessions;
create policy "speaking_sessions_authenticated" on speaking_sessions
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_assessments_authenticated" on speaking_assessments;
create policy "speaking_assessments_authenticated" on speaking_assessments
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_publications_authenticated" on speaking_publications;
create policy "speaking_publications_authenticated" on speaking_publications
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_weekly_challenges_authenticated" on speaking_weekly_challenges;
create policy "speaking_weekly_challenges_authenticated" on speaking_weekly_challenges
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_weekly_reviews_authenticated" on speaking_weekly_reviews;
create policy "speaking_weekly_reviews_authenticated" on speaking_weekly_reviews
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_idea_bank_authenticated" on speaking_idea_bank;
create policy "speaking_idea_bank_authenticated" on speaking_idea_bank
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

drop policy if exists "speaking_day90_report_authenticated" on speaking_day90_report;
create policy "speaking_day90_report_authenticated" on speaking_day90_report
  for all using (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev') with check (coalesce(auth.jwt() ->> 'email', '') = 'info@michaelojekunle.dev');

-- Seed programme record
insert into speaking_programme (id, name, tagline, start_date, end_date, timezone, status)
values (
  '90-days-of-speaking',
  'The Speaking Ledger',
  '90 topics. 90 conversations. A better way to communicate.',
  '2026-11-30',
  '2027-02-27',
  'Africa/Lagos',
  'active'
)
on conflict (id) do update set
  start_date = excluded.start_date,
  end_date = excluded.end_date;

-- Seed weekly challenges
insert into speaking_weekly_challenges (week_number, title, description) values
  (1, 'Introduce yourself to someone new and have a meaningful conversation.', 'Move past small talk. Share what you are curious about, ask genuine questions, and listen carefully.'),
  (2, 'Tell one personal story without rehearsing.', 'Pick a real moment from your work or life and tell it cleanly with a setup, tension, and turning point.'),
  (3, 'Explain a technical concept to someone outside technology.', 'No jargon. Anchor the explanation in an everyday analogy until the listener can explain it back.'),
  (4, 'Defend an opinion in a respectful disagreement.', 'State your premise clearly, acknowledge the strongest counter-argument, and stay calm and curious.'),
  (5, 'Give a five-minute explanation of something difficult.', 'Take a non-trivial engineering or systems topic and walk through why it works and why it breaks.'),
  (6, 'Record a mock podcast episode.', 'Speak in a conversational, long-form rhythm for 8-12 minutes about a product or business lesson.'),
  (7, 'Explain one business idea from first principles.', 'Break down who has the problem, why existing options fail, and how value is created and captured.'),
  (8, 'Argue both sides of the same issue.', 'Steelman the position you hold and the position you oppose with equal clarity and fairness.'),
  (9, 'Deliver a short talk standing up without notes.', 'Use posture, eye contact, and natural pauses rather than looking down at a screen or outline.'),
  (10, 'Interview someone and ask thoughtful follow-up questions.', 'Listen to their actual answer rather than waiting for your next prepared question.'),
  (11, 'Give a presentation about something I am building.', 'Frame the problem, the user reality, what you built, what surprised you, and where it goes next.'),
  (12, 'Deliver a talk with an audience in mind, not just a camera.', 'Speak directly to a real person or group, calibrating tone, pacing, and examples to their context.'),
  (13, 'Complete the final presentation and review development.', 'Deliver your 10-minute signature talk, review Day 1 alongside Day 90, and generate your permanent 90-day report.')
on conflict (week_number) do nothing;

notify pgrst, 'reload schema';
