import { getLogger } from "../logging";
import type { Logger } from "../logging";
/**
 * ToolHandler - Base implementation for MCP tool handlers
 *
 * This provides a standardized foundation for implementing MCP tool handlers
 * with consistent error handling, logging, and response formatting.
 */
import {
  type McpResponse,
  createErrorResponse,
  createSuccessResponse,
} from "../responses";
// Use existing validation utilities if needed
import type { Tool, ToolHandler } from "./tool.interface";

/**
 * Base class for MCP tool handlers
 * Provides essential functionality for all tool handlers
 */
export abstract class BaseToolHandler<TParams = unknown, TResult = unknown>
  implements ToolHandler<TParams>, Tool
{
  /**
   * Logger instance for this tool handler
   */
  protected readonly logger: Logger;

  /**
   * Defines the name of this tool
   */
  public readonly name: string;

  /**
   * Defines the feature this tool belongs to
   */
  public readonly feature: string;

  /**
   * Initialize the tool handler with name
   *
   * @param feature - The name of the feature this tool handler belongs to
   * @param name - The name of this specific tool
   * @param description - Optional description of what the tool does
   */
  constructor(
    feature: string,
    name: string,
    public readonly description?: string,
  ) {
    this.feature = feature;
    this.name = name;
    this.logger = getLogger(`${feature}:${name}`);
    this.logger.debug("Tool handler initialized");
  }

  /**
   * Execute tool-specific logic
   * This is the main method that subclasses must implement
   */
  protected abstract execute(params: TParams): Promise<TResult> | TResult;

  /**
   * Format the result for MCP response
   * Default implementation handles strings and objects
   */
  protected formatResult(result: TResult): McpResponse {
    if (typeof result === "string") {
      return createSuccessResponse(result);
    }

    return createSuccessResponse(
      typeof result === "object" ? result : String(result),
    );
  }

  /**
   * Standard handler implementation with error handling
   *
   * @param params - The parameters for the tool request
   * @returns The formatted MCP response
   */
  public handle(params: unknown): Promise<McpResponse> | McpResponse {
    try {
      this.logger.debug("Tool execution started");
      // Type casting here as subclasses will handle validation
      const result = this.execute(params as TParams);

      if (result instanceof Promise) {
        return result
          .then((resolvedResult) => {
            this.logger.debug("Tool execution completed successfully");
            return this.formatResult(resolvedResult);
          })
          .catch((error) => {
            this.logger.error("Tool execution failed", {
              prefix: String(error),
            });
            return createErrorResponse(
              error instanceof Error ? error.message : String(error),
            );
          });
      }

      this.logger.debug("Tool execution completed successfully");
      return this.formatResult(result);
    } catch (error) {
      this.logger.error("Tool execution failed", { prefix: String(error) });
      return createErrorResponse(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
