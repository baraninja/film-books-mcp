import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { xsearch } from '../../clients/libris.js';

export function registerLibrisXsearch(server: McpServer) {
  server.registerTool(
    'se_libris_xsearch',
    {
      title: 'LIBRIS Xsearch — Search',
      description: 'Search LIBRIS using Xsearch; default JSON output.',
      inputSchema: {
        query: z.string(),
        n: z.number().int().positive().max(200).optional(),
        start: z.number().int().nonnegative().optional(),
        format: z.enum(['json', 'marcxml', 'mods', 'rdf', 'ris']).optional()
      }
    },
    async (input) => {
      const data = await xsearch(input as any);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}