import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchWorks, type OpenAlexSearchParams } from '../../clients/openalex.js';

export function registerOpenAlexSearch(server: McpServer) {
  server.registerTool(
    'scholarly_openalex_search_works',
    {
      title: 'OpenAlex — Search works',
      description: 'Search OpenAlex works with advanced filtering options for scholarly literature.',
      inputSchema: {
        // General search
        search: z.string().optional().describe('General search query (title/abstract/fulltext)'),
        filter: z.string().optional().describe('Custom filter string (advanced users)'),
        // Structured filters
        authorId: z.string().optional().describe('Filter by specific author ID (OpenAlex author ID)'),
        institutionId: z.string().optional().describe('Filter by institution ID'),
        conceptId: z.string().optional().describe('Filter by concept/topic ID'),
        publicationYear: z.number().int().optional().describe('Filter by specific publication year'),
        publicationYearRange: z.string().optional().describe('Filter by year range (e.g., "2020-2023")'),
        isOa: z.boolean().optional().describe('Filter for open access works only'),
        hasFulltext: z.boolean().optional().describe('Filter for works with fulltext available'),
        journalId: z.string().optional().describe('Filter by specific journal/venue ID'),
        type: z.enum(['article', 'book-chapter', 'book', 'dataset', 'preprint', 'review', 'editorial']).optional().describe('Filter by work type'),
        language: z.string().optional().describe('Filter by language (ISO 639-1 code, e.g., "en")'),
        citedByCount: z.string().optional().describe('Filter by citation count (e.g., ">100", "50-200")'),
        // API parameters
        perPage: z.number().int().positive().max(200).optional().describe('Results per page (max 200)'),
        page: z.number().int().positive().optional().describe('Page number for pagination'),
        sort: z.enum(['cited_by_count:desc', 'publication_date:desc', 'relevance_score:desc']).optional().describe('Sort order')
      }
    },
    async (input) => {
      const params = input as OpenAlexSearchParams;
      
      // Ensure at least one search parameter is provided
      if (!params.search && !params.filter && !params.authorId && !params.institutionId && 
          !params.conceptId && !params.publicationYear && !params.publicationYearRange &&
          !params.journalId && !params.type && !params.language && !params.citedByCount) {
        throw new Error('At least one search parameter must be provided');
      }
      
      const data = await searchWorks(params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}