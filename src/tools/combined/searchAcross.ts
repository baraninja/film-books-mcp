import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchVolumes } from '../../clients/googlebooks.js';
import { searchOpenLibrary } from '../../clients/openlibrary.js';
import { xsearch } from '../../clients/libris.js';
import { formatOpenAlexResponse, formatCrossrefResponse } from '../../utils/formatters.js';
import { deduplicateBookResults } from '../../utils/deduplication.js';

interface SearchResult {
  source: string;
  results: unknown;
  error?: string;
}

export function registerCombinedSearch(server: McpServer) {
  server.registerTool(
    'books_search_across_all',
    {
      title: 'Books — Search across all databases',
      description: 'Search simultaneously across Google Books, Open Library, and LIBRIS for books and publications.',
      inputSchema: {
        // Common search fields
        title: z.string().optional().describe('Book title to search for'),
        author: z.string().optional().describe('Author name to search for'),
        isbn: z.string().optional().describe('ISBN to search for'),
        publisher: z.string().optional().describe('Publisher name'),
        subject: z.string().optional().describe('Subject/topic'),
        publicationYear: z.number().int().optional().describe('Publication year'),
        language: z.string().optional().describe('Language filter'),
        // Search options
        maxResultsPerSource: z.number().int().positive().max(20).default(5).describe('Maximum results per database'),
        includeGoogleBooks: z.boolean().default(true).describe('Include Google Books in search'),
        includeOpenLibrary: z.boolean().default(true).describe('Include Open Library in search'),
        includeLibris: z.boolean().default(true).describe('Include LIBRIS (Swedish library) in search'),
        deduplicateResults: z.boolean().default(true).describe('Remove duplicate books found across multiple sources'),
        similarityThreshold: z.number().min(0.1).max(1.0).default(0.8).describe('Similarity threshold for deduplication (0.1-1.0)')
      }
    },
    async (input) => {
      const {
        title,
        author,
        isbn,
        publisher,
        subject,
        publicationYear,
        language,
        maxResultsPerSource,
        includeGoogleBooks,
        includeOpenLibrary,
        includeLibris,
        deduplicateResults,
        similarityThreshold
      } = input;

      // Ensure at least one search parameter is provided
      if (!title && !author && !isbn && !publisher && !subject && !publicationYear) {
        throw new Error('At least one search parameter must be provided (title, author, isbn, publisher, subject, or publicationYear)');
      }

      const results: SearchResult[] = [];
      const searchPromises: Promise<void>[] = [];

      // Google Books search
      if (includeGoogleBooks) {
        searchPromises.push(
          (async () => {
            try {
              const googleBooksParams = {
                intitle: title,
                inauthor: author,
                isbn: isbn,
                inpublisher: publisher,
                subject: subject,
                maxResults: maxResultsPerSource,
                langRestrict: language
              };

              const data = await searchVolumes(googleBooksParams);
              results.push({
                source: 'Google Books',
                results: data
              });
            } catch (error) {
              results.push({
                source: 'Google Books',
                results: null,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })()
        );
      }

      // Open Library search
      if (includeOpenLibrary) {
        searchPromises.push(
          (async () => {
            try {
              const openLibraryQuery = [];
              if (title) openLibraryQuery.push(`title:"${title}"`);
              if (author) openLibraryQuery.push(`author:"${author}"`);
              if (isbn) openLibraryQuery.push(`isbn:${isbn.replace(/-/g, '')}`);
              if (publisher) openLibraryQuery.push(`publisher:"${publisher}"`);
              if (subject) openLibraryQuery.push(`subject:"${subject}"`);
              if (publicationYear) openLibraryQuery.push(`first_publish_year:${publicationYear}`);
              if (language) openLibraryQuery.push(`language:${language}`);

              const data = await searchOpenLibrary({
                title,
                author,
                q: subject || publisher, // Use general query for subject/publisher
                limit: maxResultsPerSource
              });
              results.push({
                source: 'Open Library',
                results: data
              });
            } catch (error) {
              results.push({
                source: 'Open Library',
                results: null,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })()
        );
      }

      // LIBRIS search
      if (includeLibris) {
        searchPromises.push(
          (async () => {
            try {
              const librisParams = {
                title,
                author,
                isbn,
                publisher,
                subject,
                publicationYear,
                language: language as any, // Type assertion for LIBRIS language enum
                materialType: 'book' as const,
                n: maxResultsPerSource
              };

              const data = await xsearch(librisParams);
              results.push({
                source: 'LIBRIS (Swedish National Library)',
                results: data
              });
            } catch (error) {
              results.push({
                source: 'LIBRIS (Swedish National Library)',
                results: null,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })()
        );
      }

      // Wait for all searches to complete
      await Promise.all(searchPromises);

      // Apply deduplication if requested
      let finalResults = results;
      if (deduplicateResults) {
        finalResults = deduplicateBookResults(results, similarityThreshold);
      }

      // Format the combined results
      const response = {
        searchCriteria: {
          title,
          author,
          isbn,
          publisher,
          subject,
          publicationYear,
          language
        },
        searchResults: finalResults,
        summary: {
          totalSources: finalResults.length,
          successfulSources: finalResults.filter(r => !r.error).length,
          errorSources: finalResults.filter(r => r.error).length,
          deduplication_applied: deduplicateResults
        }
      };

      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify(response, null, 2) 
        }] 
      };
    }
  );

  // Also create a specialized search for scholarly works
  server.registerTool(
    'scholarly_search_across_all',
    {
      title: 'Scholarly — Search across academic databases',
      description: 'Search simultaneously across OpenAlex and Crossref for academic publications.',
      inputSchema: {
        // Search fields
        query: z.string().optional().describe('General search query'),
        title: z.string().optional().describe('Search in publication titles'),
        author: z.string().optional().describe('Author name'),
        doi: z.string().optional().describe('DOI to look up'),
        publicationYear: z.number().int().optional().describe('Publication year'),
        yearRange: z.string().optional().describe('Year range (e.g., "2020-2023")'),
        recentYears: z.number().int().min(1).max(20).optional().describe('Filter for publications from the last N years'),
        isOpenAccess: z.boolean().optional().describe('Filter for open access publications only'),
        language: z.string().optional().describe('Language filter (ISO 639-1 code, e.g., "en" for English)'),
        // Search options
        maxResultsPerSource: z.number().int().positive().max(20).default(10).describe('Maximum results per database'),
        includeOpenAlex: z.boolean().default(true).describe('Include OpenAlex in search'),
        includeCrossref: z.boolean().default(true).describe('Include Crossref in search'),
        summaryMode: z.boolean().default(true).describe('Return simplified results (default: true) or full detailed results')
      }
    },
    async (input) => {
      const {
        query,
        title,
        author,
        doi,
        publicationYear,
        yearRange,
        recentYears,
        isOpenAccess,
        language,
        maxResultsPerSource,
        includeOpenAlex,
        includeCrossref,
        summaryMode
      } = input;

      // Import the scholarly search functions
      const { searchWorks: openAlexSearch } = await import('../../clients/openalex.js');
      const { searchWorks: crossrefSearch } = await import('../../clients/crossref.js');

      // Ensure at least one search parameter is provided
      if (!query && !title && !author && !doi && !publicationYear && !yearRange && !recentYears) {
        throw new Error('At least one search parameter must be provided');
      }

      // Calculate year range for recent years filter
      let calculatedYearRange = yearRange;
      if (recentYears && !yearRange && !publicationYear) {
        const currentYear = new Date().getFullYear();
        const fromYear = currentYear - recentYears + 1;
        calculatedYearRange = `${fromYear}-${currentYear}`;
      }

      const results: SearchResult[] = [];
      const searchPromises: Promise<void>[] = [];

      // OpenAlex search
      if (includeOpenAlex) {
        searchPromises.push(
          (async () => {
            try {
              const params = {
                search: query || title,
                publicationYear,
                publicationYearRange: calculatedYearRange,
                isOa: isOpenAccess,
                language: language,
                perPage: maxResultsPerSource
              };

              const rawData = await openAlexSearch(params);
              const formattedData = formatOpenAlexResponse(rawData, summaryMode);
              results.push({
                source: 'OpenAlex',
                results: formattedData
              });
            } catch (error) {
              results.push({
                source: 'OpenAlex',
                results: null,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })()
        );
      }

      // Crossref search
      if (includeCrossref) {
        searchPromises.push(
          (async () => {
            try {
              const params: any = {
                query: query,
                queryTitle: title,
                queryAuthor: author,
                rows: maxResultsPerSource
              };

              // Add date filters if provided
              if (publicationYear) {
                params.fromPubDate = `${publicationYear}-01-01`;
                params.untilPubDate = `${publicationYear}-12-31`;
              } else if (calculatedYearRange) {
                const [from, to] = calculatedYearRange.split('-');
                if (from && to) {
                  params.fromPubDate = `${from}-01-01`;
                  params.untilPubDate = `${to}-12-31`;
                }
              }

              const rawData = await crossrefSearch(params);
              const formattedData = formatCrossrefResponse(rawData, summaryMode);
              results.push({
                source: 'Crossref',
                results: formattedData
              });
            } catch (error) {
              results.push({
                source: 'Crossref',
                results: null,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })()
        );
      }

      // Wait for all searches to complete
      await Promise.all(searchPromises);

      // Format the combined results
      const response = {
        searchCriteria: {
          query,
          title,
          author,
          doi,
          publicationYear,
          yearRange,
          isOpenAccess
        },
        searchResults: results,
        summary: {
          totalSources: results.length,
          successfulSources: results.filter(r => !r.error).length,
          errorSources: results.filter(r => r.error).length
        }
      };

      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify(response, null, 2) 
        }] 
      };
    }
  );
}