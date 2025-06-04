/**
 * Issue Comment Validator
 *
 * Validator for issue comment-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { z } from "zod";
import { JiraApiError } from "@features/jira/client/errors";
import { issueKeySchema } from "./issue-params.validator";

/**
 * Schema for get issue comments parameters
 * Implements progressive disclosure approach from creative phase decisions
 */
export const getIssueCommentsSchema = z.object({
  // Core parameters (required/essential)
  issueKey: issueKeySchema,

  // Basic options (most common use cases)
  maxComments: z.number().int().min(1).max(100).optional().default(10),

  // Advanced options (power user features)
  includeInternal: z.boolean().optional().default(false),
  orderBy: z.enum(["created", "updated"]).optional().default("created"),
  authorFilter: z.string().min(1).optional(),
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
});

/**
 * Type for get issue comments parameters
 */
export type GetIssueCommentsParams = z.infer<typeof getIssueCommentsSchema>;

/**
 * Interface for issue comment validator
 */
export interface IssueCommentValidator {
  /**
   * Validate get issue comments parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetCommentsParams(
    params: GetIssueCommentsParams,
  ): GetIssueCommentsParams;
}

/**
 * Implementation of IssueCommentValidator
 */
export class IssueCommentValidatorImpl implements IssueCommentValidator {
  /**
   * Validate parameters for getting issue comments
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetCommentsParams(
    params: GetIssueCommentsParams,
  ): GetIssueCommentsParams {
    const result = getIssueCommentsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid issue comment parameters: ${formatZodError(
        result.error,
      )}`;
      // TODO: Validators must have specific errors
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }
}
