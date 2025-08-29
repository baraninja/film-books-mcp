import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { search } from '../../clients/omdb.js';

export function registerOmdbSearch(server: McpServer) {
  server.registerTool(
    'film_omdb_search',
    {
      title: 'OMDb — Search',
      description: 'Search OMDb by title/year/type.',
      inputSchema: {
        title: z.string(),
        year: z.number().int().optional(),
        type: z.enum(['movie', 'series', 'episode']).optional(),
        page: z.number().int().positive().optional()
      }
    },
    async (input) => {
      const data = await search(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}