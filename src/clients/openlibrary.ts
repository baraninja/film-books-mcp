import { httpGet } from '../http.js';

const BASE = 'https://openlibrary.org';

export async function searchOpenLibrary(params: {
  q?: string;
  title?: string;
  author?: string;
  page?: number;
  limit?: number;
  fields?: string;
  sort?: string;
  lang?: string; // ISO 639-1
}): Promise<unknown> {
  const query: Record<string, string | number | undefined> = {};
  if (params.q) query.q = params.q;
  if (params.title) query.title = params.title;
  if (params.author) query.author = params.author;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.fields) query.fields = params.fields;
  if (params.sort) query.sort = params.sort;
  if (params.lang) query.lang = params.lang;
  return httpGet(`${BASE}/search.json`, { query });
}

export async function getWork(olid: string): Promise<unknown> {
  // OL Work IDs are in the form OLxxxxxW; endpoint returns JSON
  const key = olid.startsWith('/works/') ? olid : `/works/${olid}`;
  return httpGet(`${BASE}${key}.json`);
}

export async function getEdition(olid: string): Promise<unknown> {
  const key = olid.startsWith('/books/') ? olid : `/books/${olid}`;
  return httpGet(`${BASE}${key}.json`);
}