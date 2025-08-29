import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWork, getEdition } from '../clients/openlibrary.js';

export function registerOpenLibraryResources(server: McpServer) {
  server.registerResource(
    'openlibrary-work',
    'openlibrary://works/{olid}',
    { title: 'Open Library Work', description: 'Fetch an Open Library work by OLID.', mimeType: 'application/json' },
    async (uri, params) => {
      const olid = Array.isArray((params as any).olid) ? (params as any).olid[0] : (params as any).olid;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getWork(olid), null, 2) }]
      };
    }
  );

  server.registerResource(
    'openlibrary-edition',
    'openlibrary://editions/{olid}',
    { title: 'Open Library Edition', description: 'Fetch an Open Library edition by OLID.', mimeType: 'application/json' },
    async (uri, params) => {
      const olid = Array.isArray((params as any).olid) ? (params as any).olid[0] : (params as any).olid;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getEdition(olid), null, 2) }]
      };
    }
  );
}