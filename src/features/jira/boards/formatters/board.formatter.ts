/**
 * Board formatter
 */
import type { Board } from "@features/jira/boards/models";
import type { Formatter } from "@features/jira/shared";

/**
 * Formatter class for board data
 */
export class BoardFormatter implements Formatter<Board, any> {
  /**
   * Format a board for display
   */
  format(board: Board) {
    return {
      id: board.id,
      name: board.name,
      type: board.type,
      location: board.location,
      self: board.self,
    };
  }
}
