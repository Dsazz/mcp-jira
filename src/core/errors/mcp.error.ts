/**
 * Base error class for all MCP errors
 */
export class McpError extends Error {
  /**
   * Error code for categorization
   */
  public readonly code: string;

  /**
   * Additional context information
   */
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code = "MCP_ERROR",
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON-serializable object
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
    };
  }
}
