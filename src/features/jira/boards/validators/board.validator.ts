/**
 * Board Validator
 *
 * Validator for board-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { z } from "zod";
import { BoardParamsValidationError } from "./errors";

/**
 * Schema for getting boards parameters
 */
export const getBoardsParamsSchema = z.object({
  // Pagination
  startAt: z.number().int().min(0).optional().default(0),
  maxResults: z.number().int().min(1).max(50).optional().default(50),

  // Filtering options
  type: z.enum(["scrum", "kanban", "simple"]).optional(),
  name: z.string().min(1).optional(),
  projectKeyOrId: z.string().min(1).optional(),

  // Location filtering
  accountIdLocation: z.string().min(1).optional(),
  projectLocation: z.string().min(1).optional(),
  includePrivate: z.boolean().optional(),
  negateLocationFiltering: z.boolean().optional(),

  // Ordering and expansion
  orderBy: z.enum(["name", "type"]).optional(),
  expand: z.enum(["admins", "permissions"]).optional(),

  // Filter by saved filter
  filterId: z.string().min(1).optional(),
});

/**
 * Type for get boards parameters
 */
export type GetBoardsParams = z.infer<typeof getBoardsParamsSchema>;

/**
 * Schema for getting single board parameters
 */
export const getBoardParamsSchema = z.object({
  boardId: z.number().int().min(1, "Board ID must be a positive integer"),
});

/**
 * Type for get board parameters
 */
export type GetBoardParams = z.infer<typeof getBoardParamsSchema>;

/**
 * Interface for board validator
 */
export interface BoardValidator {
  /**
   * Validate get boards parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetBoardsParams(params: GetBoardsParams): GetBoardsParams;
}

/**
 * Implementation of BoardValidator
 */
export class BoardValidatorImpl implements BoardValidator {
  /**
   * Validate parameters for getting boards
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetBoardsParams(params: GetBoardsParams): GetBoardsParams {
    const result = getBoardsParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid board retrieval parameters: ${formatZodError(
        result.error,
      )}`;
      throw new BoardParamsValidationError(errorMessage, { params });
    }

    return result.data;
  }
}
