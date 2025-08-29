import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchOpenLibrary } from '../../clients/openlibrary.js';

export function registerOpenLibrarySearch(server: McpServer) {
  server.registerTool(
    'books_openlibrary_search',
    {
      title: 'Open Library — Search works/editions',
      description: 'Search Open Library (works by default). Supports q/title/author, pagination, fields, sort, lang.',
      inputSchema: {
        q: z.string().optional(),
        title: z.string().optional(),
        author: z.string().optional(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
        fields: z.string().optional(),
        sort: z.string().optional(),
        lang: z.string().length(2).optional()
      }
    },
    async (input) => {
      const data = await searchOpenLibrary(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}