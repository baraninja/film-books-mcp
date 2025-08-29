import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { oaiListRecords } from '../../clients/libris.js';

export function registerLibrisOai(server: McpServer) {
  server.registerTool(
    'se_libris_oai_list_records',
    {
      title: 'LIBRIS OAI-PMH — ListRecords',
      description: 'Harvest LIBRIS via OAI-PMH ListRecords (XML string). Supports resumptionToken.',
      inputSchema: {
        metadataPrefix: z.string().optional().default('oai_dc'),
        from: z.string().optional(),
        until: z.string().optional(),
        set: z.string().optional(),
        resumptionToken: z.string().optional()
      }
    },
    async (input) => {
      const xml = await oaiListRecords(input as any);
      return { content: [{ type: 'text', text: xml }] };
    }
  );
}