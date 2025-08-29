import { httpGet } from '../http.js';

const BASE = 'https://api.openalex.org';

export interface OpenAlexSearchParams {
  // General search
  search?: string;
  filter?: string;
  // Structured filters
  authorId?: string;
  institutionId?: string;
  conceptId?: string;
  publicationYear?: number;
  publicationYearRange?: string; // e.g., "2020-2023"
  isOa?: boolean;               // open access only
  hasFulltext?: boolean;        // has fulltext available
  journalId?: string;
  type?: 'article' | 'book-chapter' | 'book' | 'dataset' | 'preprint' | 'review' | 'editorial';
  language?: string;            // ISO 639-1 code
  citedByCount?: string;        // e.g., ">100" or "50-200"
  // API parameters
  perPage?: number;
  page?: number;
  sort?: 'cited_by_count:desc' | 'publication_date:desc' | 'relevance_score:desc';
}

function buildOpenAlexFilter(params: OpenAlexSearchParams): string | undefined {
  const filters: string[] = [];
  
  // Add existing filter if provided
  if (params.filter) {
    filters.push(params.filter);
  }
  
  // Build structured filters
  if (params.authorId) {
    filters.push(`authorships.author.id:${params.authorId}`);
  }
  if (params.institutionId) {
    filters.push(`authorships.institutions.id:${params.institutionId}`);
  }
  if (params.conceptId) {
    filters.push(`concepts.id:${params.conceptId}`);
  }
  if (params.publicationYear) {
    filters.push(`publication_year:${params.publicationYear}`);
  }
  if (params.publicationYearRange) {
    const [from, to] = params.publicationYearRange.split('-');
    if (from && to) {
      filters.push(`publication_year:${from}-${to}`);
    }
  }
  if (params.isOa !== undefined) {
    filters.push(`is_oa:${params.isOa}`);
  }
  if (params.hasFulltext !== undefined) {
    filters.push(`has_fulltext:${params.hasFulltext}`);
  }
  if (params.journalId) {
    filters.push(`primary_location.source.id:${params.journalId}`);
  }
  if (params.type) {
    filters.push(`type:${params.type}`);
  }
  if (params.language) {
    filters.push(`language:${params.language}`);
  }
  if (params.citedByCount) {
    filters.push(`cited_by_count:${params.citedByCount}`);
  }
  
  return filters.length > 0 ? filters.join(',') : undefined;
}

export async function searchWorks(params: OpenAlexSearchParams): Promise<unknown> {
  const filter = buildOpenAlexFilter(params);
  
  const query: Record<string, string | number | undefined> = {
    search: params.search,
    filter,
    per_page: params.perPage,
    page: params.page,
    sort: params.sort
  };
  return httpGet(`${BASE}/works`, { query });
}

export async function getWork(idOrOpenAlexId: string): Promise<unknown> {
  // Accept both raw IDs (Wxxxxxx) or full URIs
  const id = idOrOpenAlexId.startsWith('http') ? idOrOpenAlexId : `${BASE}/works/${idOrOpenAlexId}`;
  return httpGet(id);
}