import { McpError } from "./mcp.error";

/**
 * Error for resource not found situations
 */
export class NotFoundError extends McpError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "NOT_FOUND_ERROR", context);
    this.name = "NotFoundError";
  }
}
