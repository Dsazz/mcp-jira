/**
 * Get Assigned Issues Use Case
 *
 * Business logic for retrieving issues assigned to the current user
 */

import { logger } from "@core/logging";
import { JiraApiError } from "@features/jira/client/errors";
import type { Issue } from "../models";
import type { IssueSearchRepository } from "../repositories";

/**
 * Request parameters for get assigned issues use case
 */
export interface GetAssignedIssuesUseCaseRequest {
  fields?: string[]; // Optional fields to include in the response
}

/**
 * Interface for get assigned issues use case
 */
export interface GetAssignedIssuesUseCase {
  /**
   * Execute the get assigned issues use case
   *
   * @param request - Optional parameters for customizing the request
   * @returns List of JIRA issues assigned to the current user
   */
  execute(request?: GetAssignedIssuesUseCaseRequest): Promise<Issue[]>;
}

/**
 * Implementation of the get assigned issues use case
 */
export class GetAssignedIssuesUseCaseImpl implements GetAssignedIssuesUseCase {
  /**
   * Create a new GetAssignedIssuesUseCase implementation
   *
   * @param issueSearchRepository - Repository for issue search operations
   */
  constructor(private readonly issueSearchRepository: IssueSearchRepository) {}

  /**
   * Execute the get assigned issues use case
   *
   * @param request - Optional parameters for customizing the request
   * @returns List of JIRA issues assigned to the current user
   */
  public async execute(
    request?: GetAssignedIssuesUseCaseRequest,
  ): Promise<Issue[]> {
    try {
      logger.debug("Executing get assigned issues use case", {
        prefix: "JIRA:GetAssignedIssuesUseCase",
        fields: request?.fields,
      });

      // Search for issues assigned to current user using JQL
      const searchOptions = {
        jql: "assignee = currentUser() ORDER BY updated DESC",
        fields: request?.fields || [
          "summary",
          "status",
          "priority",
          "assignee",
          "created",
          "updated",
        ],
        maxResults: 50,
        startAt: 0,
      };

      const searchResult =
        await this.issueSearchRepository.searchIssues(searchOptions);

      logger.debug(`Retrieved ${searchResult.issues.length} assigned issues`, {
        prefix: "JIRA:GetAssignedIssuesUseCase",
        total: searchResult.total,
      });

      return searchResult.issues;
    } catch (error) {
      logger.error("Failed to get assigned issues", {
        prefix: "JIRA:GetAssignedIssuesUseCase",
        error: error instanceof Error ? error.message : String(error),
      });

      // Rethrow with better context if needed
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(
          `Failed to get assigned issues: ${error.message}`,
          400,
        );
      }
      throw error;
    }
  }
}
