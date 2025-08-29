import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchWorks } from '../../clients/crossref.js';

export function registerCrossrefSearch(server: McpServer) {
  server.registerTool(
    'scholarly_crossref_search_works',
    {
      title: 'Crossref — Search works',
      description: 'Search Crossref works with optional filters.',
      inputSchema: {
        query: z.string().optional(),
        filter: z.string().optional(),
        rows: z.number().int().positive().optional(),
        offset: z.number().int().nonnegative().optional()
      }
    },
    async (input) => {
      const data = await searchWorks(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}