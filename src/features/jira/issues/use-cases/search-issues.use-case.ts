/**
 * Search Issues Use Case
 *
 * Business logic for searching JIRA issues with complex JQL query building
 * and validation capabilities
 */

import { z } from "zod";
import { JiraApiError } from "@features/jira/client/errors";
import type { IssueSearchRepository } from "../repositories";
import type { Issue } from "../repositories/issue.models";

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
export const searchJiraIssuesSchema = searchJiraIssuesBaseSchema.refine(
  (data) =>
    data.jql || data.assignedToMe || data.project || data.status || data.text,
  {
    message:
      "Either 'jql' parameter or at least one helper parameter must be provided",
  },
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
    conditions.push(`status IN (${statuses.map((s) => `"${s}"`).join(", ")})`);
  }

  if (params.text) {
    const escapedText = params.text.replace(/"/g, '\\"');
    conditions.push(
      `(summary ~ "${escapedText}" OR description ~ "${escapedText}")`,
    );
  }

  return `${conditions.join(" AND ")} ORDER BY updated DESC`;
}

/**
 * Request parameters for search issues use case
 */
export interface SearchIssuesUseCaseRequest {
  jql?: string;
  text?: string;
  project?: string;
  status?: string | string[];
  assignedToMe?: boolean;
  maxResults?: number;
  fields?: string[];
}

/**
 * Interface for search issues use case
 */
export interface SearchIssuesUseCase {
  /**
   * Execute the search issues use case
   *
   * @param request - Search parameters
   * @returns List of JIRA issues matching the search criteria
   */
  execute(request: SearchIssuesUseCaseRequest): Promise<Issue[]>;
}

/**
 * Implementation of the search issues use case
 */
export class SearchIssuesUseCaseImpl implements SearchIssuesUseCase {
  /**
   * Create a new SearchIssuesUseCase implementation
   *
   * @param issueSearchRepository - Repository for searching issues
   */
  constructor(private readonly issueSearchRepository: IssueSearchRepository) {}

  /**
   * Execute the search issues use case
   *
   * @param request - Search parameters
   * @returns List of JIRA issues matching the search criteria
   */
  public async execute(request: SearchIssuesUseCaseRequest): Promise<Issue[]> {
    try {
      // Build JQL query from search parameters
      const jqlQuery = this.buildJQLQuery(request);

      // Search for issues using repository
      return await this.issueSearchRepository.searchIssues(
        jqlQuery,
        request.fields,
        request.maxResults,
      );
    } catch (error) {
      // Rethrow with better context if needed
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(
          `Failed to search issues: ${error.message}`,
          400
        );
      }
      throw error;
    }
  }

  /**
   * Build JQL query from search parameters
   *
   * @param params - Search parameters
   * @returns JQL query string
   */
  private buildJQLQuery(params: SearchIssuesUseCaseRequest): string {
    // If JQL is provided directly, use it
    if (params.jql) {
      return params.jql;
    }

    // Build JQL from helper parameters
    const conditions: string[] = [];

    if (params.assignedToMe) {
      conditions.push("assignee = currentUser()");
    }

    if (params.project) {
      conditions.push(`project = "${params.project}"`);
    }

    if (params.status) {
      if (Array.isArray(params.status)) {
        const statusList = params.status.map((s) => `"${s}"`).join(", ");
        conditions.push(`status IN (${statusList})`);
      } else {
        conditions.push(`status = "${params.status}"`);
      }
    }

    if (params.text) {
      conditions.push(`text ~ "${params.text}"`);
    }

    // If no conditions, search for all issues
    if (conditions.length === 0) {
      return "ORDER BY updated DESC";
    }

    return `${conditions.join(" AND ")} ORDER BY updated DESC`;
  }
}
