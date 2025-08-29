import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log } from './logger.js';

// Tools
import { registerOpenLibrarySearch } from './tools/openlibrary/search.js';
import { registerOpenLibraryWorkTools } from './tools/openlibrary/work.js';
import { registerGoogleBooksSearch } from './tools/googlebooks/search.js';
import { registerGoogleBooksVolume } from './tools/googlebooks/volume.js';
import { registerOpenAlexSearch } from './tools/openalex/search.js';
import { registerOpenAlexGetWork } from './tools/openalex/work.js';
import { registerCrossrefSearch } from './tools/crossref/search.js';
import { registerCrossrefGetWorkByDoi } from './tools/crossref/workByDoi.js';
import { registerTmdbSearchMovie } from './tools/tmdb/searchMovie.js';
import { registerTmdbGetMovie } from './tools/tmdb/movie.js';
import { registerOmdbSearch } from './tools/omdb/search.js';
import { registerOmdbById } from './tools/omdb/byId.js';
import { registerLibrisXsearch } from './tools/libris/xsearch.js';
import { registerLibrisOai } from './tools/libris/oaiListRecords.js';
import { registerCombinedSearch } from './tools/combined/searchAcross.js';

// Resources
import { registerOpenLibraryResources } from './resources/openlibrary.js';
import { registerGoogleBooksResources } from './resources/googlebooks.js';
import { registerOpenAlexResources } from './resources/openalex.js';
import { registerCrossrefResources } from './resources/crossref.js';
import { registerTmdbResources } from './resources/tmdb.js';
import { registerOmdbResources } from './resources/omdb.js';
import { registerLibrisResources } from './resources/libris.js';

async function main() {
  const server = new McpServer({ name: 'books-film-mcp', version: '0.1.0' });

  // Register tools
  registerOpenLibrarySearch(server);
  registerOpenLibraryWorkTools(server);
  registerGoogleBooksSearch(server);
  registerGoogleBooksVolume(server);
  registerOpenAlexSearch(server);
  registerOpenAlexGetWork(server);
  registerCrossrefSearch(server);
  registerCrossrefGetWorkByDoi(server);
  registerTmdbSearchMovie(server);
  registerTmdbGetMovie(server);
  registerOmdbSearch(server);
  registerOmdbById(server);
  registerLibrisXsearch(server);
  registerLibrisOai(server);
  
  // Register combined search tools
  registerCombinedSearch(server);

  // Register resources
  registerOpenLibraryResources(server);
  registerGoogleBooksResources(server);
  registerOpenAlexResources(server);
  registerCrossrefResources(server);
  registerTmdbResources(server);
  registerOmdbResources(server);
  registerLibrisResources(server);

  // Start stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Note: No logging after connect() - would interfere with JSON protocol
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});