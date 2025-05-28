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
  orderBy: z.enum(['created', 'updated']).optional().default('created'),
  authorFilter: z.string().min(1).optional(),
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
});

/**
 * Type for get issue comments parameters
 */
export type GetIssueCommentsParams = z.infer<typeof getIssueCommentsSchema>;

/**
 * Base schema for search parameters (without refinement)
 * Used for MCP tool parameter definition
 */
export const searchJiraIssuesBaseSchema = z.object({
  // Advanced JQL option
  jql: z.string().min(1).optional(),

  // Helper parameters (ignored if jql provided)
  assignedToMe: z.boolean().optional(),
  project: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  text: z.string().optional(),

  // Common options
  maxResults: z.number().min(1).max(50).default(25),
  fields: z.array(z.string()).optional(),
});

/**
 * Schema for search JIRA issues with hybrid JQL + helper parameters
 */
export const searchJiraIssuesSchema = searchJiraIssuesBaseSchema
  .refine(
    (data) =>
      data.jql || data.assignedToMe || data.project || data.status || data.text,
    {
      message:
        "Either 'jql' parameter or at least one helper parameter must be provided",
    }
  );

/**
 * Type for search parameters
 */
export type SearchJiraIssuesParams = z.infer<typeof searchJiraIssuesSchema>;

/**
 * Build JQL query from helper parameters
 * @param params - Search parameters
 * @returns JQL query string
 */
export function buildJQLFromHelpers(params: SearchJiraIssuesParams): string {
  // If JQL is provided directly, use it
  if (params.jql) {
    return params.jql;
  }

  const conditions: string[] = [];

  if (params.assignedToMe) {
    conditions.push("assignee = currentUser()");
  }

  if (params.project) {
    conditions.push(`project = "${params.project}"`);
  }

  if (params.status) {
    const statuses = Array.isArray(params.status)
      ? params.status
      : [params.status];
    conditions.push(
      `status IN (${statuses.map((s) => `"${s}"`).join(", ")})`
    );
  }

  if (params.text) {
    const escapedText = params.text.replace(/"/g, '\\"');
    conditions.push(
      `(summary ~ "${escapedText}" OR description ~ "${escapedText}")`
    );
  }

  return `${conditions.join(" AND ")} ORDER BY updated DESC`;
}

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
