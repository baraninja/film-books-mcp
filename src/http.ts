import { errorLog } from './logger.js';

export type HttpOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  query?: Record<string, string | number | boolean | undefined>;
};

export async function httpGet<T = unknown>(baseUrl: string, opts: HttpOptions = {}): Promise<T> {
  const { headers = {}, timeoutMs = 20000, query = {} } = opts;
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    const ctype = res.headers.get('content-type') || '';
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${url} — ${body.substring(0, 400)}`);
    }
    if (ctype.includes('json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as T;
  } catch (err) {
    errorLog('GET failed', baseUrl, err);
    throw err;
  } finally {
    clearTimeout(t);
  }
}