import { logger } from "@core/logging";
import type { ProjectPermissionRepository } from "@features/index";
import { issueKeySchema } from "@features/jira/issues/validators/issue-params.validator";
import type { ProjectValidator } from "@features/jira/projects/validators/project.validator";
import {
  type ADFDocument,
  ensureADFFormat,
} from "@features/jira/shared/parsers/adf.parser";
import { z } from "zod";
import type { Issue } from "../models/issue.models";
import type { IssueRepository } from "../repositories/issue.repository";

/**
 * Schema for JIRA issue creation parameters
 */
export const createIssueParamsSchema = z.object({
  // Required fields
  projectKey: z
    .string()
    .min(1, "Project key is required")
    .max(50, "Project key too long")
    .regex(
      /^[A-Z0-9_]+$/,
      "Project key must contain only uppercase letters, numbers, and underscores",
    ),

  summary: z
    .string()
    .min(1, "Summary is required")
    .max(255, "Summary must be 255 characters or less"),

  issueType: z
    .string()
    .min(1, "Issue type is required")
    .max(50, "Issue type name too long"),

  // Optional core fields
  description: z
    .string()
    .max(32767, "Description too long (max 32,767 characters)")
    .optional(),

  priority: z.enum(["Highest", "High", "Medium", "Low", "Lowest"]).optional(),

  assignee: z
    .string()
    .min(1, "Assignee cannot be empty")
    .max(255, "Assignee identifier too long")
    .optional(),

  // Array fields with limits
  labels: z
    .array(z.string().min(1).max(255))
    .max(10, "Maximum 10 labels allowed")
    .optional(),

  components: z
    .array(z.string().min(1).max(255))
    .max(5, "Maximum 5 components allowed")
    .optional(),

  fixVersions: z
    .array(z.string().min(1).max(255))
    .max(3, "Maximum 3 fix versions allowed")
    .optional(),

  // Parent issue for subtasks
  parentIssueKey: issueKeySchema.optional(),

  // Time tracking
  timeEstimate: z
    .string()
    .regex(
      /^\d+[wdhm]$/,
      "Time estimate must be in format like '2w', '3d', '4h', '30m'",
    )
    .optional(),

  // Environment field
  environment: z
    .string()
    .max(32767, "Environment description too long")
    .optional(),

  // Story points for agile
  storyPoints: z
    .number()
    .int()
    .min(0)
    .max(100, "Story points must be between 0 and 100")
    .optional(),

  // Custom fields (flexible object)
  customFields: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Type for create issue parameters
 */
export type CreateIssueParams = z.infer<typeof createIssueParamsSchema>;

/**
 * Interface for create issue request (JIRA API format)
 */
export interface CreateIssueRequest {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    description?: ADFDocument | null; // ADF format or null
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    assignee?: {
      accountId: string;
    };
    labels?: string[];
    components?: Array<{ name: string }>;
    fixVersions?: Array<{ name: string }>;
    parent?: {
      key: string;
    };
    timetracking?: {
      originalEstimate: string;
    };
    environment?: ADFDocument | string | null; // ADF format or string
    customfield_10016?: number; // Story points (common custom field)
    [key: string]: unknown; // For additional custom fields
  };
}

/**
 * Transform create issue parameters to API request format
 */
export function transformToCreateRequest(
  params: CreateIssueParams,
): CreateIssueRequest {
  return {
    fields: {
      project: {
        key: params.projectKey,
      },
      summary: params.summary,
      description: params.description
        ? ensureADFFormat(params.description)
        : undefined,
      issuetype: {
        name: params.issueType,
      },
      priority: params.priority ? { name: params.priority } : undefined,
      assignee: params.assignee ? { accountId: params.assignee } : undefined,
      labels: params.labels,
      components: params.components?.map((name) => ({ name })),
      fixVersions: params.fixVersions?.map((name) => ({ name })),
      parent: params.parentIssueKey
        ? { key: params.parentIssueKey }
        : undefined,
      timetracking: params.timeEstimate
        ? { originalEstimate: params.timeEstimate }
        : undefined,
      environment: params.environment
        ? ensureADFFormat(params.environment)
        : undefined,
      customfield_10016: params.storyPoints,
    },
  };
}

/**
 * Request interface for creating an issue with validation
 */
export interface CreateIssueUseCaseRequest {
  projectKey: string;
  summary: string;
  issueType?: string;
  description?: string;
  customFields?: Record<string, unknown>;
}

/**
 * UseCase interface for issue creation with comprehensive validation
 * Clear responsibility: orchestrating issue creation with business logic
 */
export interface CreateIssueUseCase {
  execute(request: CreateIssueUseCaseRequest): Promise<Issue>;
}

/**
 * Implementation of CreateIssueUseCase
 * Encapsulates business logic for issue creation with validation
 */
export class CreateIssueUseCaseImpl implements CreateIssueUseCase {
  private readonly logger = logger;

  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly projectValidator: ProjectValidator,
    private readonly permissionChecker: ProjectPermissionRepository,
  ) {}

  /**
   * Execute issue creation with comprehensive validation
   */
  async execute(request: CreateIssueUseCaseRequest): Promise<Issue> {
    this.logger.debug("Starting issue creation process", {
      prefix: "JIRA:CreateIssueUseCase",
      projectKey: request.projectKey,
      summary: request.summary,
    });

    // Step 1: Validate project exists
    await this.validateProject(request.projectKey);

    // Step 2: Check user permissions
    await this.validatePermissions(request.projectKey);

    // Step 3: Validate issue type if provided
    if (request.issueType) {
      await this.validateIssueType(request.projectKey, request.issueType);
    }

    // Step 4: Create the issue
    const issueData = this.buildCreateIssueRequest(request);
    const createdIssue = await this.issueRepository.createIssue(issueData);

    this.logger.debug("Issue creation completed successfully", {
      prefix: "JIRA:CreateIssueUseCase",
      issueKey: createdIssue.key,
      projectKey: request.projectKey,
    });

    return createdIssue;
  }

  /**
   * Validate that the project exists and is accessible
   */
  private async validateProject(projectKey: string): Promise<void> {
    this.logger.debug("Validating project existence", {
      prefix: "JIRA:CreateIssueUseCase",
      projectKey,
    });

    try {
      await this.projectValidator.validateProject(projectKey);
    } catch (error) {
      this.logger.error("Project validation failed", {
        prefix: "JIRA:CreateIssueUseCase",
        projectKey,
        error,
      });
      throw error;
    }
  }

  /**
   * Validate that the user has permission to create issues
   */
  private async validatePermissions(projectKey: string): Promise<void> {
    this.logger.debug("Validating create issue permissions", {
      prefix: "JIRA:CreateIssueUseCase",
      projectKey,
    });

    const hasPermission =
      await this.permissionChecker.hasCreateIssuePermission(projectKey);

    if (!hasPermission) {
      const error = new Error(
        `User does not have CREATE_ISSUES permission for project '${projectKey}'`,
      );
      this.logger.error("Permission validation failed", {
        prefix: "JIRA:CreateIssueUseCase",
        projectKey,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate that the issue type exists in the project
   */
  private async validateIssueType(
    projectKey: string,
    issueType: string,
  ): Promise<void> {
    this.logger.debug("Validating issue type", {
      prefix: "JIRA:CreateIssueUseCase",
      projectKey,
      issueType,
    });

    try {
      await this.projectValidator.validateIssueType(projectKey, issueType);
    } catch (error) {
      this.logger.error("Issue type validation failed", {
        prefix: "JIRA:CreateIssueUseCase",
        projectKey,
        issueType,
        error,
      });
      throw error;
    }
  }

  /**
   * Build the create issue request from the use case request
   */
  private buildCreateIssueRequest(
    request: CreateIssueUseCaseRequest,
  ): CreateIssueRequest {
    const fields: CreateIssueRequest["fields"] = {
      project: {
        key: request.projectKey,
      },
      summary: request.summary,
      issuetype: {
        name: request.issueType || "Task",
      },
    };

    // Convert description to ADF format if provided
    if (request.description) {
      const adfDescription = ensureADFFormat(request.description);
      if (adfDescription) {
        fields.description = adfDescription;
      }
    }

    // Add custom fields if provided
    if (request.customFields) {
      Object.assign(fields, request.customFields);
    }

    return { fields };
  }
}
