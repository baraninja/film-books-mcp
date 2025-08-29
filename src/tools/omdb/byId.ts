import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { byId } from '../../clients/omdb.js';

export function registerOmdbById(server: McpServer) {
  server.registerTool(
    'film_omdb_get',
    {
      title: 'OMDb — Get by IMDb ID or title',
      description: 'Fetch OMDb details by imdbId or title/year.',
      inputSchema: {
        imdbId: z.string().optional(),
        title: z.string().optional(),
        year: z.number().int().optional(),
        plot: z.enum(['short', 'full']).optional()
      }
    },
    async (input) => {
      const data = await byId(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}