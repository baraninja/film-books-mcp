import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchMovie } from '../../clients/tmdb.js';

export function registerTmdbSearchMovie(server: McpServer) {
  server.registerTool(
    'film_tmdb_search_movie',
    {
      title: 'TMDb — Search movie',
      description: 'Search The Movie Database for movies.',
      inputSchema: {
        query: z.string(),
        year: z.number().int().optional(),
        language: z.string().optional(),
        page: z.number().int().positive().optional(),
        includeAdult: z.boolean().optional()
      }
    },
    async (input) => {
      const data = await searchMovie(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}