import { supabase } from '../lib/supabase';

interface PaperData {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  url: string;
  source: 'semantic_scholar' | 'arxiv';
}

export const saveInterestPaper = async (paper: PaperData, userId: string) => {
  const { data, error } = await supabase
    .from('interest_papers')
    .insert([
      {
        user_id: userId,
        paper_id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        url: paper.url,
        source: paper.source
      }
    ]);

  return { data, error };
};

export const saveReadLaterPaper = async (paper: PaperData, userId: string) => {
  const { data, error } = await supabase
    .from('read_later_papers')
    .insert([
      {
        user_id: userId,
        paper_id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        url: paper.url,
        source: paper.source
      }
    ]);

  return { data, error };
};