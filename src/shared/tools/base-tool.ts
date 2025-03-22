/**
 * BaseTool - Simplified base implementation for MCP tools
 */
import { McpResponse, createSuccessResponse, createErrorResponse } from '../types/mcp-types';
import { Tool } from './tool.interface';
import { Logger, getLogger } from '../logging';
import { FeatureConfig } from '../config/feature-config.interface';

/**
 * Simplified base class for MCP tools
 * Provides essential functionality without overcomplication
 */
export abstract class BaseTool<TParams = unknown, TResult = unknown> implements Tool<TParams> {
  /**
   * Logger instance for this tool
   */
  protected readonly logger: Logger;

  /**
   * Initialize the tool with name and optional configuration
   */
  constructor(
    protected readonly featureName: string,
    protected readonly toolName: string,
    protected readonly config?: FeatureConfig
  ) {
    this.logger = getLogger(`${featureName}:${toolName}`);
    
    // Optional configuration validation
    if (this.config && !this.config.isValid()) {
      this.logger.warn('Tool initialized with invalid configuration', 
        this.config.getDiagnostics());
    } else if (this.config) {
      this.logger.debug('Tool initialized with valid configuration');
    }
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
    if (typeof result === 'string') {
      return createSuccessResponse(result);
    }
    
    return createSuccessResponse(
      JSON.stringify(result, null, 2)
    );
  }

  /**
   * Standard handler implementation with error handling
   */
  public handler(params: TParams): Promise<McpResponse> | McpResponse {
    try {
      this.logger.debug('Tool execution started');
      const result = this.execute(params);
      
      if (result instanceof Promise) {
        return result
          .then(resolvedResult => {
            this.logger.debug('Tool execution completed successfully');
            return this.formatResult(resolvedResult);
          })
          .catch(error => {
            this.logger.error('Tool execution failed', { prefix: String(error) });
            return createErrorResponse(
              error instanceof Error ? error.message : String(error)
            );
          });
      }
      
      this.logger.debug('Tool execution completed successfully');
      return this.formatResult(result);
    } catch (error) {
      this.logger.error('Tool execution failed', { prefix: String(error) });
      return createErrorResponse(
        error instanceof Error ? error.message : String(error)
      );
    }
  }
} 