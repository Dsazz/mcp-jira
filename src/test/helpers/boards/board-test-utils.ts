/**
 * Board test utilities
 */
import type { Board } from "@features/jira/boards/models/board.models";
import type { McpResponse } from "@core/responses/mcp-response";

/**
 * Creates a standard board test response
 */
export function createBoardResponse(board: Board): McpResponse<Board> {
  return {
    success: true,
    data: board,
    error: null
  };
}

/**
 * Creates a standard boards list test response
 */
export function createBoardsResponse(boards: Board[]): McpResponse<Board[]> {
  return {
    success: true,
    data: boards,
    error: null
  };
}
