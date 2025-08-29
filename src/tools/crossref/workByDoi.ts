import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWorkByDoi } from '../../clients/crossref.js';

export function registerCrossrefGetWorkByDoi(server: McpServer) {
  server.registerTool(
    'scholarly_crossref_get_by_doi',
    {
      title: 'Crossref — Get work by DOI',
      description: 'Fetch Crossref work metadata by DOI.',
      inputSchema: { doi: z.string() }
    },
    async ({ doi }) => {
      const data = await getWorkByDoi(doi);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}