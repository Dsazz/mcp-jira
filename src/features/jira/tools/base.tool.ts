/**
 * Base class for JIRA MCP tools
 */
import { McpResponse } from '../api/types';
import { handleError } from '../errors/error-handler';
import { logger } from '../../../shared/logger';
import { logConfigStatus } from '../config/config';
import { Tool } from './tool.interface';

/**
 * Abstract base class for all JIRA tools
 * Provides common functionality and enforces consistent structure
 */
export abstract class BaseTool<TParams = unknown, TResult = unknown> implements Tool<TParams> {
  /**
   * Tool name for logging
   */
  protected abstract readonly toolName: string;

  /**
   * Initialize the tool
   */
  constructor() {
    this.validateEnvironment();
  }

  /**
   * Validate environment configuration
   */
  protected validateEnvironment(): void {
    logConfigStatus();
  }

  /**
   * Log debug information
   */
  protected logDebug(message: string, data?: Record<string, unknown>): void {
    logger.debug(message, { 
      prefix: `JIRA ${this.toolName}`,
      isMcp: true,
      ...data
    });
  }

  /**
   * Log info level information
   */
  protected logInfo(message: string, data?: Record<string, unknown>): void {
    logger.info(message, { 
      prefix: `JIRA ${this.toolName}`,
      isMcp: true,
      ...data
    });
  }

  /**
   * Execute the tool logic
   * This is the main method that subclasses must implement
   */
  protected abstract execute(params: TParams): Promise<TResult>;

  /**
   * Create successful response
   */
  protected createSuccessResponse(text: string): McpResponse {
    return {
      content: [{ type: 'text', text }]
    };
  }

  /**
   * Primary handler method exposed to MCP
   */
  public async handler(params: TParams): Promise<McpResponse> {
    try {
      this.logDebug('Tool execution started', { params });
      const result = await this.execute(params);
      this.logDebug('Tool execution completed successfully');
      return this.formatResult(result);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Format the result to McpResponse
   * Default implementation converts to string, override if needed
   */
  protected formatResult(result: TResult): McpResponse {
    if (typeof result === 'string') {
      return this.createSuccessResponse(result);
    }
    
    // For other types, use JSON stringification
    return this.createSuccessResponse(
      JSON.stringify(result, null, 2)
    );
  }
} 