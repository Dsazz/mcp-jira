import { McpError } from "./mcp.error";

/**
 * Error for HTTP/network-related issues
 */
export class HttpError extends McpError {
  /**
   * HTTP status code
   */
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode = 500,
    context?: Record<string, unknown>,
  ) {
    super(message, "HTTP_ERROR", context);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
    };
  }
}
