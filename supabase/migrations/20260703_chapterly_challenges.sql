-- Chapterly Challenges tables
-- Run in Supabase SQL editor to enable the Challenges feature

-- ── ch_challenges ────────────────────────────────────────────────
-- Stores user-created custom challenges (pre-built ones live in code)
CREATE TABLE IF NOT EXISTS ch_challenges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  type         text NOT NULL CHECK (type IN ('streak', 'books', 'time', 'highlights', 'pages')),
  target       integer NOT NULL CHECK (target > 0),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  difficulty   text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  starts_at    timestamptz NOT NULL DEFAULT now(),
  ends_at      timestamptz,
  is_public    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ch_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ch_challenges_select" ON ch_challenges;
CREATE POLICY "ch_challenges_select" ON ch_challenges
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

DROP POLICY IF EXISTS "ch_challenges_write" ON ch_challenges;
CREATE POLICY "ch_challenges_write" ON ch_challenges
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── ch_challenge_entries ─────────────────────────────────────────
-- Tracks which user joined which challenge (prebuilt or custom)
CREATE TABLE IF NOT EXISTS ch_challenge_entries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- For prebuilt challenges, challenge_id stores the prebuilt ID string; challenge_ref is null
  challenge_ref  text,              -- prebuilt challenge ID (e.g. "seven-day-streak")
  challenge_id   uuid REFERENCES ch_challenges(id) ON DELETE CASCADE,
  joined_at      timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz,
  progress       integer NOT NULL DEFAULT 0,
  CONSTRAINT entry_has_challenge CHECK (
    (challenge_ref IS NOT NULL) OR (challenge_id IS NOT NULL)
  ),
  UNIQUE (user_id, challenge_ref),
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE ch_challenge_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ch_entries_owner" ON ch_challenge_entries;
CREATE POLICY "ch_entries_owner" ON ch_challenge_entries
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS ch_challenges_user ON ch_challenges (user_id);
CREATE INDEX IF NOT EXISTS ch_entries_user ON ch_challenge_entries (user_id);
CREATE INDEX IF NOT EXISTS ch_entries_ref ON ch_challenge_entries (challenge_ref) WHERE challenge_ref IS NOT NULL;
