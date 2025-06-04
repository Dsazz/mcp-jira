/**
 * JIRA Tools Types
 *
 * Type definitions for JIRA tools functionality
 */

// Export core tool types for convenience
export type { Tool, ToolHandler, ToolConfig } from "@core/tools";

// Export JIRA-specific tool interfaces
export type * from "./jira-tools.interface";

// Export JIRA-specific tool configuration extensions
export type * from "./tool-config.interface";
