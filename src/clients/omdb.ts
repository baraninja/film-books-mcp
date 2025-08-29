import { CONFIG } from '../config.js';
import { httpGet } from '../http.js';

const BASE = 'https://www.omdbapi.com/';

function requireKey() {
  if (!CONFIG.omdbApiKey) throw new Error('OMDb requires OMDB_API_KEY');
  return CONFIG.omdbApiKey;
}

export async function search(params: { title: string; year?: number; type?: 'movie' | 'series' | 'episode'; page?: number }): Promise<unknown> {
  const query: Record<string, string | number | undefined> = {
    apikey: requireKey(),
    s: params.title,
    y: params.year,
    type: params.type,
    page: params.page
  };
  return httpGet(BASE, { query });
}

export async function byId(params: { imdbId?: string; title?: string; year?: number; plot?: 'short' | 'full' }): Promise<unknown> {
  const query: Record<string, string | number | undefined> = {
    apikey: requireKey(),
    i: params.imdbId,
    t: params.title,
    y: params.year,
    plot: params.plot
  };
  return httpGet(BASE, { query });
}