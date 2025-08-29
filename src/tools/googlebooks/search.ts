import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchVolumes, type GoogleBooksSearchParams } from '../../clients/googlebooks.js';

export function registerGoogleBooksSearch(server: McpServer) {
  server.registerTool(
    'books_google_search',
    {
      title: 'Google Books — Search volumes',
      description: 'Search Google Books volumes with structured field support (intitle, inauthor, etc.) or general query.',
      inputSchema: {
        // General search
        q: z.string().optional().describe('General search query'),
        // Structured search fields
        intitle: z.string().optional().describe('Search in book titles'),
        inauthor: z.string().optional().describe('Search by author name'),
        inpublisher: z.string().optional().describe('Search by publisher'),
        subject: z.string().optional().describe('Search by subject/category'),
        isbn: z.string().optional().describe('Search by ISBN'),
        lccn: z.string().optional().describe('Search by Library of Congress Control Number'),
        oclc: z.string().optional().describe('Search by OCLC number'),
        // API parameters
        startIndex: z.number().int().nonnegative().optional().describe('Start index for pagination'),
        maxResults: z.number().int().positive().max(40).optional().describe('Maximum results (1-40)'),
        langRestrict: z.string().optional().describe('Language restriction (ISO 639-1 code)'),
        printType: z.string().optional().describe('Filter by print type'),
        orderBy: z.enum(['relevance', 'newest']).optional().describe('Sort order')
      }
    },
    async (input) => {
      // Ensure at least one search parameter is provided
      const params = input as GoogleBooksSearchParams;
      if (!params.q && !params.intitle && !params.inauthor && !params.inpublisher && 
          !params.subject && !params.isbn && !params.lccn && !params.oclc) {
        throw new Error('At least one search parameter must be provided (q, intitle, inauthor, inpublisher, subject, isbn, lccn, or oclc)');
      }
      
      const data = await searchVolumes(params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}