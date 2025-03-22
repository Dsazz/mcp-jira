/**
 * Common MCP response types
 */

/**
 * Standard MCP response interface
 */
export interface McpResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

/**
 * Create a standard success response for MCP
 */
export function createSuccessResponse(text: string): McpResponse {
  return {
    content: [{
      type: 'text',
      text
    }]
  };
}

/**
 * Create a standard error response for MCP
 */
export function createErrorResponse(text: string): McpResponse {
  return {
    content: [{
      type: 'text',
      text
    }],
    isError: true
  };
} 