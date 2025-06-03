/**
 * Project Params Validator
 *
 * Validator for project retrieval-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { z } from "zod";
import { JiraApiError } from "@features/jira/client/errors";

/**
 * Schema for getting projects parameters
 */
export const getProjectsParamsSchema = z.object({
  // Expansion options
  expand: z
    .array(
      z.enum([
        "description",
        "lead",
        "issueTypes",
        "url",
        "projectKeys",
        "permissions",
        "insight",
      ]),
    )
    .optional(),

  // Filtering options
  recent: z.number().int().min(1).max(20).optional(),
  properties: z.array(z.string().min(1)).optional(),

  // Pagination
  maxResults: z.number().int().min(1).max(50).optional().default(50),
  startAt: z.number().int().min(0).optional().default(0),

  // Project type filtering
  typeKey: z.enum(["software", "service_desk", "business"]).optional(),
  categoryId: z.number().int().min(1).optional(),

  // Search and ordering
  searchQuery: z.string().min(1).optional(),
  orderBy: z
    .enum(["category", "key", "name", "owner", "issueCount"])
    .optional(),
});

/**
 * Type for get projects parameters
 */
export type GetProjectsParams = z.infer<typeof getProjectsParamsSchema>;

/**
 * Schema for getting single project parameters
 */
export const getProjectParamsSchema = z.object({
  projectKey: z
    .string()
    .min(1, "Project key is required")
    .max(50, "Project key too long")
    .regex(
      /^[A-Z0-9_]+$/,
      "Project key must contain only uppercase letters, numbers, and underscores",
    ),

  // Expansion options
  expand: z
    .array(
      z.enum([
        "description",
        "lead",
        "issueTypes",
        "url",
        "projectKeys",
        "permissions",
        "insight",
      ]),
    )
    .optional(),
});

/**
 * Type for get project parameters
 */
export type GetProjectParams = z.infer<typeof getProjectParamsSchema>;

/**
 * Interface for project params validator
 */
export interface ProjectParamsValidator {
  /**
   * Validate get projects parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetProjectsParams(params: GetProjectsParams): GetProjectsParams;

  /**
   * Validate get project parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetProjectParams(params: GetProjectParams): GetProjectParams;
}

/**
 * Implementation of ProjectParamsValidator
 */
export class ProjectParamsValidatorImpl implements ProjectParamsValidator {
  /**
   * Validate parameters for getting projects
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetProjectsParams(
    params: GetProjectsParams,
  ): GetProjectsParams {
    const result = getProjectsParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid project retrieval parameters: ${formatZodError(
        result.error,
      )}`;
      // TODO: Validators must have specific errors
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Validate parameters for getting a single project
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetProjectParams(params: GetProjectParams): GetProjectParams {
    const result = getProjectParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid project parameter: ${formatZodError(
        result.error,
      )}`;
      // TODO: Validators must have specific errors
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }
}
