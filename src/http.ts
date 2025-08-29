import { errorLog } from './logger.js';

export type HttpOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  query?: Record<string, string | number | boolean | undefined>;
  retries?: number;
  retryDelayMs?: number;
};

// Rate limiting utilities
class SimpleRateLimit {
  private requests: number[] = [];
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async checkLimit(): Promise<void> {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

// Simple in-memory cache
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  
  constructor(private ttlMs: number = 60 * 60 * 1000) {} // Default 1 hour
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  
  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    // Simple cleanup: remove expired entries periodically
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const httpCache = new SimpleCache<unknown>();

// Rate limiters for different APIs
const rateLimiters = new Map<string, SimpleRateLimit>();

function getRateLimiter(baseUrl: string): SimpleRateLimit | null {
  // Extract domain for rate limiting
  const domain = new URL(baseUrl).hostname;
  
  // Define rate limits for known APIs
  const rateLimits: Record<string, { requests: number; windowMs: number }> = {
    'api.crossref.org': { requests: 50, windowMs: 60000 }, // 50/min for polite pool
    'www.googleapis.com': { requests: 100, windowMs: 60000 }, // Conservative for Google Books
    'api.openalex.org': { requests: 1000, windowMs: 60000 }, // Very generous
    'www.omdbapi.com': { requests: 100, windowMs: 60000 }, // Conservative
    'api.themoviedb.org': { requests: 40, windowMs: 60000 }, // Per TMDb docs
    'libris.kb.se': { requests: 60, windowMs: 60000 } // Conservative for LIBRIS
  };
  
  const limit = rateLimits[domain];
  if (!limit) return null;
  
  if (!rateLimiters.has(domain)) {
    rateLimiters.set(domain, new SimpleRateLimit(limit.requests, limit.windowMs));
  }
  
  return rateLimiters.get(domain)!;
}

function isRetryableError(error: unknown, status?: number): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  
  // HTTP status codes that should be retried
  if (status && [408, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }
  
  return false;
}

export async function httpGet<T = unknown>(baseUrl: string, opts: HttpOptions = {}): Promise<T> {
  const { 
    headers = {}, 
    timeoutMs = 20000, 
    query = {}, 
    retries = 2,
    retryDelayMs = 1000
  } = opts;
  
  // Build URL with query parameters
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  
  const fullUrl = url.toString();
  
  // Check cache first (for GET requests with no dynamic headers)
  if (Object.keys(headers).length === 0 || (Object.keys(headers).length === 1 && headers['User-Agent'])) {
    const cached = httpCache.get(fullUrl) as T;
    if (cached !== null) {
      return cached;
    }
  }
  
  // Check rate limits
  const rateLimiter = getRateLimiter(baseUrl);
  if (rateLimiter) {
    await rateLimiter.checkLimit();
  }
  
  let lastError: Error | undefined;
  
  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      const ctype = res.headers.get('content-type') || '';
      
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const error = new Error(`HTTP ${res.status} ${res.statusText} — ${url} — ${body.substring(0, 400)}`);
        
        // Check if we should retry this error
        if (attempt < retries && isRetryableError(error, res.status)) {
          errorLog(`GET attempt ${attempt + 1} failed, retrying`, baseUrl, res.status);
          lastError = error;
          clearTimeout(timeout);
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, retryDelayMs * Math.pow(2, attempt)));
          continue;
        }
        
        throw error;
      }
      
      let result: T;
      if (ctype.includes('json')) {
        result = (await res.json()) as T;
      } else {
        result = (await res.text()) as T;
      }
      
      // Cache successful responses (avoid caching very large responses)
      const resultSize = JSON.stringify(result).length;
      if (resultSize < 100000) { // Less than 100KB
        httpCache.set(fullUrl, result);
      }
      
      return result;
      
    } catch (err) {
      lastError = err as Error;
      
      // Check if we should retry this error
      if (attempt < retries && isRetryableError(err)) {
        errorLog(`GET attempt ${attempt + 1} failed, retrying`, baseUrl, err);
        clearTimeout(timeout);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelayMs * Math.pow(2, attempt)));
        continue;
      }
      
      // Last attempt failed
      clearTimeout(timeout);
      errorLog('GET failed after all retries', baseUrl, err);
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  
  throw lastError || new Error('Unknown error occurred during HTTP request');
}

// Convenience function with retry enabled by default
export async function httpGetWithRetry<T = unknown>(
  baseUrl: string, 
  opts: Omit<HttpOptions, 'retries'> & { retries?: number } = {}
): Promise<T> {
  return httpGet<T>(baseUrl, { retries: 3, ...opts });
}