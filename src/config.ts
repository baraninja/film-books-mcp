import 'dotenv/config';

export const CONFIG = {
  googleBooksKey: process.env.GOOGLE_BOOKS_API_KEY || undefined,
  tmdbAccessToken: process.env.TMDB_ACCESS_TOKEN || undefined,
  tmdbApiKey: process.env.TMDB_API_KEY || undefined,
  omdbApiKey: process.env.OMDB_API_KEY || undefined,
  crossrefMailto: process.env.CROSSREF_MAILTO || undefined,
  userAgentExtra: process.env.USER_AGENT_EXTRA || 'books-film-mcp/0.1.0'
};