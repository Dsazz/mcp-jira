import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { Project } from "../models";

/**
 * Issue type representation from JIRA project
 */
export interface IssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask: boolean;
}

/**
 * Validator interface for project operations
 * Clear responsibility: validating project existence and issue types
 */
export interface ProjectValidator {
  validateProject(projectKey: string): Promise<Project>;
  validateIssueType(
    projectKey: string,
    issueTypeName: string,
  ): Promise<IssueType>;
  getIssueTypes(projectKey: string): Promise<IssueType[]>;
}

/**
 * Implementation of ProjectValidator
 * Extracted from JiraClient god object - validation operations only
 */
export class ProjectValidatorImpl implements ProjectValidator {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Validate that a project exists and return project details
   */
  async validateProject(projectKey: string): Promise<Project> {
    this.logger.debug(`Validating project: ${projectKey}`, {
      prefix: "JIRA:ProjectValidator",
    });

    try {
      const project = await this.httpClient.sendRequest<Project>({
        endpoint: `project/${projectKey}`,
        method: "GET",
      });

      this.logger.debug(`Project validation successful: ${projectKey}`, {
        prefix: "JIRA:ProjectValidator",
      });

      return project;
    } catch (error) {
      this.logger.error(`Project validation failed: ${projectKey}`, {
        prefix: "JIRA:ProjectValidator",
        error,
      });
      throw new Error(`Project '${projectKey}' not found or inaccessible`);
    }
  }

  /**
   * Validate that an issue type exists in the project
   */
  async validateIssueType(
    projectKey: string,
    issueTypeName: string,
  ): Promise<IssueType> {
    this.logger.debug(
      `Validating issue type: ${issueTypeName} in project: ${projectKey}`,
      {
        prefix: "JIRA:ProjectValidator",
      },
    );

    const issueTypes = await this.getIssueTypes(projectKey);
    const issueType = issueTypes.find(
      (type) => type.name.toLowerCase() === issueTypeName.toLowerCase(),
    );

    if (!issueType) {
      const availableTypes = issueTypes.map((type) => type.name).join(", ");
      throw new Error(
        `Issue type '${issueTypeName}' not found in project '${projectKey}'. Available types: ${availableTypes}`,
      );
    }

    this.logger.debug(`Issue type validation successful: ${issueTypeName}`, {
      prefix: "JIRA:ProjectValidator",
    });

    return issueType;
  }

  /**
   * Get all available issue types for a project
   */
  async getIssueTypes(projectKey: string): Promise<IssueType[]> {
    this.logger.debug(`Getting issue types for project: ${projectKey}`, {
      prefix: "JIRA:ProjectValidator",
    });

    const response = await this.httpClient.sendRequest<{
      issueTypes: IssueType[];
    }>({
      endpoint: `project/${projectKey}`,
      method: "GET",
      queryParams: {
        expand: "issueTypes",
      },
    });

    return response.issueTypes || [];
  }
}
