/**
 * Get Boards Use Case
 *
 * Business logic for retrieving JIRA boards with filtering capabilities
 */

import { JiraApiError } from "@features/jira/client/errors";
import type { BoardRepository } from "../repositories";
import type { Board } from "../models";

/**
 * Request parameters for get boards use case
 */
export interface GetBoardsUseCaseRequest {
  type?: string;
  projectKeyOrId?: string;
  name?: string;
  startAt?: number;
  maxResults?: number;
  orderBy?: string;
  expand?: string;
  includePrivate?: boolean;
  filterId?: number;
  accountIdLocation?: string;
  projectLocation?: string;
  negateLocationFiltering?: boolean;
}

/**
 * Interface for get boards use case
 */
export interface GetBoardsUseCase {
  /**
   * Execute the get boards use case
   *
   * @param request - Boards retrieval parameters
   * @returns List of JIRA boards matching the criteria
   */
  execute(request: GetBoardsUseCaseRequest): Promise<Board[]>;
}

/**
 * Implementation of the get boards use case
 */
export class GetBoardsUseCaseImpl implements GetBoardsUseCase {
  /**
   * Create a new GetBoardsUseCase implementation
   *
   * @param boardRepository - Repository for board operations
   */
  constructor(private readonly boardRepository: BoardRepository) {}

  /**
   * Execute the get boards use case
   *
   * @param request - Boards retrieval parameters
   * @returns List of JIRA boards matching the criteria
   */
  public async execute(request: GetBoardsUseCaseRequest): Promise<Board[]> {
    try {
      // Get boards using repository with provided parameters
      return await this.boardRepository.getBoards(request);
    } catch (error) {
      // Rethrow with better context if needed
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(`Failed to get boards: ${error.message}`, 400);
      }
      throw error;
    }
  }
}
