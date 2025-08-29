import { CONFIG } from '../config.js';
import { httpGet } from '../http.js';

const BASE = 'https://www.googleapis.com/books/v1';

export async function searchVolumes(params: { q: string; startIndex?: number; maxResults?: number; langRestrict?: string; printType?: string; orderBy?: 'relevance' | 'newest' }): Promise<unknown> {
  const query: Record<string, string | number | undefined> = {
    q: params.q,
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