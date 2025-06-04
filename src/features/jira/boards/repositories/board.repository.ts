import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type {
  Board,
  BoardConfiguration,
  GetBoardsOptions,
} from "./../models";

/**
 * Repository interface for board operations and retrieval
 * Clear responsibility: managing board data and configuration
 */
export interface BoardRepository {
  getBoards(options?: GetBoardsOptions): Promise<Board[]>;
  getBoard(boardId: number): Promise<Board>;
  getBoardConfiguration(boardId: number): Promise<BoardConfiguration>;
}

/**
 * Implementation of BoardRepository
 * Extracted from JiraClient god object - board operations only
 */
export class BoardRepositoryImpl implements BoardRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get all boards accessible to the current user
   */
  async getBoards(options?: GetBoardsOptions): Promise<Board[]> {
    this.logger.debug("Getting boards", { prefix: "JIRA:BoardRepository" });

    const queryParams: Record<string, string | number | boolean | undefined> =
      {};

    if (options?.startAt) {
      queryParams.startAt = options.startAt;
    }

    if (options?.maxResults) {
      queryParams.maxResults = options.maxResults;
    }

    if (options?.type) {
      queryParams.type = options.type;
    }

    if (options?.name) {
      queryParams.name = options.name;
    }

    if (options?.projectKeyOrId) {
      queryParams.projectKeyOrId = options.projectKeyOrId;
    }

    if (options?.accountIdLocation) {
      queryParams.accountIdLocation = options.accountIdLocation;
    }

    if (options?.projectLocation) {
      queryParams.projectLocation = options.projectLocation;
    }

    if (options?.includePrivate !== undefined) {
      queryParams.includePrivate = options.includePrivate;
    }

    if (options?.negateLocationFiltering !== undefined) {
      queryParams.negateLocationFiltering = options.negateLocationFiltering;
    }

    if (options?.orderBy) {
      queryParams.orderBy = options.orderBy;
    }

    if (options?.expand) {
      queryParams.expand = options.expand;
    }

    if (options?.filterId) {
      queryParams.filterId = options.filterId;
    }

    const response = await this.httpClient.sendRequest<{ values: Board[] }>({
      endpoint: "board",
      method: "GET",
      queryParams,
    });

    return response.values;
  }

  /**
   * Get details of a specific board
   */
  async getBoard(boardId: number): Promise<Board> {
    this.logger.debug(`Getting board: ${boardId}`, {
      prefix: "JIRA:BoardRepository",
    });

    return this.httpClient.sendRequest<Board>({
      endpoint: `board/${boardId}`,
      method: "GET",
    });
  }

  /**
   * Get configuration details for a specific board
   */
  async getBoardConfiguration(boardId: number): Promise<BoardConfiguration> {
    this.logger.debug(`Getting configuration for board: ${boardId}`, {
      prefix: "JIRA:BoardRepository",
    });

    return this.httpClient.sendRequest<BoardConfiguration>({
      endpoint: `board/${boardId}/configuration`,
      method: "GET",
    });
  }
}
