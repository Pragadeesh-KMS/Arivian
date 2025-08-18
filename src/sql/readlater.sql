-- TABLE: read_later
CREATE TABLE read_later (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) NOT NULL,
  paper_id TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[],
  url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('semantic-scholar', 'arxiv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT read_later_unique_user_paper UNIQUE (user_id, paper_id)
);

-- Indexes
CREATE INDEX idx_read_later_user_id ON read_later(user_id);
CREATE INDEX idx_read_later_paper_id ON read_later(paper_id);

-- RLS
ALTER TABLE read_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can manage their read later papers"
ON read_later
FOR ALL
USING (auth.uid() = user_id);
