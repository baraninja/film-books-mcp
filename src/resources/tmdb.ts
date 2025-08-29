import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getMovie } from '../clients/tmdb.js';

export function registerTmdbResources(server: McpServer) {
  server.registerResource(
    'tmdb-movie',
    'tmdb://movie/{id}',
    { title: 'TMDb Movie', description: 'Fetch TMDb movie by id.', mimeType: 'application/json' },
    async (uri, params) => {
      const id = Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getMovie(id), null, 2) }]
      };
    }
  );
}