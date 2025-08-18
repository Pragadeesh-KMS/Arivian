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
  publicationTypes?: string[];
  venue?: string;
}

export interface PaperAction {
  type: 'save' | 'read-later';
  paper: Paper;
  source: 'semantic-scholar' | 'arxiv';
}