import { logger } from "@core/logging";
import { issueKeySchema } from "@features/jira/validators";
import { z } from "zod";
import type { IssueTransitionRepository } from "../repositories/issue-transition.repository";
import type { Issue } from "../repositories/issue.models";
import type { IssueRepository } from "../repositories/issue.repository";
import type { IssueUpdateRequest } from "../repositories/issue.types";
import type { WorklogRepository } from "../repositories/worklog.repository";
import type { WorklogEntry } from "../repositories/worklog.types";
import type { ProjectPermissionChecker } from "../validators/project-permission.checker";

/**
 * Schema for issue update parameters
 */
export const updateIssueParamsSchema = z.object({
  issueKey: issueKeySchema,

  // Fields to update
  summary: z.string().min(1).max(255).optional(),
  description: z.string().max(32767).optional(),
  priority: z.enum(["Highest", "High", "Medium", "Low", "Lowest"]).optional(),
  assignee: z.string().min(1).max(255).optional(),

  // Array operations
  labels: z
    .object({
      operation: z.enum(["set", "add", "remove"]),
      values: z.array(z.string().min(1).max(255)),
    })
    .optional(),

  components: z
    .object({
      operation: z.enum(["set", "add", "remove"]),
      values: z.array(z.string().min(1).max(255)),
    })
    .optional(),

  // Transition
  transition: z
    .object({
      id: z.string().min(1),
      fields: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),

  // Notification settings
  notifyUsers: z.boolean().optional().default(true),
});

/**
 * Type for update issue parameters
 */
export type UpdateIssueParams = z.infer<typeof updateIssueParamsSchema>;

/**
 * Schema for issue transition parameters
 */
export const transitionIssueParamsSchema = z.object({
  issueKey: issueKeySchema,
  transitionId: z.string().min(1, "Transition ID is required"),
  fields: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Type for transition issue parameters
 */
export type TransitionIssueParams = z.infer<typeof transitionIssueParamsSchema>;

/**
 * Request interface for updating an issue with validation
 */
export interface UpdateIssueUseCaseRequest {
  issueKey: string;
  fields?: Record<string, unknown>;
  transition?: {
    id: string;
    fields?: Record<string, unknown>;
  };
  worklog?: {
    timeSpent: string;
    comment?: string;
    started?: string;
  };
  notifyUsers?: boolean;
}

/**
 * UseCase interface for issue updates with comprehensive validation
 * Clear responsibility: orchestrating issue updates with business logic
 */
export interface UpdateIssueUseCase {
  execute(request: UpdateIssueUseCaseRequest): Promise<Issue>;
}

/**
 * Implementation of UpdateIssueUseCase
 * Encapsulates business logic for issue updates with validation, transitions, and worklog
 */
export class UpdateIssueUseCaseImpl implements UpdateIssueUseCase {
  private readonly logger = logger;

  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly transitionRepository: IssueTransitionRepository,
    private readonly worklogRepository: WorklogRepository,
    private readonly permissionChecker: ProjectPermissionChecker,
  ) {}

  /**
   * Execute issue update with comprehensive validation
   */
  async execute(request: UpdateIssueUseCaseRequest): Promise<Issue> {
    this.logger.debug("Starting issue update process", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey: request.issueKey,
    });

    // Step 1: Get the current issue to validate access and get project key
    const currentIssue = await this.getCurrentIssue(request.issueKey);

    // Step 2: Validate user permissions
    await this.validatePermissions(currentIssue, request);

    // Step 3: Handle transition if requested
    if (request.transition) {
      await this.handleTransition(request.issueKey, request.transition);
    }

    // Step 4: Update fields if provided
    if (request.fields) {
      const updateData = this.buildUpdateRequest(request);
      await this.issueRepository.updateIssue(request.issueKey, updateData);
    }

    // Step 5: Add worklog if provided
    if (request.worklog) {
      await this.addWorklog(request.issueKey, request.worklog);
    }

    // Step 6: Get the final updated issue
    const finalIssue = await this.issueRepository.getIssue(request.issueKey);

    this.logger.debug("Issue update completed successfully", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey: request.issueKey,
    });

    return finalIssue;
  }

  /**
   * Get the current issue to validate access and extract project information
   */
  private async getCurrentIssue(issueKey: string): Promise<Issue> {
    this.logger.debug("Getting current issue for validation", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey,
    });

    try {
      return await this.issueRepository.getIssue(issueKey);
    } catch (error) {
      this.logger.error("Failed to get current issue", {
        prefix: "JIRA:UpdateIssueUseCase",
        issueKey,
        error,
      });
      throw new Error(`Issue '${issueKey}' not found or inaccessible`);
    }
  }

  /**
   * Validate that the user has permission to update the issue
   */
  private async validatePermissions(
    issue: Issue,
    request: UpdateIssueUseCaseRequest,
  ): Promise<void> {
    this.logger.debug("Validating update permissions", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey: request.issueKey,
    });

    // Extract project key with proper type checking
    if (!issue.fields || !issue.fields.project) {
      throw new Error(
        `Unable to determine project for issue '${request.issueKey}'`,
      );
    }

    const project = issue.fields.project as { key: string };
    const projectKey = project.key;

    if (!projectKey) {
      throw new Error(
        `Unable to determine project key for issue '${request.issueKey}'`,
      );
    }

    this.logger.debug("Validating update permissions", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey: request.issueKey,
      projectKey,
    });

    const hasPermission =
      await this.permissionChecker.hasEditIssuePermission(projectKey);

    if (!hasPermission) {
      const error = new Error(
        `User does not have EDIT_ISSUES permission for project '${projectKey}'`,
      );
      this.logger.error("Permission validation failed", {
        prefix: "JIRA:UpdateIssueUseCase",
        issueKey: request.issueKey,
        projectKey,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Handle issue transition
   */
  private async handleTransition(
    issueKey: string,
    transition: { id: string; fields?: Record<string, unknown> },
  ): Promise<void> {
    this.logger.debug("Handling issue transition", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey,
      transitionId: transition.id,
    });

    await this.transitionRepository.transitionIssue(
      issueKey,
      transition.id,
      transition.fields,
    );
  }

  /**
   * Add worklog entry
   */
  private async addWorklog(
    issueKey: string,
    worklog: { timeSpent: string; comment?: string; started?: string },
  ): Promise<WorklogEntry> {
    this.logger.debug("Adding worklog entry", {
      prefix: "JIRA:UpdateIssueUseCase",
      issueKey,
      timeSpent: worklog.timeSpent,
    });

    return this.worklogRepository.addWorklog(
      issueKey,
      worklog.timeSpent,
      worklog.comment,
      worklog.started,
    );
  }

  /**
   * Build the update request from the use case request
   */
  private buildUpdateRequest(
    request: UpdateIssueUseCaseRequest,
  ): IssueUpdateRequest {
    const updateData: IssueUpdateRequest = {
      notifyUsers: request.notifyUsers ?? true,
    };

    if (request.fields) {
      updateData.fields = request.fields;
    }

    return updateData;
  }
}
