import { ServerConfig } from './types';

export const serverConfig: ServerConfig = {
  name: "JIRA Tools",
  version: "1.0.0",
  description: "MCP server for JIRA integration",
  mcpVersion: "0.2.0", // Current MCP protocol version
  stdio: true, // Explicitly enable stdio transport
}; 