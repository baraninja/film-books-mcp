import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchWorks, type CrossrefSearchParams } from '../../clients/crossref.js';

export function registerCrossrefSearch(server: McpServer) {
  server.registerTool(
    'scholarly_crossref_search_works',
    {
      title: 'Crossref — Search works',
      description: 'Search Crossref works with structured query parameters and advanced filtering.',
      inputSchema: {
        // General search
        query: z.string().optional().describe('General search query'),
        filter: z.string().optional().describe('Custom filter string (advanced users)'),
        // Structured searches
        queryTitle: z.string().optional().describe('Search specifically in titles'),
        queryAuthor: z.string().optional().describe('Search specifically in author names'),
        queryContainerTitle: z.string().optional().describe('Search in journal/container titles'),
        queryPublisher: z.string().optional().describe('Search by publisher name'),
        querySubject: z.string().optional().describe('Search by subject/topic'),
        // Date filters
        fromPubDate: z.string().optional().describe('Filter from publication date (YYYY-MM-DD)'),
        untilPubDate: z.string().optional().describe('Filter until publication date (YYYY-MM-DD)'),
        fromIndexDate: z.string().optional().describe('Filter from index date (YYYY-MM-DD)'),
        untilIndexDate: z.string().optional().describe('Filter until index date (YYYY-MM-DD)'),
        // Type filters
        type: z.enum(['journal-article', 'book-chapter', 'book', 'proceedings-article', 'reference-entry', 'journal', 'component']).optional().describe('Filter by work type'),
        // Other filters
        hasOrcid: z.boolean().optional().describe('Filter for works with ORCID authors'),
        hasFullText: z.boolean().optional().describe('Filter for works with full text'),
        hasReferences: z.boolean().optional().describe('Filter for works with references'),
        hasAbstract: z.boolean().optional().describe('Filter for works with abstracts'),
        // API parameters
        rows: z.number().int().positive().max(1000).optional().describe('Number of results (max 1000)'),
        offset: z.number().int().nonnegative().optional().describe('Offset for pagination'),
        sort: z.enum(['relevance', 'score', 'updated', 'deposited', 'indexed', 'published', 'published-print', 'published-online']).optional().describe('Sort order'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction')
      }
    },
    async (input) => {
      const params = input as CrossrefSearchParams;
      
      // Ensure at least one search parameter is provided
      if (!params.query && !params.filter && !params.queryTitle && !params.queryAuthor && 
          !params.queryContainerTitle && !params.queryPublisher && !params.querySubject &&
          !params.type && !params.fromPubDate && !params.untilPubDate) {
        throw new Error('At least one search parameter must be provided');
      }
      
      const data = await searchWorks(params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}