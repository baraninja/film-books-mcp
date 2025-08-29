export function log(...args: unknown[]) {
  // MCP servers should not write to stdout after connecting to stdio transport
  // This would interfere with JSON protocol communication
  console.error("[books-film-mcp]", ...args);
}

export function errorLog(...args: unknown[]) {
  console.error("[books-film-mcp:ERROR]", ...args);
}