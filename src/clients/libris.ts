import { httpGet } from '../http.js';

// Xsearch (JSON)
const XSEARCH = 'https://libris.kb.se/xsearch';
// OAI-PMH endpoint
const OAI = 'https://libris.kb.se/api/oaipmh/';

export async function xsearch(params: { query: string; n?: number; start?: number; format?: 'json' | 'marcxml' | 'mods' | 'rdf' | 'ris' }): Promise<unknown> {
  const query: Record<string, string | number> = {
    query: params.query,
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