/**
 * Sprint Validator
 *
 * Validator for sprint-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { z } from "zod";
import {
  SprintIdValidationError,
  SprintParamsValidationError,
} from "./errors/sprint.error";
import { SprintState } from "../models";

/**
 * Schema for getting sprints parameters
 */
export const getSprintsParamsSchema = z.object({
  boardId: z.number().int().min(1, "Board ID must be a positive integer"),

  // Pagination
  startAt: z.number().int().min(0).optional().default(0),
  maxResults: z.number().int().min(1).max(50).optional().default(50),

  // Filtering options
  state: z.nativeEnum(SprintState).optional(),
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

  /**
   * Validate get sprint parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetSprintParams(params: GetSprintParams): GetSprintParams;
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
   * @throws SprintParamsValidationError - If validation fails
   */
  public validateGetSprintsParams(params: GetSprintsParams): GetSprintsParams {
    const result = getSprintsParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid sprint retrieval parameters: ${formatZodError(
        result.error,
      )}`;
      throw new SprintParamsValidationError(errorMessage, { params });
    }

    return result.data;
  }

  /**
   * Validate parameters for getting a single sprint
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws SprintIdValidationError - If validation fails
   */
  public validateGetSprintParams(params: GetSprintParams): GetSprintParams {
    const result = getSprintParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid sprint ID: ${formatZodError(result.error)}`;
      throw new SprintIdValidationError(errorMessage, { params });
    }

    return result.data;
  }
}
