-- =====================================================
-- PROFILES - table, RLS and policies
-- =====================================================

-- extension (safe to run even if already present)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_no TEXT,
  profession TEXT,
  university TEXT,
  portfolio_link TEXT,
  research_papers JSONB,
  topic1 TEXT,
  topic2 TEXT,
  topic3 TEXT,
  topic4 TEXT,
  topic5 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- DROP & CREATE policies (idempotent)
DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
CREATE POLICY "Users can manage their own profiles"
ON public.profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Collaborators can see each other's names" ON public.profiles;
CREATE POLICY "Collaborators can see each other's names"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.papers
    WHERE (
      (auth.uid() = public.papers.author_id AND user_id = ANY(public.papers.collaborators)) OR
      (auth.uid() = ANY(public.papers.collaborators) AND user_id = public.papers.author_id) OR
      (auth.uid() = ANY(public.papers.collaborators) AND user_id = ANY(public.papers.collaborators))
    )
  )
);

DROP POLICY IF EXISTS "Enable email access for authenticated users" ON public.profiles;
CREATE POLICY "Enable email access for authenticated users"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable email read for authenticated users" ON public.profiles;
CREATE POLICY "Enable email read for authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public profile read" ON public.profiles;
CREATE POLICY "Allow public profile read"
ON public.profiles
FOR SELECT
TO public
USING (auth.role() = 'authenticated'::text);

DROP POLICY IF EXISTS "Enable profile email access" ON public.profiles;
CREATE POLICY "Enable profile email access"
ON public.profiles
FOR SELECT
TO public
USING (auth.role() = 'authenticated'::text);
