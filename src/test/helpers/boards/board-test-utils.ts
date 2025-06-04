/**
 * Board test utilities
 */
import type { McpResponse } from "@core/responses";
import type { Board } from "@features/jira/boards/models/board.models";

/**
 * Creates a standard board test response
 */
export function createBoardResponse(board: Board): McpResponse<Board> {
  return {
    success: true,
    data: board,
  };
}

/**
 * Creates a standard boards list test response
 */
export function createBoardsResponse(boards: Board[]): McpResponse<Board[]> {
  return {
    success: true,
    data: boards,
  };
}
