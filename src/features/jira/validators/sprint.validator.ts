/**
 * Sprint Validator
 *
 * Validator for sprint-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { z } from "zod";
import { JiraApiError } from "@features/jira/client/errors";

/**
 * Schema for getting sprints parameters
 */
export const getSprintsParamsSchema = z.object({
  boardId: z.number().int().min(1, "Board ID must be a positive integer"),

  // Pagination
  startAt: z.number().int().min(0).optional().default(0),
  maxResults: z.number().int().min(1).max(50).optional().default(50),

  // Filtering options
  state: z.enum(["closed", "active", "future"]).optional(),
});

/**
 * Type for get sprints parameters
 */
export type GetSprintsParams = z.infer<typeof getSprintsParamsSchema>;

/**
 * Schema for getting single sprint parameters
 */
export const getSprintParamsSchema = z.object({
  sprintId: z.number().int().min(1, "Sprint ID must be a positive integer"),
});

/**
 * Type for get sprint parameters
 */
export type GetSprintParams = z.infer<typeof getSprintParamsSchema>;

/**
 * Interface for sprint validator
 */
export interface SprintValidator {
  /**
   * Validate get sprints parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetSprintsParams(params: GetSprintsParams): GetSprintsParams;
}

/**
 * Implementation of SprintValidator
 */
export class SprintValidatorImpl implements SprintValidator {
  /**
   * Validate parameters for getting sprints
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetSprintsParams(params: GetSprintsParams): GetSprintsParams {
    const result = getSprintsParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid sprint retrieval parameters: ${formatZodError(
        result.error,
      )}`;
      // TODO: Validators must have specific errors
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }
}
