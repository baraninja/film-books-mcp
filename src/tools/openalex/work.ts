import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWork } from '../../clients/openalex.js';

export function registerOpenAlexGetWork(server: McpServer) {
  server.registerTool(
    'scholarly_openalex_get_work',
    {
      title: 'OpenAlex — Get work',
      description: 'Get an OpenAlex work by id/URI.',
      inputSchema: { id: z.string() }
    },
    async ({ id }) => {
      const data = await getWork(id);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}