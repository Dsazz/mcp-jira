/**
 * Tool Handler Type Definition
 *
 * Defines the interface for MCP tool handlers in the JIRA integration
 */

import type { McpResponse } from "@core/responses";

/**
 * Type for MCP tool handler
 *
 * Represents a tool that can handle MCP requests and return responses
 */
export type ToolHandler = {
  handle: (args: unknown) => Promise<McpResponse>;
};

/**
 * Type for tool handler function
 *
 * Alternative representation for handlers that can be sync or async
 */
export type ToolHandlerFunction = (
  args: unknown,
) => Promise<McpResponse> | McpResponse;
