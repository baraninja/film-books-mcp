import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getVolume } from '../../clients/googlebooks.js';

export function registerGoogleBooksVolume(server: McpServer) {
  server.registerTool(
    'books_google_get_volume',
    {
      title: 'Google Books — Get volume',
      description: 'Fetch a single volume by id.',
      inputSchema: { id: z.string() }
    },
    async ({ id }) => {
      const data = await getVolume(id);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}