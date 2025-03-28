import { McpError } from "./mcp.error";

/**
 * Error for validation failures
 */
export class ValidationError extends McpError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}
