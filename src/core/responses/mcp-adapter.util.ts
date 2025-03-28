import type { McpContentResponse } from "./mcp-content.types";
/**
 * MCP Adapter Utilities
 *
 * Utilities for adapting between standard MCP responses and MCP content format.
 * These functions handle the transformation from McpResponse to the content format
 * expected by the MCP server.
 */
import type { McpResponse } from "./mcp-response.types";

/**
 * Transforms McpResponse to the content format expected by MCP server
 *
 * @param response - Original MCP response object
 * @returns Response in the format expected by MCP server
 */
export function adaptToMcpContent(response: McpResponse): McpContentResponse {
  return {
    content: [
      {
        type: "text",
        text: response.success
          ? typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data, null, 2)
          : response.error || "Unknown error",
      },
    ],
    isError: !response.success,
    errorCode: response.errorCode,
  };
}

/**
 * Handler adapter that transforms MCP responses to MCP content format
 *
 * @param handler - Original handler function returning McpResponse
 * @returns Handler compatible with MCP server expected format
 */
export function adaptHandler<T>(
  handler: (params: T) => Promise<McpResponse> | McpResponse,
): (args: T) => Promise<McpContentResponse> {
  return async (args: T) => {
    const response = await handler(args);
    return adaptToMcpContent(response);
  };
}
