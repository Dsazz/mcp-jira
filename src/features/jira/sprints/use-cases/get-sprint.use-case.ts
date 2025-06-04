/**
 * Get Sprint Use Case
 *
 * Business logic for retrieving a single JIRA sprint by ID
 */

import { JiraApiError, JiraNotFoundError } from "@features/jira/client/errors";
import type { Sprint } from "../models";
import type { SprintRepository } from "../repositories/sprint.repository";
import type { GetSprintParams } from "../validators/sprint.validator";

/**
 * Interface for get sprint use case
 */
export interface GetSprintUseCase {
  /**
   * Execute the get sprint use case
   *
   * @param params - Sprint retrieval parameters
   * @returns JIRA sprint matching the ID
   */
  execute(params: GetSprintParams): Promise<Sprint>;
}

/**
 * Implementation of the get sprint use case
 */
export class GetSprintUseCaseImpl implements GetSprintUseCase {
  /**
   * Create a new GetSprintUseCase implementation
   *
   * @param sprintRepository - Repository for sprint operations
   */
  constructor(private readonly sprintRepository: SprintRepository) {}

  /**
   * Execute the get sprint use case
   *
   * @param params - Sprint retrieval parameters
   * @returns JIRA sprint matching the ID
   */
  public async execute(params: GetSprintParams): Promise<Sprint> {
    try {
      // Get sprint using repository with provided ID
      return await this.sprintRepository.getSprint(params.sprintId);
    } catch (error) {
      // Enhance error with more context
      if (error instanceof Error) {
        if (
          error.message.includes("does not exist") ||
          error.message.includes("not found")
        ) {
          throw new JiraNotFoundError("Sprint", String(params.sprintId), {
            sprintId: params.sprintId,
          });
        }

        throw JiraApiError.withCode(
          `Failed to get sprint: ${error.message}`,
          "JIRA_SPRINT_RETRIEVAL_ERROR",
          { sprintId: params.sprintId },
        );
      }
      throw error;
    }
  }
}
