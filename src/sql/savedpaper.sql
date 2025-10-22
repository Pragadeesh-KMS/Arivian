-- TABLE: saved_papers
CREATE TABLE saved_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) NOT NULL,
  paper_id TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[],
  published TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('semantic-scholar', 'arxiv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_paper UNIQUE (user_id, paper_id)
);

-- Indexes
CREATE INDEX idx_saved_papers_user_id ON saved_papers(user_id);
CREATE INDEX idx_saved_papers_paper_id ON saved_papers(paper_id);

-- RLS
ALTER TABLE saved_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can manage their saved papers"
ON saved_papers
FOR ALL
USING (auth.uid() = user_id);

ALTER TABLE saved_papers 
ADD COLUMN tags TEXT[] DEFAULT '{}';

ALTER TABLE IF EXISTS saved_papers 
ADD COLUMN IF NOT EXISTS published TEXT;