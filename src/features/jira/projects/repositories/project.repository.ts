import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type {
  GetProjectsOptions,
  Project,
  ProjectPermissions,
  ProjectSearchResponse,
} from "../models";

/**
 * Repository interface for project CRUD operations and search
 * Following the cohesive repository pattern from creative design
 */
export interface ProjectRepository {
  getProjects(options?: GetProjectsOptions): Promise<Project[]>;
  getProject(projectKey: string, expand?: string[]): Promise<Project>;
  searchProjects(query: string, maxResults?: number): Promise<Project[]>;
  getProjectPermissions(projectKey: string): Promise<ProjectPermissions>;
}

/**
 * Implementation of ProjectRepository
 * Extracted from JiraClient god object - project operations only
 */
export class ProjectRepositoryImpl implements ProjectRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get all projects accessible to the user
   */
  async getProjects(options?: GetProjectsOptions): Promise<Project[]> {
    this.logger.debug("Getting projects", { prefix: "JIRA:ProjectRepository" });

    const queryParams: Record<string, string | number | undefined> = {};

    if (options?.expand && options.expand.length > 0) {
      queryParams.expand = options.expand.join(",");
    }

    if (options?.recent !== undefined) {
      queryParams.recent = options.recent;
    }

    if (options?.maxResults) {
      queryParams.maxResults = options.maxResults;
    }

    if (options?.startAt) {
      queryParams.startAt = options.startAt;
    }

    if (options?.typeKey) {
      queryParams.typeKey = options.typeKey;
    }

    if (options?.categoryId) {
      queryParams.categoryId = options.categoryId;
    }

    if (options?.properties && options.properties.length > 0) {
      queryParams.properties = options.properties.join(",");
    }

    if (options?.searchQuery) {
      queryParams.query = options.searchQuery;
    }

    if (options?.orderBy) {
      queryParams.orderBy = options.orderBy;
    }

    // Get paginated response from JIRA API
    const response = await this.httpClient.sendRequest<ProjectSearchResponse>({
      endpoint: "project/search",
      method: "GET",
      queryParams,
    });

    // Extract and return the projects array from the paginated response
    return response.values;
  }

  /**
   * Get details of a specific project
   */
  async getProject(projectKey: string, expand?: string[]): Promise<Project> {
    this.logger.debug(`Getting project: ${projectKey}`, {
      prefix: "JIRA:ProjectRepository",
    });

    const queryParams: Record<string, string | undefined> = {};
    if (expand && expand.length > 0) {
      queryParams.expand = expand.join(",");
    }

    return this.httpClient.sendRequest<Project>({
      endpoint: `project/${projectKey}`,
      method: "GET",
      queryParams,
    });
  }

  /**
   * Get project permissions for a specific project
   */
  async getProjectPermissions(projectKey: string): Promise<ProjectPermissions> {
    this.logger.debug(`Getting permissions for project: ${projectKey}`, {
      prefix: "JIRA:ProjectRepository",
    });

    return this.httpClient.sendRequest<ProjectPermissions>({
      endpoint: "user/permission/search",
      method: "GET",
      queryParams: {
        projectKey,
        permissions: "CREATE_ISSUES,EDIT_ISSUES,DELETE_ISSUES",
      },
    });
  }

  /**
   * Search for projects by query string
   */
  async searchProjects(query: string, maxResults = 50): Promise<Project[]> {
    this.logger.debug(`Searching projects with query: ${query}`, {
      prefix: "JIRA:ProjectRepository",
    });

    const queryParams: Record<string, string | number | undefined> = {
      query,
      maxResults,
    };

    // Get paginated response from JIRA API
    const response = await this.httpClient.sendRequest<ProjectSearchResponse>({
      endpoint: "project/search",
      method: "GET",
      queryParams,
    });

    // Extract and return the projects array from the paginated response
    return response.values;
  }
}
