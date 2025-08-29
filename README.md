# Books & Film MCP Server

A comprehensive **Model Context Protocol (MCP)** server for books, films, and scholarly publications with advanced search capabilities and user-friendly formatting.

**Supported APIs**: Open Library, Google Books, OpenAlex, Crossref, TMDb, OMDb, and LIBRIS (Xsearch & OAI-PMH).

## Features

### Core Capabilities
- 🔍 **18+ search and retrieval tools** across multiple databases
- 📚 **Book data** from Open Library, Google Books, and LIBRIS
- 🎬 **Movie information** from TMDb and OMDb  
- 📄 **Scholarly articles** via OpenAlex and Crossref
- 🔗 **8 URI-based resources** for direct data access

### Enhanced Search Experience
- 🎯 **Smart Summary Mode** - Scholarly results show only essential fields instead of 200+ line JSON responses
- 🔄 **Cross-source deduplication** - Removes duplicate books found across multiple databases
- 🌍 **Advanced filtering** - Language, publication year, and recent publication filters
- ⚡ **Combined searches** - Search multiple databases simultaneously
- 📋 **Readable formatting** - Optional text format for better CLI display
- 🛡️ **Reliability** - Automatic retry, caching, and rate limiting

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build & Run

```bash
npm run build
npm start  # stdio transport
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

**Required:**
- `OMDB_API_KEY` - OMDb API key
- `TMDB_ACCESS_TOKEN` **or** `TMDB_API_KEY` - TMDb authentication

**Optional but recommended:**
- `GOOGLE_BOOKS_API_KEY` - Higher API quotas
- `CROSSREF_MAILTO` - Polite pool access
- `USER_AGENT_EXTRA` - Custom user agent string

## Available Tools

### 📚 Books
- `books_openlibrary_search` - Search Open Library works/editions  
- `books_openlibrary_get_work` - Get work by OLID
- `books_openlibrary_get_edition` - Get edition by OLID
- `books_google_search` - **Enhanced** Google Books search with structured fields (`intitle`, `inauthor`, `isbn`, etc.)
- `books_google_get_volume` - Get volume by ID

### 📄 Scholarly Publications  
- `scholarly_openalex_search_works` - **Enhanced** OpenAlex search with summary mode and advanced filters
- `scholarly_openalex_get_work` - Get work by ID/URI
- `scholarly_crossref_search_works` - **Enhanced** Crossref search with structured queries and summary mode
- `scholarly_crossref_get_by_doi` - Get work by DOI

### 🎬 Films
- `film_tmdb_search_movie` - Search TMDb movies
- `film_tmdb_get_movie` - Get movie details by ID
- `film_omdb_search` - Search OMDb by title  
- `film_omdb_get` - Get by IMDb ID or title

### 🇸🇪 Swedish Libraries (LIBRIS)
- `se_libris_xsearch` - **Enhanced** search with structured fields and boolean queries
- `se_libris_oai_list_records` - OAI-PMH harvesting

### ⚡ Combined Multi-Source Search
- `books_search_across_all` - **NEW** Search Google Books, Open Library, and LIBRIS simultaneously with deduplication
- `scholarly_search_across_all` - **NEW** Search OpenAlex and Crossref simultaneously with summary mode

## Key Search Parameters

### Summary & Formatting
- `summaryMode: true` (default) - Returns essential fields only vs. full API responses
- `formatAsText: true` - Human-readable text format instead of JSON
- `deduplicateResults: true` (default) - Remove cross-source duplicates

### Advanced Filtering  
- `recentYears: 5` - Publications from last N years
- `language: "en"` - Language filter (ISO 639-1 codes)
- `isOpenAccess: true` - Open access publications only
- `publicationYear: 2023` - Specific year filter

## Available Resources

Direct URI access to data:

- `openlibrary://works/{olid}` - Open Library work
- `openlibrary://editions/{olid}` - Open Library edition
- `googlebooks://volumes/{id}` - Google Books volume
- `openalex://works/{id}` - OpenAlex work
- `crossref://works/{doi}` - Crossref work
- `tmdb://movie/{id}` - TMDb movie
- `omdb://id/{imdbId}` - OMDb by IMDb ID
- `libris://xsearch?q={query}` - LIBRIS search
- `libris://oai/listrecords?prefix={metadataPrefix}&from={from}&until={until}&set={set}` - LIBRIS OAI-PMH

## Usage with Claude Desktop

### Option 1: Local Server

Add to your Claude Desktop configuration:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "books-film-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/books-film-mcp/dist/server.js"],
      "env": {
        "OMDB_API_KEY": "your-omdb-key",
        "TMDB_ACCESS_TOKEN": "your-tmdb-token"
      }
    }
  }
}
```

### Option 2: MCP Bundle (MCPB)

Create an installable bundle:

```bash
npm i -g @anthropic-ai/mcpb
npm run build
mcpb init   # creates manifest.json
mcpb pack   # generates .mcpb file
```

Open the `.mcpb` file in Claude Desktop to install.

## Search Examples

### Enhanced Google Books Search
```json
{
  "inauthor": "Astrid Lindgren",
  "language": "swe",
  "maxResults": 10
}
```

### Scholarly Search with Summary Mode
```json
{
  "query": "climate change",
  "recentYears": 3,
  "isOpenAccess": true,
  "summaryMode": true,
  "formatAsText": true
}
```

### Combined Book Search with Deduplication
```json
{
  "author": "Selma Lagerlöf",
  "deduplicateResults": true,
  "maxResultsPerSource": 5
}
```

## Performance & Reliability

- **Automatic retry logic** with exponential backoff
- **Memory caching** (1-hour TTL) for frequently accessed data
- **Rate limiting** respects API limits (Crossref: 50/min, Google Books: 100/min, etc.)
- **Smart error handling** with graceful degradation
- **Response optimization** - Summary mode reduces scholarly results from 200+ lines to ~10 essential fields

## API Documentation

Each service follows their respective API guidelines with enhanced MCP features:

- **Open Library**: Public API with optional pagination and field filtering
- **Google Books**: Enhanced with structured field searches (`intitle`, `inauthor`, `isbn`, etc.)
- **OpenAlex**: Advanced filters + summary mode for readable results  
- **Crossref**: Structured queries + summary mode + date range filtering
- **TMDb**: Movie database with v3 (API key) or v4 (Bearer token) auth
- **OMDb**: IMDb data requiring API key registration
- **LIBRIS**: Enhanced with boolean queries and structured field searches

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT