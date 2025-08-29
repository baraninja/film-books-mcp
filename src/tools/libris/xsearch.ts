import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { xsearch, type LibrisSearchParams } from '../../clients/libris.js';

export function registerLibrisXsearch(server: McpServer) {
  server.registerTool(
    'se_libris_xsearch',
    {
      title: 'LIBRIS Xsearch — Search',
      description: 'Search LIBRIS (Swedish National Library) with structured field support and boolean queries.',
      inputSchema: {
        // General search
        query: z.string().optional().describe('General search query'),
        // Structured search fields
        title: z.string().optional().describe('Search in titles'),
        author: z.string().optional().describe('Search by author name'),
        isbn: z.string().optional().describe('Search by ISBN (with or without hyphens)'),
        issn: z.string().optional().describe('Search by ISSN'),
        publicationYear: z.number().int().optional().describe('Search by specific publication year'),
        yearRange: z.string().optional().describe('Search by year range (e.g., "2020-2023")'),
        publisher: z.string().optional().describe('Search by publisher name'),
        subject: z.string().optional().describe('Search by subject/topic'),
        materialType: z.enum(['book', 'article', 'thesis', 'audiobook', 'map', 'music', 'film']).optional().describe('Filter by material type'),
        language: z.enum(['swe', 'eng', 'dan', 'nor', 'fin', 'ger', 'fre', 'spa']).optional().describe('Filter by language'),
        // API parameters
        n: z.number().int().positive().max(200).optional().describe('Number of results (max 200)'),
        start: z.number().int().nonnegative().optional().describe('Start index for pagination'),
        format: z.enum(['json', 'marcxml', 'mods', 'rdf', 'ris']).optional().describe('Output format')
      }
    },
    async (input) => {
      const params = input as LibrisSearchParams;
      
      // Ensure at least one search parameter is provided
      if (!params.query && !params.title && !params.author && !params.isbn && !params.issn &&
          !params.publicationYear && !params.yearRange && !params.publisher && !params.subject &&
          !params.materialType && !params.language) {
        throw new Error('At least one search parameter must be provided');
      }
      
      const data = await xsearch(params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}