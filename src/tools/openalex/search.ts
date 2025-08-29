import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchWorks } from '../../clients/openalex.js';

export function registerOpenAlexSearch(server: McpServer) {
  server.registerTool(
    'scholarly_openalex_search_works',
    {
      title: 'OpenAlex — Search works',
      description: 'Search OpenAlex works (title/abstract/fulltext).',
      inputSchema: {
        search: z.string().optional(),
        filter: z.string().optional(),
        perPage: z.number().int().positive().optional(),
        page: z.number().int().positive().optional()
      }
    },
    async (input) => {
      const data = await searchWorks(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}