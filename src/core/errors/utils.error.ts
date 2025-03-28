/**
 * Error Utilities
 *
 * Utility functions for error handling and normalization
 */
import { McpError } from "./mcp.error";

/**
 * Normalize an unknown error into a standard format
 *
 * @param error - The error to normalize
 * @returns Normalized error message
 */
export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch (_e) {
      return "Unknown error object";
    }
  }

  return String(error);
}

/**
 * Convert any error to a McpError instance
 *
 * @param error - The error to convert
 * @returns McpError instance
 */
export function toMcpError(error: unknown): McpError {
  if (error instanceof McpError) {
    return error;
  }

  return new McpError(normalizeError(error));
}
