/**
 * JIRA Schemas
 *
 * Common schema definitions for JIRA API data validation
 */
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
