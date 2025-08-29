import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { byId } from '../clients/omdb.js';

export function registerOmdbResources(server: McpServer) {
  server.registerResource(
    'omdb-by-imdb',
    'omdb://id/{imdbId}',
    { title: 'OMDb by IMDb ID', description: 'Fetch OMDb movie/series by IMDb id.', mimeType: 'application/json' },
    async (uri, params) => {
      const imdbId = Array.isArray((params as any).imdbId) ? (params as any).imdbId[0] : (params as any).imdbId;
      return {
        contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await byId({ imdbId }), null, 2) }]
      };
    }
  );
}