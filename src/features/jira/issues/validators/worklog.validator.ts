/**
 * Worklog Validator
 *
 * Validator for worklog-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { JiraApiError } from "@features/jira/client/errors";
import { z } from "zod";
import { issueKeySchema } from "./issue-params.validator";

/**
 * Schema for adding worklog parameters
 */
export const addWorklogParamsSchema = z.object({
  issueKey: issueKeySchema,

  // Required fields
  timeSpent: z
    .string()
    .min(1, "Time spent is required")
    .regex(
      /^\d+[wdhm]$/,
      "Time spent must be in format like '2w', '3d', '4h', '30m'",
    ),

  // Optional fields
  comment: z
    .string()
    .max(32767, "Comment too long (max 32,767 characters)")
    .optional(),

  started: z
    .string()
    .datetime("Started time must be a valid ISO datetime")
    .optional(),

  // Visibility settings
  visibility: z
    .object({
      type: z.enum(["group", "role"]),
      value: z.string().min(1),
    })
    .optional(),
});

/**
 * Type for add worklog parameters
 */
export type AddWorklogParams = z.infer<typeof addWorklogParamsSchema>;

/**
 * Schema for updating worklog parameters
 */
export const updateWorklogParamsSchema = z.object({
  issueKey: issueKeySchema,
  worklogId: z.string().min(1, "Worklog ID is required"),

  // Fields to update
  timeSpent: z
    .string()
    .min(1, "Time spent is required")
    .regex(
      /^\d+[wdhm]$/,
      "Time spent must be in format like '2w', '3d', '4h', '30m'",
    )
    .optional(),

  comment: z
    .string()
    .max(32767, "Comment too long (max 32,767 characters)")
    .optional(),

  started: z
    .string()
    .datetime("Started time must be a valid ISO datetime")
    .optional(),

  // Visibility settings
  visibility: z
    .object({
      type: z.enum(["group", "role"]),
      value: z.string().min(1),
    })
    .optional(),
});

/**
 * Type for update worklog parameters
 */
export type UpdateWorklogParams = z.infer<typeof updateWorklogParamsSchema>;

/**
 * Schema for deleting worklog parameters
 */
export const deleteWorklogParamsSchema = z.object({
  issueKey: issueKeySchema,
  worklogId: z.string().min(1, "Worklog ID is required"),
});

/**
 * Type for delete worklog parameters
 */
export type DeleteWorklogParams = z.infer<typeof deleteWorklogParamsSchema>;

/**
 * Schema for getting worklogs parameters
 */
export const getWorklogsParamsSchema = z.object({
  issueKey: issueKeySchema,

  // Optional pagination
  startAt: z.number().int().min(0).optional().default(0),
  maxResults: z.number().int().min(1).max(1000).optional().default(1000),

  // Optional date filtering
  startedAfter: z
    .string()
    .datetime("Started after must be a valid ISO datetime")
    .optional(),

  startedBefore: z
    .string()
    .datetime("Started before must be a valid ISO datetime")
    .optional(),
});

/**
 * Type for get worklogs parameters
 */
export type GetWorklogsParams = z.infer<typeof getWorklogsParamsSchema>;

/**
 * Interface for worklog validator
 */
export interface WorklogValidator {
  /**
   * Validate add worklog parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateAddWorklogParams(params: AddWorklogParams): AddWorklogParams;

  /**
   * Validate update worklog parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateUpdateWorklogParams(params: UpdateWorklogParams): UpdateWorklogParams;

  /**
   * Validate delete worklog parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateDeleteWorklogParams(params: DeleteWorklogParams): DeleteWorklogParams;

  /**
   * Validate get worklogs parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetWorklogsParams(params: GetWorklogsParams): GetWorklogsParams;
}

/**
 * Implementation of WorklogValidator
 */
export class WorklogValidatorImpl implements WorklogValidator {
  /**
   * Validate parameters for adding a worklog
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateAddWorklogParams(params: AddWorklogParams): AddWorklogParams {
    const result = addWorklogParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid worklog parameters: ${formatZodError(
        result.error,
      )}`;
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Validate parameters for updating a worklog
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateUpdateWorklogParams(
    params: UpdateWorklogParams,
  ): UpdateWorklogParams {
    const result = updateWorklogParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid worklog update parameters: ${formatZodError(
        result.error,
      )}`;
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Validate parameters for deleting a worklog
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateDeleteWorklogParams(
    params: DeleteWorklogParams,
  ): DeleteWorklogParams {
    const result = deleteWorklogParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid worklog delete parameters: ${formatZodError(
        result.error,
      )}`;
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Validate parameters for getting worklogs
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetWorklogsParams(
    params: GetWorklogsParams,
  ): GetWorklogsParams {
    const result = getWorklogsParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid worklogs retrieval parameters: ${formatZodError(
        result.error,
      )}`;
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }
}
