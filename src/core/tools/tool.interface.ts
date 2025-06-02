import type { McpResponse } from "@core/responses";
/**
 * Tool Interface
 *
 * Base interface for MCP tools
 */
import type { z } from "zod";

/**
 * Tool Interfaces
 *
 * Provides core interfaces for the MCP tool system
 */

/**
 * Core interface that represents an MCP tool
 * Implemented by all tool interfaces
 */
export interface Tool {
  /**
   * Defines the capability that a tool provides
   * Each tool should have a well-defined function
   */
  name: string;

  /**
   * The feature this tool belongs to
   */
  feature: string;

  /**
   * Description of what the tool does
   */
  description?: string;
}

/**
 * Interface for a tool handler that processes tool requests
 */
export interface ToolHandler<TParams = unknown> {
  /**
   * Handler method exposed to MCP
   * Processes a request with parameters and returns a response
   *
   * @param params - Parameters for the tool request
   * @returns Response formatted for MCP
   */
  handle(params: TParams): Promise<McpResponse> | McpResponse;
}

/**
 * Configuration for registering a tool with the MCP server
 * Used to provide a declarative way to define and register tools
 */
export interface ToolConfig {
  /**
   * Name identifier for the tool
   */
  name: string;

  /**
   * Human-readable description of what the tool does
   */
  description: string;

  /**
   * Parameter schema for the tool
   */
  params: Record<string, z.ZodTypeAny>;

  /**
   * Handler function that processes tool requests
   */
  handler: (args: unknown) => Promise<McpResponse> | McpResponse;
}
