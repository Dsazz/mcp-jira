/**
 * MCP Response Types
 *
 * Defines standard response formats for MCP operations.
 * These types represent the core response structure used throughout the application
 * for consistent error handling and data returns.
 */

/**
 * Standard MCP response format for consistent returns
 *
 * @template T The type of the data payload
 */
export interface McpResponse<T = unknown> {
  /**
   * Whether the request was successful
   */
  success: boolean;

  /**
   * Optional error message if success is false
   */
  error?: string;

  /**
   * Optional error code if success is false
   */
  errorCode?: string;

  /**
   * Optional data payload if success is true
   */
  data?: T;
}
