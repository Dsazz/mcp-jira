/**
 * Board mock factory for testing
 */
import { mock } from "bun:test";
import type { Board } from "@features/jira/boards/models/board.models";
import type { BoardRepository } from "@features/jira/boards/repositories";

/**
 * Creates a mock board repository
 */
export function createMockBoardRepository() {
  return {
    getBoards: mock(),
    getBoard: mock(),
  } as unknown as BoardRepository;
}

/**
 * Creates a mock board
 */
export function createMockBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: "101",
    name: "Test Board",
    type: "scrum",
    self: "https://test.atlassian.net/rest/agile/1.0/board/101",
    ...overrides,
  };
}

/**
 * Creates a mock board list
 */
export function createMockBoardList(count = 3): Board[] {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      id: `${101 + index}`,
      name: `Test Board ${index + 1}`,
      type: index % 2 === 0 ? "scrum" : "kanban",
      self: `https://test.atlassian.net/rest/agile/1.0/board/${101 + index}`,
    }));
}
