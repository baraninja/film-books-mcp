import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getMovie } from '../../clients/tmdb.js';

export function registerTmdbGetMovie(server: McpServer) {
  server.registerTool(
    'film_tmdb_get_movie',
    {
      title: 'TMDb — Get movie details',
      description: 'Get TMDb movie details by id with optional append_to_response.',
      inputSchema: {
        id: z.union([z.string(), z.number()]),
        appendToResponse: z.string().optional()
      }
    },
    async ({ id, appendToResponse }) => {
      const data = await getMovie(id, appendToResponse);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}