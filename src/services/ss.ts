import { Paper } from '../types/paper';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export const searchRelevantPapers = async (
  query: string, 
  maxResults: number = 15,
  year?: string
): Promise<Paper[]> => {
  const params: any = {
    query,
    limit: maxResults.toString(),
    fields: 'paperId,title,abstract,authors,year,url,openAccessPdf,fieldsOfStudy,citationCount,publicationTypes,influentialCitationCount',
    fieldsOfStudy: 'Computer Science',
    publicationTypes: 'JournalArticle,Conference',
    sort: 'citationCount:desc',
  };

  if (year) {
    params.year = year;
  }

  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/paper/search?${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Semantic Scholar API error: ${response.status}`);
    }
    const data = await response.json();
    return data.data.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract || '',
      authors: paper.authors.map((a: any) => a.name),
      published: paper.year ? `${paper.year}` : '',
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      pdfUrl: paper.openAccessPdf?.url,
      fieldsOfStudy: paper.fieldsOfStudy || [],
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      publicationTypes: paper.publicationTypes || [],
      venue: paper.venue || '',
      source: 'semantic-scholar',
    }));
  } catch (error) {
    console.error('Error fetching papers from Semantic Scholar (relevance):', error);
    throw error;
  }
};

export const searchBulkPapers = async (
  query: string, 
  maxResults: number = 15, 
  year?: string
): Promise<Paper[]> => {
  const params: any = {
    query,
    limit: maxResults.toString(),
    fields: 'paperId,title,abstract,authors,year,url,openAccessPdf,fieldsOfStudy,citationCount,influentialCitationCount,publicationTypes,venue',
    fieldsOfStudy: 'Computer Science',
    publicationTypes: 'JournalArticle,Conference',
    sort: 'citationCount:desc',
  };

  if (year) {
    params.year = year;
  }

  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/paper/search/bulk?${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Semantic Scholar API error: ${response.status}`);
    }
    const data = await response.json();
    return data.data.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract || '',
      authors: paper.authors.map((a: any) => a.name),
      published: paper.year ? `${paper.year}` : '',
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      pdfUrl: paper.openAccessPdf?.url,
      fieldsOfStudy: paper.fieldsOfStudy || [],
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      publicationTypes: paper.publicationTypes || [],
      venue: paper.venue || '',
      source: 'semantic-scholar',
    }));    
  } catch (error) {
    console.error('Error fetching papers from Semantic Scholar (bulk):', error);
    throw error;
  }
};

export const getPaperRecommendations = async (paperId: string, source: 'semantic-scholar' | 'arxiv', limit: number = 15): Promise<Paper[]> => {
  let formattedId = paperId;
  if (source === 'arxiv' && !paperId.startsWith('arXiv:')) {
    formattedId = `arXiv:${paperId}`;
  } else if (source === 'semantic-scholar' && paperId.startsWith('arXiv:')) {
    formattedId = paperId.replace('arXiv:', '');
  }
  
  const url = `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${formattedId}?fields=title,url,abstract,year,venue,citationCount,authors,publicationTypes&limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Semantic Scholar API error: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.recommendedPapers || data.recommendedPapers.length === 0) {
      throw new Error('No recommendations found');
    }
    
    return data.recommendedPapers.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract || '',
      authors: paper.authors?.map((a: any) => a.name) || [],
      published: paper.year ? `${paper.year}` : '',
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      pdfUrl: paper.openAccessPdf?.url,
      fieldsOfStudy: paper.fieldsOfStudy || [],
      citationCount: paper.citationCount || 0,
      publicationTypes: paper.publicationTypes || [],
      venue: paper.venue || '',
      source: paper.openAccessPdf?.url ? 'arxiv' : 'semantic-scholar',
    }));
  } catch (error) {
    console.error('Error fetching paper recommendations:', error);
    throw error;
  }
};