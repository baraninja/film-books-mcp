# Books & Film MCP Server

A comprehensive **Model Context Protocol (MCP)** server for books, films, and scholarly publications.

**Supported APIs**: Open Library, Google Books, OpenAlex, Crossref, TMDb, OMDb, and LIBRIS (Xsearch & OAI-PMH).

## Features

- 🔍 **14 search and retrieval tools** across multiple databases
- 📚 **Book data** from Open Library and Google Books
- 🎬 **Movie information** from TMDb and OMDb  
- 📄 **Scholarly articles** via OpenAlex and Crossref
- 🇸🇪 **Swedish library data** through LIBRIS
- 🔗 **8 URI-based resources** for direct data access

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

### Books
- `books_openlibrary_search` - Search Open Library works/editions
- `books_openlibrary_get_work` - Get work by OLID
- `books_openlibrary_get_edition` - Get edition by OLID
- `books_google_search` - Search Google Books volumes
- `books_google_get_volume` - Get volume by ID

### Scholarly Publications
- `scholarly_openalex_search_works` - Search OpenAlex works
- `scholarly_openalex_get_work` - Get work by ID/URI
- `scholarly_crossref_search_works` - Search Crossref works
- `scholarly_crossref_get_by_doi` - Get work by DOI

### Films
- `film_tmdb_search_movie` - Search TMDb movies
- `film_tmdb_get_movie` - Get movie details by ID
- `film_omdb_search` - Search OMDb by title
- `film_omdb_get` - Get by IMDb ID or title

### Swedish Libraries (LIBRIS)
- `se_libris_xsearch` - Free-text search
- `se_libris_oai_list_records` - OAI-PMH harvesting

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

## API Documentation

Each service follows their respective API guidelines:

- **Open Library**: Public API with optional pagination and field filtering
- **Google Books**: Public API with optional API key for higher quotas
- **OpenAlex**: Open access to scholarly literature with filters and search
- **Crossref**: DOI-based publications with polite pool support
- **TMDb**: Movie database with v3 (API key) or v4 (Bearer token) auth
- **OMDb**: IMDb data requiring API key registration
- **LIBRIS**: Swedish National Library with Xsearch and OAI-PMH endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT