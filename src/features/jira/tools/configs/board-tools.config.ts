/**
 * Board Tools Configuration
 *
 * Defines configuration for all board-related JIRA tools
 */

import type { ToolConfig, ToolHandler } from "../types";
import { getBoardsParamsSchema } from "../../boards";

/**
 * Board tools configuration factory
 * 
 * Creates tool configurations for all board-related tools
 */
export function createBoardToolsConfig(tools: {
  jira_get_boards: ToolHandler;
}): ToolConfig[] {
  return [
    {
      name: "jira_get_boards",
      description: "Get all accessible JIRA boards with filtering by type, project, and name",
      params: getBoardsParamsSchema.shape,
      handler: tools.jira_get_boards.handle.bind(tools.jira_get_boards),
    },
  ];
} 