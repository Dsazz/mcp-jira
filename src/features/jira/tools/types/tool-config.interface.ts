/**
 * Tool Configuration Interface
 *
 * Defines JIRA-specific extensions for tool configuration used in MCP tool registration
 */

import type { ToolConfig } from "@core/tools";

/**
 * Tool configuration group interface
 *
 * Represents a collection of related tool configurations
 */
export interface ToolConfigGroup {
  /** Name of the tool group (e.g., 'issues', 'projects') */
  groupName: string;

  /** Array of tool configurations in this group */
  configs: ToolConfig[];
}

/**
 * Tool registration options
 *
 * Options for customizing tool registration behavior
 */
export interface ToolRegistrationOptions {
  /** Whether to enable debug logging for tool registration */
  enableDebugLogging?: boolean;

  /** Prefix to add to tool names during registration */
  namePrefix?: string;

  /** Whether to validate tool configurations before registration */
  validateConfigs?: boolean;
}
