/**
 * MCP Content Types
 *
 * Defines the content types used for MCP server responses.
 * These types represent the specific format expected by the MCP protocol
 * for rendering different types of content (text, images, resources).
 */

/**
 * Content item for text responses
 */
export interface TextContent {
  type: "text";
  text: string;
  [key: string]: unknown;
}

/**
 * Content item for image responses
 */
export interface ImageContent {
  type: "image";
  data: string;
  mimeType: string;
  [key: string]: unknown;
}

/**
 * Content item for resource responses
 */
export interface ResourceContent {
  type: "resource";
  resource:
    | {
        text: string;
        uri: string;
        mimeType?: string;
        [key: string]: unknown;
      }
    | {
        uri: string;
        blob: string;
        mimeType?: string;
        [key: string]: unknown;
      };
  [key: string]: unknown;
}

/**
 * Union type for all content types
 */
export type Content = TextContent | ImageContent | ResourceContent;

/**
 * Response format used by MCP server
 */
export interface McpContentResponse {
  /**
   * Array of content items
   */
  content: Content[];

  /**
   * Whether the response represents an error
   */
  isError?: boolean;

  /**
   * Optional error code
   */
  errorCode?: string;

  /**
   * Optional metadata
   */
  _meta?: Record<string, unknown>;

  /**
   * Allow additional properties
   */
  [key: string]: unknown;
}
