export interface ArXivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  updated: string;
  url: string;
  pdfUrl: string;
  categories: string[];
  primaryCategory: string;
}

const BASE_URL = 'https://export.arxiv.org/api/query';

function parseXmlResponse(xmlText: string): ArXivPaper[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const entries = xmlDoc.querySelectorAll('entry');

  const papers: ArXivPaper[] = [];

  entries.forEach(entry => {
    const id = entry.querySelector('id')?.textContent?.replace('http://arxiv.org/abs/', '') || '';
    const title = entry.querySelector('title')?.textContent?.trim().replace(/\s+/g, ' ') || '';
    const abstract = entry.querySelector('summary')?.textContent?.trim().replace(/\s+/g, ' ') || '';
    const published = entry.querySelector('published')?.textContent || '';
    const updated = entry.querySelector('updated')?.textContent || '';

    const authorElements = entry.querySelectorAll('author name');
    const authors: string[] = [];
    authorElements.forEach(author => {
      const name = author.textContent?.trim();
      if (name) authors.push(name);
    });

    const categoryElements = entry.querySelectorAll('category');
    const categories: string[] = [];
    let primaryCategory = '';
    categoryElements.forEach((cat, index) => {
      const term = cat.getAttribute('term');
      if (term) {
        categories.push(term);
        if (index === 0) primaryCategory = term;
      }
    });

    const links = entry.querySelectorAll('link');
    let pdfUrl = '';
    links.forEach(link => {
      if (link.getAttribute('type') === 'application/pdf') {
        pdfUrl = link.getAttribute('href') || '';
      }
    });
    if (!pdfUrl) {
      pdfUrl = `http://arxiv.org/pdf/${id}.pdf`;
    }

    papers.push({
      id,
      title,
      authors,
      abstract,
      published,
      updated,
      url: `https://arxiv.org/abs/${id}`,
      pdfUrl,
      categories,
      primaryCategory,
    });
  });

  return papers;
}

export const getRecentDaysPapers = async (topic: string, maxResults: number = 12): Promise<ArXivPaper[]> => {
  const end = new Date();
  end.setDate(end.getDate() - 1); 
  const start = new Date();
  start.setDate(start.getDate() - 3);

  const startStr = start.toISOString().split('T')[0].replace(/-/g, '');
  const endStr = end.toISOString().split('T')[0].replace(/-/g, '');

  const params: Record<string, string> = {
    search_query: `all:${topic} AND submittedDate:[${startStr}000000 TO ${endStr}235959]`,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: 'relevance',
    sortOrder: 'descending',
  };

  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}?${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status}`);
    }
    const xmlText = await response.text();
    return parseXmlResponse(xmlText);
  } catch (error) {
    console.error('Error fetching yesterday\'s papers from ArXiv:', error);
    throw error;
  }
};

export const searchArXivPapers = async (query: string, maxResults: number = 15, year?: string): Promise<ArXivPaper[]> => {
  const params: Record<string, string> = {
    search_query: `all:${query}`,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: 'relevance',
    sortOrder: 'descending',
  };

  if (year) {
    let arxivYearFilter = '';
    if (year.includes('-')) {
      const [startYear, endYearRaw] = year.split('-');
      const endYear = endYearRaw && endYearRaw.trim().length > 0
        ? endYearRaw
        : `${new Date().getFullYear()}`;
      arxivYearFilter = ` AND submittedDate:[${startYear}01010000 TO ${endYear}12312359]`;
    } else {
      arxivYearFilter = ` AND submittedDate:[${year}01010000 TO ${year}12312359]`;
    }
    params.search_query += arxivYearFilter;
  }

  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}?${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status}`);
    }
    const xmlText = await response.text();
    return parseXmlResponse(xmlText);
  } catch (error) {
    console.error('Error fetching papers from ArXiv:', error);
    throw error;
  }
};