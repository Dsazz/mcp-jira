/**
 * Response Module
 *
 * Provides standardized response handling for MCP applications.
 * Includes core response types and utilities for consistent MCP responses.
 */

// Core MCP Response Types and Utilities
export type { McpResponse } from "./mcp-response.types";
export {
  createSuccessResponse,
  createErrorResponse,
} from "./mcp-response.util";

// MCP Server Integration
export { adaptHandler } from "./mcp-adapter.util";
