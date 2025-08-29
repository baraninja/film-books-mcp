# books-film-mcp

En lokal **Model Context Protocol (MCP)**-server för böcker, film och publikationer.

**API-källor**: Open Library, Google Books, OpenAlex, Crossref, TMDb, OMDb samt LIBRIS (Xsearch, OAI-PMH).

## Installation

```bash
npm install # eller pnpm install / yarn
```

## Utveckling

```bash
npm run dev
```

## Bygg & kör

```bash
npm run build
npm start  # stdio
```

## Miljövariabler

Se `.env.example`. Minst krävs:
- `OMDB_API_KEY`
- `TMDB_ACCESS_TOKEN` **eller** `TMDB_API_KEY`

Rekommenderas:
- `GOOGLE_BOOKS_API_KEY` (kvoter)
- `CROSSREF_MAILTO` (polite pool)
- `USER_AGENT_EXTRA`

## Verktyg (tools)

- `books_openlibrary_search`
- `books_openlibrary_get_work`
- `books_openlibrary_get_edition`
- `books_google_search`
- `books_google_get_volume`
- `scholarly_openalex_search_works`
- `scholarly_openalex_get_work`
- `scholarly_crossref_search_works`
- `scholarly_crossref_get_by_doi`
- `film_tmdb_search_movie`
- `film_tmdb_get_movie`
- `film_omdb_search`
- `film_omdb_get`
- `se_libris_xsearch`
- `se_libris_oai_list_records`

## Resurser (resources)

- `openlibrary://works/{olid}`
- `openlibrary://editions/{olid}`
- `googlebooks://volumes/{id}`
- `openalex://works/{id}`
- `crossref://works/{doi}`
- `tmdb://movie/{id}`
- `omdb://id/{imdbId}`
- `libris://xsearch?q={query}`
- `libris://oai/listrecords?prefix={metadataPrefix}&from={from}&until={until}&set={set}`

## Claude Desktop / MCP Bundles (MCPB)

Bygg en installérbar bundle:

```bash
npm i -g @anthropic-ai/mcpb
npm run build
mcpb init   # skapar manifest.json (svara på frågorna)
mcpb pack   # genererar .mcpb
```

Öppna `.mcpb` i Claude för Windows/macOS för att installera.

## Användning med Claude Desktop

### Alternativ 1: Lokal server

Lägg till i din Claude Desktop-konfiguration (`%APPDATA%\Claude\claude_desktop_config.json` på Windows eller `~/Library/Application Support/Claude/claude_desktop_config.json` på macOS):

```json
{
  "mcpServers": {
    "books-film-mcp": {
      "command": "node",
      "args": ["/absolut/sökväg/till/books-film-mcp/dist/server.js"],
      "env": {
        "OMDB_API_KEY": "din-omdb-nyckel",
        "TMDB_ACCESS_TOKEN": "din-tmdb-token"
      }
    }
  }
}
```

### Alternativ 2: MCPB Bundle

1. Skapa `.env`-fil med dina API-nycklar
2. Kör `npm run build && mcpb init && mcpb pack`
3. Öppna den genererade `.mcpb`-filen i Claude Desktop

## Licens

MIT