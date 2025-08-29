// Utility functions for formatting and summarizing API responses

interface OpenAlexWork {
  id?: string;
  doi?: string;
  title?: string;
  display_name?: string;
  publication_year?: number;
  publication_date?: string;
  cited_by_count?: number;
  is_oa?: boolean;
  authorships?: Array<{
    author?: {
      display_name?: string;
      id?: string;
    };
  }>;
  primary_location?: {
    source?: {
      display_name?: string;
      type?: string;
    };
  };
  abstract_inverted_index?: Record<string, number[]>;
  concepts?: Array<{
    display_name?: string;
    score?: number;
  }>;
  open_access?: {
    is_oa?: boolean;
    oa_url?: string;
  };
  language?: string;
  type?: string;
}

interface CrossrefWork {
  DOI?: string;
  title?: string[];
  author?: Array<{
    given?: string;
    family?: string;
  }>;
  'published-print'?: {
    'date-parts'?: number[][];
  };
  'published-online'?: {
    'date-parts'?: number[][];
  };
  'is-referenced-by-count'?: number;
  'container-title'?: string[];
  publisher?: string;
  type?: string;
  abstract?: string;
  subject?: string[];
  URL?: string;
}

function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  const words: Array<{ word: string; position: number }> = [];
  
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push({ word, position: pos });
    }
  }
  
  // Sort by position and join
  words.sort((a, b) => a.position - b.position);
  const abstract = words.map(w => w.word).join(' ');
  
  // Limit abstract length
  return abstract.length > 300 ? abstract.substring(0, 300) + '...' : abstract;
}

export function summarizeOpenAlexWork(work: OpenAlexWork) {
  const authors = work.authorships?.slice(0, 3).map(a => a.author?.display_name).filter(Boolean) || [];
  const authorsText = authors.length > 0 ? authors.join(', ') + (work.authorships && work.authorships.length > 3 ? ' et al.' : '') : 'Unknown authors';
  
  let abstract = '';
  if (work.abstract_inverted_index) {
    abstract = reconstructAbstract(work.abstract_inverted_index);
  }

  const topConcepts = work.concepts?.filter(c => c.score && c.score > 0.3).slice(0, 3).map(c => c.display_name) || [];

  return {
    title: work.display_name || work.title || 'Untitled',
    authors: authorsText,
    year: work.publication_year,
    publication_date: work.publication_date,
    doi: work.doi,
    citations: work.cited_by_count || 0,
    open_access: work.is_oa || work.open_access?.is_oa || false,
    open_access_url: work.open_access?.oa_url,
    journal: work.primary_location?.source?.display_name,
    source_type: work.primary_location?.source?.type,
    abstract: abstract,
    type: work.type,
    language: work.language,
    concepts: topConcepts,
    openalex_id: work.id,
    url: work.doi ? `https://doi.org/${work.doi}` : undefined
  };
}

export function summarizeCrossrefWork(work: CrossrefWork) {
  const authors = work.author?.slice(0, 3).map(a => 
    `${a.given || ''} ${a.family || ''}`.trim()
  ).filter(name => name.length > 0) || [];
  const authorsText = authors.length > 0 ? authors.join(', ') + (work.author && work.author.length > 3 ? ' et al.' : '') : 'Unknown authors';

  // Get publication year from either print or online publication
  let year: number | undefined;
  const printDate = work['published-print']?.['date-parts']?.[0];
  const onlineDate = work['published-online']?.['date-parts']?.[0];
  if (printDate && printDate[0]) year = printDate[0];
  else if (onlineDate && onlineDate[0]) year = onlineDate[0];

  const title = Array.isArray(work.title) ? work.title[0] : work.title;
  const journal = Array.isArray(work['container-title']) ? work['container-title'][0] : work['container-title'];
  const subjects = work.subject?.slice(0, 3) || [];

  let abstract = work.abstract || '';
  if (abstract.length > 300) {
    abstract = abstract.substring(0, 300) + '...';
  }

  return {
    title: title || 'Untitled',
    authors: authorsText,
    year: year,
    doi: work.DOI,
    citations: work['is-referenced-by-count'] || 0,
    journal: journal,
    publisher: work.publisher,
    type: work.type,
    abstract: abstract,
    subjects: subjects,
    url: work.DOI ? `https://doi.org/${work.DOI}` : work.URL,
    crossref_url: work.URL
  };
}

