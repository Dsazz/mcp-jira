/**
 * Get Assigned Issues Use Case
 *
 * Business logic for retrieving issues assigned to the current user
 */

import { JiraApiError } from "@features/jira/client/errors";
import type { IssueSearchRepository } from "../repositories";
import type { Issue } from "../repositories/issue.models";

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
      // Get assigned issues from repository
      return await this.issueSearchRepository.getAssignedIssues(
        request?.fields,
      );
    } catch (error) {
      // Rethrow with better context if needed
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(
          `Failed to get assigned issues: ${error.message}`,
          400
        );
      }
      throw error;
    }
  }
}
