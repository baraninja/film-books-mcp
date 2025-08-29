import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWorkByDoi } from '../clients/crossref.js';

export function registerCrossrefResources(server: McpServer) {
  server.registerResource(
    'crossref-work',
    'crossref://works/{doi}',
    { title: 'Crossref Work', description: 'Fetch Crossref work by DOI.', mimeType: 'application/json' },
    async (uri, params) => {
      const doi = Array.isArray((params as any).doi) ? (params as any).doi[0] : (params as any).doi;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getWorkByDoi(doi), null, 2) }]
      };
    }
  );
}