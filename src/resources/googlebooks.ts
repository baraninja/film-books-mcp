import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getVolume } from '../clients/googlebooks.js';

export function registerGoogleBooksResources(server: McpServer) {
  server.registerResource(
    'googlebooks-volume',
    'googlebooks://volumes/{id}',
    { title: 'Google Books Volume', description: 'Fetch a Google Books volume by id.', mimeType: 'application/json' },
    async (uri, params) => {
      const id = Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getVolume(id), null, 2) }]
      };
    }
  );
}