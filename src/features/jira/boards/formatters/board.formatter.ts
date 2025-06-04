/**
 * Board formatter
 */
import type { Board } from "@features/jira/boards/models";
import type { Formatter } from "@features/jira/shared";

/**
 * Formatted board data interface
 */
interface FormattedBoard {
  id: string;
  name: string;
  type: string;
  location: Board["location"];
  self: string;
}

/**
 * Formatter class for board data
 */
export class BoardFormatter implements Formatter<Board, FormattedBoard> {
  /**
   * Format a board for display
   */
  format(board: Board): FormattedBoard {
    return {
      id: board.id,
      name: board.name,
      type: board.type,
      location: board.location,
      self: board.self,
    };
  }
}
