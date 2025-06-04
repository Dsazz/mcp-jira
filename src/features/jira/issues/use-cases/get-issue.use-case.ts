/**
 * Get Issue Use Case
 *
 * Business logic for retrieving JIRA issue details
 */

import { JiraApiError } from "@features/jira/client/errors";
import type { IssueRepository } from "../repositories";
import type { Issue } from "../repositories/issue.models";

/**
 * Request parameters for get issue use case
 */
export interface GetIssueUseCaseRequest {
  issueKey: string;
  fields?: string[];
}

/**
 * Interface for get issue use case
 */
export interface GetIssueUseCase {
  /**
   * Execute the get issue use case
   *
   * @param request - Issue retrieval parameters
   * @returns JIRA issue details
   */
  execute(request: GetIssueUseCaseRequest): Promise<Issue>;
}

/**
 * Implementation of the get issue use case
 */
export class GetIssueUseCaseImpl implements GetIssueUseCase {
  /**
   * Create a new GetIssueUseCase implementation
   *
   * @param issueRepository - Repository for issue operations
   */
  constructor(private readonly issueRepository: IssueRepository) {}

  /**
   * Execute the get issue use case
   *
   * @param request - Issue retrieval parameters
   * @returns JIRA issue details
   */
  public async execute(request: GetIssueUseCaseRequest): Promise<Issue> {
    try {
      // Get issue from repository
      return await this.issueRepository.getIssue(
        request.issueKey,
        request.fields,
      );
    } catch (error) {
      // Rethrow with better context if needed
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(
          `Failed to get issue details: ${error.message}`,
          400
        );
      }
      throw error;
    }
  }
}
