import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWork } from '../clients/openalex.js';

export function registerOpenAlexResources(server: McpServer) {
  server.registerResource(
    'openalex-work',
    'openalex://works/{id}',
    { title: 'OpenAlex Work', description: 'Fetch OpenAlex work by id.', mimeType: 'application/json' },
    async (uri, params) => {
      const id = Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getWork(id), null, 2) }]
      };
    }
  );
}