/**
 * Issue Params Validator
 *
 * Validator for issue retrieval-related operations and parameters
 */

import { formatZodError } from "@core/utils/validation";
import { JiraApiError } from "@features/jira/client/errors";
import { z } from "zod";

/**
 * Schema for validating JIRA issue keys
 *
 * JIRA issue keys follow the pattern of project key + hyphen + number
 * For example: PROJ-123, ABC-456, etc.
 */
export const issueKeySchema = z
  .string()
  .regex(/^[A-Z]+-\d+$/, "Issue key must be in the format PROJECT-123");

/**
 * Schema for get issue parameters
 */
export const getIssueParamsSchema = z.object({
  issueKey: issueKeySchema,
  fields: z.array(z.string()).optional(),
});

/**
 * Schema for get assigned issues parameters
 * No parameters required - retrieves issues assigned to the current user
 */
export const getAssignedIssuesParamsSchema = z
  .object({})
  .describe("Retrieve all issues assigned to the current user");

/**
 * Schema for common JIRA issue fields
 */
export const issueFieldsSchema = z.object({
  id: z.string(),
  key: issueKeySchema,
  fields: z.object({
    summary: z.string().optional(),
    description: z.string().nullable().optional(),
    status: z
      .object({
        name: z.string(),
      })
      .optional(),
    priority: z
      .object({
        name: z.string(),
      })
      .optional(),
    updated: z.string().optional(),
  }),
});

/**
 * Type for JIRA issue data
 */
export type JiraIssue = z.infer<typeof issueFieldsSchema>;

/**
 * Type for JIRA issue list
 */
export type JiraIssueList = JiraIssue[];

/**
 * Parameters for getting a JIRA issue
 */
export type GetIssueParams = z.infer<typeof getIssueParamsSchema>;

/**
 * Parameters for getting assigned issues
 */
export type GetAssignedIssuesParams = z.infer<
  typeof getAssignedIssuesParamsSchema
>;

/**
 * Interface for issue params validator
 */
export interface IssueParamsValidator {
  /**
   * Validate get issue parameters
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   */
  validateGetIssueParams(params: GetIssueParams): GetIssueParams;
}

/**
 * Implementation of IssueParamsValidator
 */
export class IssueParamsValidatorImpl implements IssueParamsValidator {
  /**
   * Validate parameters for getting an issue
   *
   * @param params - Parameters to validate
   * @returns Validated parameters
   * @throws JiraApiError - If validation fails
   */
  public validateGetIssueParams(params: GetIssueParams): GetIssueParams {
    // Validate issue key
    const result = issueKeySchema.safeParse(params.issueKey);

    if (!result.success) {
      const errorMessage = `Invalid issue key: ${formatZodError(result.error)}`;
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    // Validate fields if provided
    if (params.fields && !Array.isArray(params.fields)) {
      throw JiraApiError.withStatusCode(
        "Fields must be an array of strings",
        400,
      );
    }

    return {
      issueKey: result.data,
      fields: params.fields,
    };
  }
}
