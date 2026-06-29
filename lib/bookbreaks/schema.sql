-- BookBreaks tables for michaelojekunle.dev
-- Run this in the Supabase SQL editor before using BookBreaks.

-- ── Books ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bb_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  insights TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  theme TEXT NOT NULL DEFAULT 'custom',
  genres TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  read_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, title, author)
);

-- ── Generated Content ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bb_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES bb_books(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'blog',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  published_url TEXT,
  regenerate_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── User Settings ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bb_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL DEFAULT 'www.michaelojekunle.dev',
  default_theme TEXT NOT NULL DEFAULT 'custom',
  default_platforms TEXT[] NOT NULL DEFAULT ARRAY['blog', 'x', 'instagram'],
  ai_provider TEXT NOT NULL DEFAULT 'auto',
  default_tone TEXT NOT NULL DEFAULT 'educational',
  default_word_count INTEGER NOT NULL DEFAULT 1500,
  seo_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  newsletter_cta TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE bb_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_settings ENABLE ROW LEVEL SECURITY;

-- Books: users see only their own rows
CREATE POLICY bb_books_user_policy ON bb_books
  FOR ALL USING (auth.uid() = user_id);

-- Content: users see only their own rows
CREATE POLICY bb_content_user_policy ON bb_generated_content
  FOR ALL USING (auth.uid() = user_id);

-- Settings: users see only their own row
CREATE POLICY bb_settings_user_policy ON bb_settings
  FOR ALL USING (auth.uid() = user_id);

-- ── Auto-update updated_at ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bb_books_updated_at
  BEFORE UPDATE ON bb_books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bb_content_updated_at
  BEFORE UPDATE ON bb_generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bb_settings_updated_at
  BEFORE UPDATE ON bb_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
