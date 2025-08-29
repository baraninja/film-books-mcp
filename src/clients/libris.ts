import { httpGet } from '../http.js';

// Xsearch (JSON)
const XSEARCH = 'https://libris.kb.se/xsearch';
// OAI-PMH endpoint
const OAI = 'https://libris.kb.se/api/oaipmh/';

export interface LibrisSearchParams {
  // General search
  query?: string;
  // Structured search fields
  title?: string;
  author?: string;
  isbn?: string;
  issn?: string;
  publicationYear?: number;
  yearRange?: string;           // e.g., "2020-2023"
  publisher?: string;
  subject?: string;
  materialType?: 'book' | 'article' | 'thesis' | 'audiobook' | 'map' | 'music' | 'film';
  language?: 'swe' | 'eng' | 'dan' | 'nor' | 'fin' | 'ger' | 'fre' | 'spa';
  // API parameters
  n?: number;                   // number of results
  start?: number;               // start index
  format?: 'json' | 'marcxml' | 'mods' | 'rdf' | 'ris';
}

function buildLibrisQuery(params: LibrisSearchParams): string {
  const parts: string[] = [];
  
  // General query
  if (params.query) {
    parts.push(params.query);
  }
  
  // Structured searches using LIBRIS field syntax
  if (params.title) {
    parts.push(`title:(${params.title})`);
  }
  if (params.author) {
    parts.push(`author:(${params.author})`);
  }
  if (params.isbn) {
    parts.push(`isbn:${params.isbn.replace(/-/g, '')}`); // Remove hyphens
  }
  if (params.issn) {
    parts.push(`issn:${params.issn}`);
  }
  if (params.publicationYear) {
    parts.push(`year:${params.publicationYear}`);
  }
  if (params.yearRange) {
    const [from, to] = params.yearRange.split('-');
    if (from && to) {
      parts.push(`year:[${from} TO ${to}]`);
    }
  }
  if (params.publisher) {
    parts.push(`publisher:(${params.publisher})`);
  }
  if (params.subject) {
    parts.push(`subject:(${params.subject})`);
  }
  if (params.materialType) {
    // Map to LIBRIS material type codes
    const typeMap: Record<string, string> = {
      'book': 'Text',
      'article': 'Article',
      'thesis': 'Thesis',
      'audiobook': 'SoundRecording',
      'map': 'Cartographic',
      'music': 'Music',
      'film': 'MovingImage'
    };
    const librisType = typeMap[params.materialType];
    if (librisType) {
      parts.push(`@type:${librisType}`);
    }
  }
  if (params.language) {
    parts.push(`language:${params.language}`);
  }
  
  return parts.join(' AND ');
}

export async function xsearch(params: LibrisSearchParams): Promise<unknown> {
  const searchQuery = buildLibrisQuery(params);
  
  // Ensure we have at least some search criteria
  if (!searchQuery.trim()) {
    throw new Error('At least one search parameter must be provided');
  }
  
  const query: Record<string, string | number> = {
    query: searchQuery,
    format: params.format || 'json',
  };
  if (params.n) query.n = params.n;
  if (params.start) query.start = params.start;
  return httpGet(XSEARCH, { query });
}

export async function oaiListRecords(params: { metadataPrefix: string; from?: string; until?: string; set?: string; resumptionToken?: string }): Promise<string> {
  // OAI-PMH returns XML. We forward string XML (MCP will display as text).
  const query: Record<string, string> = {};
  if (params.resumptionToken) {
    query.verb = 'ListRecords';
    query.resumptionToken = params.resumptionToken;
  } else {
    query.verb = 'ListRecords';
    query.metadataPrefix = params.metadataPrefix;
    if (params.from) query.from = params.from;
    if (params.until) query.until = params.until;
    if (params.set) query.set = params.set;
  }
  return httpGet<string>(OAI, { query });
}