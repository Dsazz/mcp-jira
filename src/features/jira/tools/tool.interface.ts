/**
 * Interface for all JIRA tools
 */
import { McpResponse } from '../api/types';

/**
 * Interface that all JIRA tools must implement
 */
export interface Tool<TParams = unknown> {
  /**
   * Handler method exposed to MCP
   */
  handler(params: TParams): Promise<McpResponse>;
} 