-- =====================================================
-- PAPERS - table, constraints, RLS and policies
-- =====================================================

-- extension (safe to run even if already present)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function used in CHECK constraint for UUID[] validation
CREATE OR REPLACE FUNCTION is_valid_uuid_array(uuids UUID[]) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT uuid) = cardinality(uuids)
    FROM unnest(uuids) AS uuid
    WHERE uuid IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create table
CREATE TABLE IF NOT EXISTS public.papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  urn TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  topic_tags TEXT[] NOT NULL,
  abstract TEXT NOT NULL,
  motive TEXT NOT NULL,
  completion_percentage INT NOT NULL DEFAULT 0,
  template TEXT NOT NULL,
  collaborators_needed INT NOT NULL,
  author_id UUID NOT NULL,
  collaborators UUID[] NOT NULL DEFAULT '{}',
  collaborators_authorized UUID[] DEFAULT '{}',
  content TEXT,
  is_public boolean NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT papers_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT valid_authorized_collaborators CHECK (
    collaborators_authorized = '{}' OR 
    (
      cardinality(collaborators_authorized) <= collaborators_needed 
      AND is_valid_uuid_array(collaborators_authorized)
    )
  )
);

ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authors can manage their papers" ON public.papers;
CREATE POLICY "Authors can manage their papers"
ON public.papers
FOR ALL
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Collaborators can view papers" ON public.papers;
CREATE POLICY "Collaborators can view papers"
ON public.papers
FOR SELECT
USING (
  auth.uid() = ANY(collaborators)
  AND (collaborators_authorized = '{}' OR auth.uid() = ANY(collaborators_authorized))
);

DROP POLICY IF EXISTS "Users can view their papers" ON public.papers;
CREATE POLICY "Users can view their papers"
ON public.papers
FOR SELECT
USING (auth.uid() = author_id OR auth.uid() = ANY(collaborators));

DROP POLICY IF EXISTS "Authors can update their papers" ON public.papers;
CREATE POLICY "Authors can update their papers"
ON public.papers
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "All authenticated users can view papers" ON public.papers;
CREATE POLICY "All authenticated users can view papers"
ON public.papers
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow joining as collaborator" ON public.papers;
CREATE POLICY "Allow joining as collaborator"
ON public.papers
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.uid() = ANY(collaborators));

DROP POLICY IF EXISTS "Authorized collaborators can join projects" ON public.papers;
CREATE POLICY "Authorized collaborators can join projects"
ON public.papers
FOR UPDATE
USING (
  auth.uid() = ANY(collaborators)
  AND (collaborators_authorized = '{}' OR auth.uid() = ANY(collaborators_authorized))
)
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable paper search for authenticated" ON public.papers;
CREATE POLICY "Enable paper search for authenticated"
ON public.papers
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Collaborators can update papers" ON public.papers;
CREATE POLICY "Collaborators can update papers"
ON public.papers
FOR UPDATE
TO public
USING (
  (auth.uid() = ANY (collaborators))
  OR (auth.uid() = author_id)
);
