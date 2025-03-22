/**
 * Core Tool interface for MCP tools
 */
import { McpResponse } from '../types/mcp-types';

/**
 * Core interface that all MCP tools must implement
 */
export interface Tool<TParams = unknown> {
  /**
   * Handler method exposed to MCP
   */
  handler(params: TParams): Promise<McpResponse> | McpResponse;
} 