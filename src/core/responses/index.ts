/**
 * Response Module
 *
 * This module contains two primary components:
 *
 * 1. MCP Responses - General-purpose response types and utilities
 *    for consistent MCP responses throughout the application
 *
 * 2. MCP Content - Specialized types and adapters for the specific
 *    content format expected by the MCP server
 */

// MCP Response Types and Utilities
export type { McpResponse } from "./mcp-response.types";
export {
  createSuccessResponse,
  createErrorResponse,
} from "./mcp-response.util";

// MCP Content Types and Adapters
export type {
  TextContent,
  ImageContent,
  ResourceContent,
  Content,
  McpContentResponse,
} from "./mcp-content.types";
export {
  adaptToMcpContent,
  adaptHandler,
} from "./mcp-adapter.util";
