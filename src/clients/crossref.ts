import { CONFIG } from '../config.js';
import { httpGet } from '../http.js';

const BASE = 'https://api.crossref.org';

function baseHeaders() {
  const ua = CONFIG.userAgentExtra || 'books-film-mcp';
  const headers: Record<string, string> = { 'User-Agent': ua };
  return headers;
}

export async function searchWorks(params: { query?: string; filter?: string; rows?: number; offset?: number }): Promise<unknown> {
  const query: Record<string, string | number | undefined> = {
    query: params.query,
    filter: params.filter,
    rows: params.rows,
    offset: params.offset,
    mailto: CONFIG.crossrefMailto
  };
  return httpGet(`${BASE}/works`, { query, headers: baseHeaders() });
}

export async function getWorkByDoi(doi: string): Promise<unknown> {
  const url = `${BASE}/works/${encodeURIComponent(doi)}`;
  const query: Record<string, string | undefined> = { mailto: CONFIG.crossrefMailto };
  return httpGet(url, { query, headers: baseHeaders() });
}