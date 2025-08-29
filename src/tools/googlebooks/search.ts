import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchVolumes } from '../../clients/googlebooks.js';

export function registerGoogleBooksSearch(server: McpServer) {
  server.registerTool(
    'books_google_search',
    {
      title: 'Google Books — Search volumes',
      description: 'Search Google Books volumes via the public API.',
      inputSchema: {
        q: z.string(),
        startIndex: z.number().int().nonnegative().optional(),
        maxResults: z.number().int().positive().max(40).optional(),
        langRestrict: z.string().optional(),
        printType: z.string().optional(),
        orderBy: z.enum(['relevance', 'newest']).optional()
      }
    },
    async (input) => {
      const data = await searchVolumes(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}