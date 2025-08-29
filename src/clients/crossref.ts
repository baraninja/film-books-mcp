import { CONFIG } from '../config.js';
import { httpGet } from '../http.js';

const BASE = 'https://api.crossref.org';

function baseHeaders() {
  const ua = CONFIG.userAgentExtra || 'books-film-mcp';
  const headers: Record<string, string> = { 'User-Agent': ua };
  return headers;
}

export interface CrossrefSearchParams {
  // General search
  query?: string;
  filter?: string;
  // Structured searches
  queryTitle?: string;          // query.title
  queryAuthor?: string;         // query.author
  queryContainerTitle?: string; // query.container-title
  queryPublisher?: string;      // query.publisher
  querySubject?: string;        // query.subject
  // Date filters
  fromPubDate?: string;        // from-pub-date (YYYY-MM-DD)
  untilPubDate?: string;       // until-pub-date (YYYY-MM-DD)
  fromIndexDate?: string;      // from-index-date
  untilIndexDate?: string;     // until-index-date
  // Type filters
  type?: 'journal-article' | 'book-chapter' | 'book' | 'proceedings-article' | 'reference-entry' | 'journal' | 'component';
  // Other filters
  hasOrcid?: boolean;          // has-orcid
  hasFullText?: boolean;       // has-full-text
  hasReferences?: boolean;     // has-references
  hasAbstract?: boolean;       // has-abstract
  // API parameters
  rows?: number;
  offset?: number;
  sort?: 'relevance' | 'score' | 'updated' | 'deposited' | 'indexed' | 'published' | 'published-print' | 'published-online';
  order?: 'asc' | 'desc';
}

function buildCrossrefQuery(params: CrossrefSearchParams): Record<string, string | number | undefined> {
  const query: Record<string, string | number | undefined> = {
    mailto: CONFIG.crossrefMailto
  };
  
  // General query and filter
  if (params.query) query.query = params.query;
  if (params.filter) query.filter = params.filter;
  
  // Structured queries
  if (params.queryTitle) query['query.title'] = params.queryTitle;
  if (params.queryAuthor) query['query.author'] = params.queryAuthor;
  if (params.queryContainerTitle) query['query.container-title'] = params.queryContainerTitle;
  if (params.queryPublisher) query['query.publisher'] = params.queryPublisher;
  if (params.querySubject) query['query.subject'] = params.querySubject;
  
  // Date filters
  if (params.fromPubDate) query['from-pub-date'] = params.fromPubDate;
  if (params.untilPubDate) query['until-pub-date'] = params.untilPubDate;
  if (params.fromIndexDate) query['from-index-date'] = params.fromIndexDate;
  if (params.untilIndexDate) query['until-index-date'] = params.untilIndexDate;
  
  // Build filter string for boolean parameters
  const filters: string[] = [];
  if (params.filter) filters.push(params.filter);
  if (params.type) filters.push(`type:${params.type}`);
  if (params.hasOrcid !== undefined) filters.push(`has-orcid:${params.hasOrcid}`);
  if (params.hasFullText !== undefined) filters.push(`has-full-text:${params.hasFullText}`);
  if (params.hasReferences !== undefined) filters.push(`has-references:${params.hasReferences}`);
  if (params.hasAbstract !== undefined) filters.push(`has-abstract:${params.hasAbstract}`);
  
  if (filters.length > 0) {
    query.filter = filters.join(',');
  }
  
  // API parameters
  if (params.rows) query.rows = params.rows;
  if (params.offset) query.offset = params.offset;
  if (params.sort) query.sort = params.sort;
  if (params.order) query.order = params.order;
  
  return query;
}

export async function searchWorks(params: CrossrefSearchParams): Promise<unknown> {
  const query = buildCrossrefQuery(params);
  return httpGet(`${BASE}/works`, { query, headers: baseHeaders() });
}

export async function getWorkByDoi(doi: string): Promise<unknown> {
  const url = `${BASE}/works/${encodeURIComponent(doi)}`;
  const query: Record<string, string | undefined> = { mailto: CONFIG.crossrefMailto };
  return httpGet(url, { query, headers: baseHeaders() });
}