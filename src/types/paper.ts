export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  url: string;
  pdfUrl?: string;
  fieldsOfStudy: string[];
  citationCount: number;
  influentialCitationCount: number;
  publicationTypes?: string[];
  venue?: string;
  source?: 'semantic-scholar' | 'arxiv';
  tags?: string[];
  externalIds?: {
    [key: string]: string;
  };
}

export interface PaperAction {
  type: 'save' | 'read-later';
  paper: Paper;
  source: 'semantic-scholar' | 'arxiv';
}