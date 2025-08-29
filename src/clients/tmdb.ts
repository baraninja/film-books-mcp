import { CONFIG } from '../config.js';
import { httpGet } from '../http.js';

const BASE = 'https://api.themoviedb.org/3';

function authHeaders(): Record<string, string> {
  if (CONFIG.tmdbAccessToken) {
    return { Authorization: `Bearer ${CONFIG.tmdbAccessToken}` };
  }
  return {};
}

export async function searchMovie(params: { query: string; year?: number; language?: string; page?: number; includeAdult?: boolean }): Promise<unknown> {
  const query: Record<string, string | number | boolean | undefined> = {
    query: params.query,
    year: params.year,
    language: params.language,
    page: params.page,
    include_adult: params.includeAdult
  };
  if (!CONFIG.tmdbAccessToken && CONFIG.tmdbApiKey) query.api_key = CONFIG.tmdbApiKey;
  return httpGet(`${BASE}/search/movie`, { query, headers: authHeaders() });
}

export async function getMovie(id: number | string, appendToResponse?: string): Promise<unknown> {
  const query: Record<string, string | undefined> = {};
  if (appendToResponse) query.append_to_response = appendToResponse;
  if (!CONFIG.tmdbAccessToken && CONFIG.tmdbApiKey) query.api_key = CONFIG.tmdbApiKey;
  return httpGet(`${BASE}/movie/${id}`, { query, headers: authHeaders() });
}