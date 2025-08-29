import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWork, getEdition } from '../../clients/openlibrary.js';

export function registerOpenLibraryWorkTools(server: McpServer) {
  server.registerTool(
    'books_openlibrary_get_work',
    {
      title: 'Open Library — Get work',
      description: 'Fetch a work by OLID (e.g., OL27448W).',
      inputSchema: { olid: z.string() }
    },
    async ({ olid }) => {
      const data = await getWork(olid);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    'books_openlibrary_get_edition',
    {
      title: 'Open Library — Get edition',
      description: 'Fetch an edition by OLID (e.g., OL7058607M).',
      inputSchema: { olid: z.string() }
    },
    async ({ olid }) => {
      const data = await getEdition(olid);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}