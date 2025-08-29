import { httpGet } from '../http.js';

const BASE = 'https://api.openalex.org';

export async function searchWorks(params: { search?: string; filter?: string; perPage?: number; page?: number }): Promise<unknown> {
  const query: Record<string, string | number | undefined> = {
    search: params.search,
    filter: params.filter,
    per_page: params.perPage,
    page: params.page
  };
  return httpGet(`${BASE}/works`, { query });
}

export async function getWork(idOrOpenAlexId: string): Promise<unknown> {
  // Accept both raw IDs (Wxxxxxx) or full URIs
  const id = idOrOpenAlexId.startsWith('http') ? idOrOpenAlexId : `${BASE}/works/${idOrOpenAlexId}`;
  return httpGet(id);
}