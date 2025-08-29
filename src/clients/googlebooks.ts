import { CONFIG } from '../config.js';
import { httpGet } from '../http.js';

const BASE = 'https://www.googleapis.com/books/v1';

export interface GoogleBooksSearchParams {
  // General search
  q?: string;
  // Structured search fields
  intitle?: string;      // Search in title
  inauthor?: string;     // Search in author
  inpublisher?: string;  // Search in publisher
  subject?: string;      // Search by subject
  isbn?: string;         // Search by ISBN
  lccn?: string;         // Library of Congress Control Number
  oclc?: string;         // Online Computer Library Center number
  // API parameters
  startIndex?: number;
  maxResults?: number;
  langRestrict?: string;
  printType?: string;
  orderBy?: 'relevance' | 'newest';
}

function buildGoogleBooksQuery(params: GoogleBooksSearchParams): string {
  const parts: string[] = [];
  
  if (params.q) parts.push(params.q);
  if (params.intitle) parts.push(`intitle:"${params.intitle}"`);
  if (params.inauthor) parts.push(`inauthor:"${params.inauthor}"`);
  if (params.inpublisher) parts.push(`inpublisher:"${params.inpublisher}"`);
  if (params.subject) parts.push(`subject:"${params.subject}"`);
  if (params.isbn) parts.push(`isbn:${params.isbn}`);
  if (params.lccn) parts.push(`lccn:${params.lccn}`);
  if (params.oclc) parts.push(`oclc:${params.oclc}`);
  
  return parts.join(' ');
}

export async function searchVolumes(params: GoogleBooksSearchParams): Promise<unknown> {
  const searchQuery = buildGoogleBooksQuery(params);
  
  const query: Record<string, string | number | undefined> = {
    q: searchQuery,
    startIndex: params.startIndex,
    maxResults: params.maxResults,
    langRestrict: params.langRestrict,
    printType: params.printType,
    orderBy: params.orderBy
  };
  if (CONFIG.googleBooksKey) query.key = CONFIG.googleBooksKey;
  return httpGet(`${BASE}/volumes`, { query });
}

export async function getVolume(id: string): Promise<unknown> {
  const query: Record<string, string> = {};
  if (CONFIG.googleBooksKey) query.key = CONFIG.googleBooksKey;
  return httpGet(`${BASE}/volumes/${encodeURIComponent(id)}`, { query });
}