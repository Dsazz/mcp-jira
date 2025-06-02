/**
 * Get Boards Handler
 *
 * Handles requests to retrieve JIRA boards with comprehensive filtering
 */

import { logger } from "@core/logging";
import { BaseToolHandler } from "@core/tools";
import type { JiraApiClient } from "@features/jira/api/jira.client.types";
import type { GetBoardsParams } from "@features/jira/api/jira.schemas";
import { formatBoardList } from "@features/jira/formatters/board-list.formatter";

/**
 * Handler for getting JIRA boards
 */
export class GetBoardsHandler extends BaseToolHandler<GetBoardsParams> {
  constructor(private readonly jiraClient: JiraApiClient) {
    super("JIRA", "Get Boards");
  }

  /**
   * Execute the get boards operation
   */
  async execute(params: GetBoardsParams): Promise<string> {
    const startTime = Date.now();

    // Validate parameters first
    this.validateParameters(params);

    logger.info("Getting JIRA boards", {
      prefix: "JIRA:GetBoards",
      params: {
        type: params.type,
        projectKeyOrId: params.projectKeyOrId,
        name: params.name,
        maxResults: params.maxResults,
        startAt: params.startAt,
      },
    });

    // Build options for the API call
    const options = this.buildApiOptions(params);

    // Get boards from JIRA - let errors bubble up to BaseToolHandler
    const boards = await this.jiraClient.getBoards(options);

    const duration = Date.now() - startTime;
    logger.info(`Successfully retrieved ${boards.length} boards`, {
      prefix: "JIRA:GetBoards",
      duration,
      count: boards.length,
    });

    // Determine if there might be more results
    // If we got exactly maxResults, there might be more
    const maxResults = params.maxResults || 50;
    const hasMore = boards.length === maxResults;

    // Format and return the response
    return formatBoardList(
      boards,
      {
        type: params.type,
        projectKeyOrId: params.projectKeyOrId,
        name: params.name,
      },
      {
        hasMore,
        maxResults: params.maxResults,
        startAt: params.startAt,
      },
    );
  }

  /**
   * Validate input parameters
   */
  private validateParameters(params: GetBoardsParams): void {
    // Validate maxResults
    if (params.maxResults !== undefined && params.maxResults < 0) {
      throw new Error(
        "Invalid board retrieval parameters: maxResults must be non-negative",
      );
    }

    // Validate startAt
    if (params.startAt !== undefined && params.startAt < 0) {
      throw new Error(
        "Invalid board retrieval parameters: startAt must be non-negative",
      );
    }

    // Validate board type
    if (params.type && !["scrum", "kanban", "simple"].includes(params.type)) {
      throw new Error(
        "Invalid board retrieval parameters: type must be 'scrum', 'kanban', or 'simple'",
      );
    }

    // Validate orderBy
    if (
      params.orderBy &&
      !["name", "-name", "+name", "id", "-id", "+id"].includes(params.orderBy)
    ) {
      throw new Error(
        "Invalid board retrieval parameters: invalid orderBy value",
      );
    }

    // Check if client is properly initialized
    if (!this.jiraClient || typeof this.jiraClient.getBoards !== "function") {
      throw new Error("JIRA client not initialized properly");
    }
  }

  /**
   * Build API options from parameters
   */
  private buildApiOptions(params: GetBoardsParams) {
    const options: Record<string, unknown> = {};

    if (params.startAt !== undefined) {
      options.startAt = params.startAt;
    }

    if (params.maxResults !== undefined) {
      options.maxResults = params.maxResults;
    }

    if (params.type) {
      options.type = params.type;
    }

    if (params.name) {
      options.name = params.name;
    }

    if (params.projectKeyOrId) {
      options.projectKeyOrId = params.projectKeyOrId;
    }

    if (params.accountIdLocation) {
      options.accountIdLocation = params.accountIdLocation;
    }

    if (params.projectLocation) {
      options.projectLocation = params.projectLocation;
    }

    if (params.includePrivate !== undefined) {
      options.includePrivate = params.includePrivate;
    }

    if (params.negateLocationFiltering !== undefined) {
      options.negateLocationFiltering = params.negateLocationFiltering;
    }

    if (params.orderBy) {
      options.orderBy = params.orderBy;
    }

    if (params.expand) {
      options.expand = params.expand;
    }

    if (params.filterId) {
      options.filterId = params.filterId;
    }

    return options;
  }
}
