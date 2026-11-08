CREATE TABLE vision_board (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  intro_html TEXT,
  cards JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE vision_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vision board"
  ON vision_board FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vision board"
  ON vision_board FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision board"
  ON vision_board FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vision board"
  ON vision_board FOR DELETE
  USING (auth.uid() = user_id);
