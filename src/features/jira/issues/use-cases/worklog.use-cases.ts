/**
 * Worklog use cases
 *
 * Business logic for managing time tracking and worklog entries
 */

import type { WorklogEntry } from "@features/jira/issues/models";
import type { WorklogRepository } from "@features/jira/issues/repositories";

/**
 * Request for adding a worklog entry to an issue
 */
export interface AddWorklogRequest {
  /**
   * Issue key (e.g., "PROJ-123")
   */
  issueKey: string;

  /**
   * Amount of time spent in Jira format (e.g., "3h 30m")
   */
  timeSpent: string;

  /**
   * Optional comment describing the work done
   */
  comment?: string;

  /**
   * Optional start date/time in ISO format
   */
  started?: string;
}

/**
 * Response for adding a worklog entry
 */
export interface AddWorklogResponse {
  /**
   * The created worklog entry
   */
  worklog: WorklogEntry;
}

/**
 * Request for getting worklog entries
 */
export interface GetWorklogsRequest {
  /**
   * Issue key (e.g., "PROJ-123")
   */
  issueKey: string;
}

/**
 * Response for getting worklog entries
 */
export interface GetWorklogsResponse {
  /**
   * List of worklog entries for the issue
   */
  worklogs: WorklogEntry[];
}

/**
 * Request for updating a worklog entry
 */
export interface UpdateWorklogRequest {
  /**
   * Issue key (e.g., "PROJ-123")
   */
  issueKey: string;

  /**
   * Worklog ID to update
   */
  worklogId: string;

  /**
   * Amount of time spent in Jira format (e.g., "3h 30m")
   */
  timeSpent?: string;

  /**
   * Optional comment describing the work done
   */
  comment?: string;

  /**
   * Optional start date/time in ISO format
   */
  started?: string;
}

/**
 * Response for updating a worklog entry
 */
export interface UpdateWorklogResponse {
  /**
   * The updated worklog entry
   */
  worklog: WorklogEntry;
}

/**
 * Request for deleting a worklog entry
 */
export interface DeleteWorklogRequest {
  /**
   * Issue key (e.g., "PROJ-123")
   */
  issueKey: string;

  /**
   * Worklog ID to delete
   */
  worklogId: string;
}

/**
 * Response for deleting a worklog entry
 */
export interface DeleteWorklogResponse {
  /**
   * Success message
   */
  message: string;
}

/**
 * Use case for adding worklog entries
 */
export interface AddWorklogUseCase {
  /**
   * Add a worklog entry to an issue
   *
   * @param request - Add worklog request
   * @returns Promise resolving to add worklog response
   */
  execute(request: AddWorklogRequest): Promise<AddWorklogResponse>;
}

/**
 * Use case for getting worklog entries
 */
export interface GetWorklogsUseCase {
  /**
   * Get all worklog entries for an issue
   *
   * @param request - Get worklogs request
   * @returns Promise resolving to get worklogs response
   */
  execute(request: GetWorklogsRequest): Promise<GetWorklogsResponse>;
}

/**
 * Use case for updating worklog entries
 */
export interface UpdateWorklogUseCase {
  /**
   * Update an existing worklog entry
   *
   * @param request - Update worklog request
   * @returns Promise resolving to update worklog response
   */
  execute(request: UpdateWorklogRequest): Promise<UpdateWorklogResponse>;
}

/**
 * Use case for deleting worklog entries
 */
export interface DeleteWorklogUseCase {
  /**
   * Delete a worklog entry
   *
   * @param request - Delete worklog request
   * @returns Promise resolving to delete worklog response
   */
  execute(request: DeleteWorklogRequest): Promise<DeleteWorklogResponse>;
}

/**
 * Implementation of AddWorklogUseCase
 */
export class AddWorklogUseCaseImpl implements AddWorklogUseCase {
  constructor(private readonly worklogRepository: WorklogRepository) {}

  async execute(request: AddWorklogRequest): Promise<AddWorklogResponse> {
    const worklog = await this.worklogRepository.addWorklog(
      request.issueKey,
      request.timeSpent,
      request.comment,
      request.started,
    );

    return { worklog };
  }
}

/**
 * Implementation of GetWorklogsUseCase
 */
export class GetWorklogsUseCaseImpl implements GetWorklogsUseCase {
  constructor(private readonly worklogRepository: WorklogRepository) {}

  async execute(request: GetWorklogsRequest): Promise<GetWorklogsResponse> {
    const worklogs = await this.worklogRepository.getWorklogs(request.issueKey);

    return { worklogs };
  }
}

/**
 * Implementation of UpdateWorklogUseCase
 */
export class UpdateWorklogUseCaseImpl implements UpdateWorklogUseCase {
  constructor(private readonly worklogRepository: WorklogRepository) {}

  async execute(request: UpdateWorklogRequest): Promise<UpdateWorklogResponse> {
    // For update, we need at least timeSpent or comment
    if (!request.timeSpent && !request.comment) {
      throw new Error(
        "At least timeSpent or comment must be provided for update",
      );
    }

    const worklog = await this.worklogRepository.updateWorklog(
      request.issueKey,
      request.worklogId,
      request.timeSpent || "", // Repository expects string, but we'll handle this
      request.comment,
    );

    return { worklog };
  }
}

/**
 * Implementation of DeleteWorklogUseCase
 */
export class DeleteWorklogUseCaseImpl implements DeleteWorklogUseCase {
  constructor(private readonly worklogRepository: WorklogRepository) {}

  async execute(request: DeleteWorklogRequest): Promise<DeleteWorklogResponse> {
    await this.worklogRepository.deleteWorklog(
      request.issueKey,
      request.worklogId,
    );

    return {
      message: `Worklog ${request.worklogId} successfully deleted from issue ${request.issueKey}`,
    };
  }
}
