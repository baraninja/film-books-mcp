import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { xsearch, oaiListRecords } from '../clients/libris.js';

export function registerLibrisResources(server: McpServer) {
  server.registerResource(
    'libris-xsearch',
    'libris://xsearch?q={query}',
    { title: 'LIBRIS Xsearch', description: 'Xsearch free-text search (JSON).', mimeType: 'application/json' },
    async (uri, params) => {
      const query = Array.isArray((params as any).query) ? (params as any).query[0] : (params as any).query;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await xsearch({ query, n: 50 }), null, 2) }]
      };
    }
  );

  server.registerResource(
    'libris-oai-listrecords',
    'libris://oai/listrecords?prefix={metadataPrefix}&from={from}&until={until}&set={set}',
    { title: 'LIBRIS OAI-PMH ListRecords', description: 'OAI-PMH harvest (XML).', mimeType: 'application/xml' },
    async (uri, params) => {
      const metadataPrefix = Array.isArray((params as any).metadataPrefix) ? (params as any).metadataPrefix[0] : (params as any).metadataPrefix;
      const from = Array.isArray((params as any).from) ? (params as any).from[0] : (params as any).from;
      const until = Array.isArray((params as any).until) ? (params as any).until[0] : (params as any).until;
      const set = Array.isArray((params as any).set) ? (params as any).set[0] : (params as any).set;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/xml', text: await oaiListRecords({ metadataPrefix, from, until, set }) }]
      };
    }
  );
}