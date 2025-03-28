/**
 * MCP Response Utilities
 *
 * Utility functions for creating standardized MCP responses.
 * These functions help maintain consistent response formats throughout the application.
 */
import type { McpResponse } from "./mcp-response.types";

/**
 * Create a success response
 *
 * @template T The type of the data payload
 * @param data - Response data
 * @returns A standardized success response
 */
export function createSuccessResponse<T = unknown>(data: T): McpResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error response
 *
 * @param message - Error message
 * @param code - Optional error code
 * @returns A standardized error response
 */
export function createErrorResponse(
  message: string,
  code = "ERROR",
): McpResponse {
  return {
    success: false,
    error: message,
    errorCode: code,
  };
}