export function formatOpenAlexResponse(response: any, summaryMode: boolean = true) {
  if (!response || !response.results) {
    return response;
  }

  if (!summaryMode) {
    return response; // Return full response
  }

  const summarizedResults = response.results.map((work: OpenAlexWork) => summarizeOpenAlexWork(work));
  
  return {
    meta: {
      count: response.meta?.count || 0,
      db_response_time_ms: response.meta?.db_response_time_ms,
      page: response.meta?.page || 1,
      per_page: response.meta?.per_page || 25,
      summary_mode: true
    },
    results: summarizedResults
  };
}

export function formatCrossrefResponse(response: any, summaryMode: boolean = true) {
  if (!response || !response.message || !response.message.items) {
    return response;
  }

  if (!summaryMode) {
    return response; // Return full response
  }

  const summarizedResults = response.message.items.map((work: CrossrefWork) => summarizeCrossrefWork(work));
  
  return {
    status: response.status,
    message: {
      total_results: response.message['total-results'] || 0,
      items_per_page: response.message['items-per-page'] || 20,
      query: response.message.query,
      summary_mode: true,
      items: summarizedResults
    }
  };
}

// Generic formatter for better readability
export function formatSearchResults(results: any, source: string): string {
  if (!results) return `No results from ${source}`;

  const header = `\n=== ${source.toUpperCase()} RESULTS ===\n`;
  
  try {
    let formatted = '';
    
    if (source === 'OpenAlex' && results.results) {
      const meta = results.meta || {};
      formatted += `Found ${meta.count || results.results.length} results (${meta.db_response_time_ms || 'unknown'}ms)\n\n`;
      
      results.results.slice(0, 5).forEach((item: any, index: number) => {
        formatted += `${index + 1}. ${item.title || 'Untitled'}\n`;
        formatted += `   Authors: ${item.authors || 'Unknown'}\n`;
        if (item.year) formatted += `   Year: ${item.year}\n`;
        if (item.journal) formatted += `   Journal: ${item.journal}\n`;
        formatted += `   Citations: ${item.citations || 0} | Open Access: ${item.open_access ? 'Yes' : 'No'}\n`;
        if (item.doi) formatted += `   DOI: ${item.doi}\n`;
        if (item.abstract && item.abstract.length > 0) {
          formatted += `   Abstract: ${item.abstract}\n`;
        }
        formatted += '\n';
      });
    } else if (source === 'Crossref' && results.message && results.message.items) {
      const message = results.message;
      formatted += `Found ${message.total_results || message.items.length} results\n\n`;
      
      message.items.slice(0, 5).forEach((item: any, index: number) => {
        formatted += `${index + 1}. ${item.title || 'Untitled'}\n`;
        formatted += `   Authors: ${item.authors || 'Unknown'}\n`;
        if (item.year) formatted += `   Year: ${item.year}\n`;
        if (item.journal) formatted += `   Journal: ${item.journal}\n`;
        formatted += `   Citations: ${item.citations || 0}\n`;
        if (item.doi) formatted += `   DOI: ${item.doi}\n`;
        if (item.abstract && item.abstract.length > 0) {
          formatted += `   Abstract: ${item.abstract}\n`;
        }
        formatted += '\n';
      });
    } else {
      // Fallback to JSON for other sources
      formatted = JSON.stringify(results, null, 2);
    }
    
    return header + formatted;
  } catch (error) {
    return header + JSON.stringify(results, null, 2);
  }
}