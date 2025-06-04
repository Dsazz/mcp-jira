/**
 * MCP Response
 * 
 * Common response type for MCP tools and features
 */

/**
 * Standard response interface for all MCP tools
 */
export interface McpResponse<T = unknown, E = unknown> {
  /**
   * Success flag
   */
  success: boolean;
  
  /**
   * Response data
   */
  data?: T;
  
  /**
   * Error information if success is false
   */
  error?: {
    /**
     * Error message
     */
    message: string;
    
    /**
     * Error code
     */
    code?: string;
    
    /**
     * Error details
     */
    details?: E;
  };
}

/**
 * Create a successful MCP response
 */
export function createSuccessResponse<T>(data: T): McpResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error MCP response
 */
export function createErrorResponse<E = unknown>(message: string, code?: string, details?: E): McpResponse<unknown, E> {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
} 