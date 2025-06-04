import { logger } from "@core/logging";
/**
 * JIRA API Client Implementation
 *
 * High-level client for interacting with JIRA API
 */
import type {
  Board,
  BoardConfiguration,
  GetBoardsOptions,
  GetProjectsOptions,
  GetSprintsOptions,
  IssueUpdateRequest,
  JiraApiClient,
  Project,
  ProjectPermissions,
  Sprint,
  SprintReport,
  Transition,
  WorklogEntry,
} from "./jira.client.types";
import type { JiraConfig } from "./jira.config.types";
import {
  IssueCreationError,
  IssueTypeValidationError,
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
  ProjectValidationError,
} from "./jira.errors";
import { JiraHttpClient } from "./jira.http-client.impl";
import type { HttpClient } from "./jira.http.types";
import type {
  Comment,
  CommentsResult,
  GetCommentsOptions,
  Issue,
  SearchResult,
} from "./jira.models.types";
import type {
  IssueResponse,
  IssuesResponse,
  NewIssueResponse,
} from "./jira.responses.types";
import type { CreateIssueRequest } from "./jira.schemas";

/**
 * JIRA client for interacting with JIRA API
 */
export class JiraClient implements JiraApiClient {
  private readonly logger = logger;
  protected readonly httpClient: HttpClient;

  /**
   * Create a new JIRA client
   *
   * @param jiraConfig - JIRA configuration object
   * @throws JiraApiError if validation fails
   */
  constructor(jiraConfig: JiraConfig) {
    // Validate configuration
    const validation = jiraConfig.validate();

    if (!validation.valid) {
      // Log validation failure at client level
      this.logger.error("JIRA client configuration is invalid", {
        prefix: "JIRA:Client",
      });

      // Throw error with validation details
      throw new JiraApiError(
        `JIRA configuration is invalid:\n${validation.errors.map((err) => `- ${err}`).join("\n")}`,
      );
    }

    this.logger.info(
      `JIRA client configured successfully for ${jiraConfig.get().hostUrl}`,
      { prefix: "JIRA:Client" },
    );
    this.httpClient = new JiraHttpClient(jiraConfig);
  }

  /**
   * Get details of a specific issue
   */
  async getIssue(issueKey: string, fields?: string[]): Promise<Issue> {
    this.logger.debug(`Getting issue: ${issueKey}`, { prefix: "JIRA:Client" });

    const queryParams: Record<string, string | undefined> = {};
    if (fields && fields.length > 0) {
      queryParams.fields = fields.join(",");
    }

    return this.httpClient.sendRequest<Issue>({
      endpoint: `issue/${issueKey}`,
      method: "GET",
      queryParams,
    });
  }

  /**
   * Get comments for a specific issue
   */
  async getIssueComments(
    issueKey: string,
    options?: GetCommentsOptions,
  ): Promise<Comment[]> {
    this.logger.debug(`Getting comments for issue: ${issueKey}`, {
      prefix: "JIRA:Client",
    });

    const queryParams: Record<string, string | number | undefined> = {};

    if (options?.maxComments) {
      queryParams.maxResults = options.maxComments;
    }

    if (options?.startAt) {
      queryParams.startAt = options.startAt;
    }

    if (options?.orderBy) {
      queryParams.orderBy = options.orderBy;
    }

    if (options?.expand && options.expand.length > 0) {
      queryParams.expand = options.expand.join(",");
    }

    const response = await this.httpClient.sendRequest<CommentsResult>({
      endpoint: `issue/${issueKey}/comment`,
      method: "GET",
      queryParams,
    });

    return response.comments;
  }

  /**
   * Get details for a specific issue with response wrapper
   */
  async getIssueWithResponse(issueKey: string): Promise<IssueResponse> {
    try {
      const issue = await this.getIssue(issueKey);
      return {
        success: true,
        data: issue,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(
    jql: string,
    fields?: string[],
    maxResults = 50,
  ): Promise<Issue[]> {
    this.logger.debug(`Searching issues with JQL: ${jql}`, {
      prefix: "JIRA:Client",
    });

    const queryParams: Record<string, string | number | undefined> = {
      jql,
      maxResults,
    };

    if (fields && fields.length > 0) {
      queryParams.fields = fields.join(",");
    }

    const response = await this.httpClient.sendRequest<SearchResult>({
      endpoint: "search",
      method: "GET",
      queryParams,
    });

    return response.issues;
  }

  /**
   * Get issues assigned to the current user
   */
  async getAssignedIssues(fields?: string[]): Promise<Issue[]> {
    this.logger.debug("Getting issues assigned to current user", {
      prefix: "JIRA:Client",
    });

    const jql = "assignee = currentUser() ORDER BY updated DESC";
    return this.searchIssues(jql, fields);
  }

  /**
   * Get assigned issues with response wrapper
   */
  async getAssignedIssuesWithResponse(): Promise<IssuesResponse> {
    try {
      const issues = await this.getAssignedIssues();
      return {
        success: true,
        data: issues,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(
    projectKey: string,
    summary: string,
    issueType = "Task",
    description = "",
    additionalFields: Record<string, unknown> = {},
  ): Promise<NewIssueResponse> {
    this.logger.debug(`Creating issue in project: ${projectKey}`, {
      prefix: "JIRA:Client",
    });

    const body = {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
        ...additionalFields,
      },
    };

    return this.httpClient.sendRequest({
      endpoint: "issue",
      method: "POST",
      body,
    });
  }

  /**
   * Create a new issue with comprehensive parameters
   */
  async createIssueWithParams(issueData: CreateIssueRequest): Promise<Issue> {
    this.logger.debug(
      `Creating issue with enhanced parameters in project: ${issueData.projectKey}`,
      {
        prefix: "JIRA:Client",
      },
    );

    // Build the JIRA API request body
    const fields: Record<string, unknown> = {
      project: { key: issueData.projectKey },
      summary: issueData.summary,
      issuetype: { name: issueData.issueType },
    };

    // Add optional description
    if (issueData.description) {
      fields.description = issueData.description;
    }

    // Add optional priority
    if (issueData.priority) {
      fields.priority = { name: issueData.priority };
    }

    // Add optional assignee
    if (issueData.assignee) {
      // Support both email and accountId formats
      fields.assignee = issueData.assignee.includes("@")
        ? { emailAddress: issueData.assignee }
        : { accountId: issueData.assignee };
    }

    // Add optional labels
    if (issueData.labels && issueData.labels.length > 0) {
      fields.labels = issueData.labels;
    }

    // Add optional components
    if (issueData.components && issueData.components.length > 0) {
      fields.components = issueData.components.map((name) => ({ name }));
    }

    // Add optional fix versions
    if (issueData.fixVersions && issueData.fixVersions.length > 0) {
      fields.fixVersions = issueData.fixVersions.map((name) => ({ name }));
    }

    // Add optional parent issue (for subtasks)
    if (issueData.parentIssueKey) {
      fields.parent = { key: issueData.parentIssueKey };
    }

    // Add optional time estimate
    if (issueData.timeEstimate) {
      fields.timeoriginalestimate = issueData.timeEstimate;
    }

    // Add optional environment (for bugs)
    if (issueData.environment) {
      fields.environment = issueData.environment;
    }

    // Add optional story points (if supported by project)
    if (issueData.storyPoints !== undefined) {
      fields.customfield_10004 = issueData.storyPoints; // Common story points field
    }

    // Add any additional custom fields
    if (issueData.customFields) {
      Object.assign(fields, issueData.customFields);
    }

    const body = { fields };

    try {
      const response = await this.httpClient.sendRequest<NewIssueResponse>({
        endpoint: "issue",
        method: "POST",
        body,
      });

      // Fetch the full issue details to return
      return await this.getIssue(response.key);
    } catch (error) {
      if (error instanceof JiraApiError) {
        // Enhance error messages for better user guidance
        const response = error.response;
        if (response?.errors) {
          const fieldErrors = Object.entries(response.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(", ");
          throw new IssueCreationError(
            `Issue creation failed: ${fieldErrors}`,
            error.statusCode,
            response,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Validate that a project exists and user has CREATE_ISSUES permission
   */
  async validateProject(projectKey: string): Promise<boolean> {
    this.logger.debug(`Validating project: ${projectKey}`, {
      prefix: "JIRA:Client",
    });

    try {
      // Try to get project details and permissions
      await this.httpClient.sendRequest({
        endpoint: `project/${projectKey}`,
        method: "GET",
      });

      // If we can access the project, check create permission
      const permissions = await this.httpClient.sendRequest<{
        permissions: Record<string, { havePermission: boolean }>;
      }>({
        endpoint: "mypermissions",
        method: "GET",
        queryParams: { projectKey, permissions: "CREATE_ISSUES" },
      });

      return permissions.permissions?.CREATE_ISSUES?.havePermission || false;
    } catch (error) {
      if (error instanceof JiraApiError && error.statusCode === 404) {
        throw new ProjectValidationError(projectKey, 404);
      }
      if (error instanceof JiraApiError && error.statusCode === 403) {
        throw new ProjectValidationError(projectKey, 403);
      }
      throw error;
    }
  }

  /**
   * Get available issue types for a project
   */
  async getIssueTypes(projectKey: string): Promise<string[]> {
    this.logger.debug(`Getting issue types for project: ${projectKey}`, {
      prefix: "JIRA:Client",
    });

    try {
      const response = await this.httpClient.sendRequest<{
        issueTypes: Array<{ name: string; subtask: boolean }>;
      }>({
        endpoint: `project/${projectKey}`,
        method: "GET",
        queryParams: { expand: "issueTypes" },
      });

      return response.issueTypes
        .filter((type) => !type.subtask) // Exclude subtask types for now
        .map((type) => type.name);
    } catch (error) {
      if (error instanceof JiraApiError && error.statusCode === 404) {
        throw new ProjectValidationError(projectKey, 404);
      }
      throw error;
    }
  }

  /**
   * Validate that an issue type is available for a project
   */
  async validateIssueType(
    projectKey: string,
    issueType: string,
  ): Promise<boolean> {
    try {
      const availableTypes = await this.getIssueTypes(projectKey);
      return availableTypes.includes(issueType);
    } catch (error) {
      this.logger.error(
        `Failed to validate issue type ${issueType} for project ${projectKey}`,
        {
          prefix: "JIRA:Client",
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw new IssueTypeValidationError(projectKey, issueType, 500);
    }
  }

  /**
   * Update an existing issue with comprehensive field and transition support
   */
  async updateIssue(
    issueKey: string,
    updates: IssueUpdateRequest,
  ): Promise<Issue> {
    this.logger.debug(`Updating issue: ${issueKey}`, { prefix: "JIRA:Client" });

    try {
      // Prepare the update payload
      const updatePayload: Record<string, unknown> = {};

      if (updates.fields) {
        updatePayload.fields = updates.fields;
      }

      if (updates.update) {
        updatePayload.update = updates.update;
      }

      if (updates.transition) {
        updatePayload.transition = updates.transition;
      }

      if (updates.notifyUsers !== undefined) {
        updatePayload.notifyUsers = updates.notifyUsers;
      }

      // Send the update request
      await this.httpClient.sendRequest({
        endpoint: `issue/${issueKey}`,
        method: "PUT",
        body: updatePayload,
      });

      // Return the updated issue
      return this.getIssue(issueKey);
    } catch (error) {
      this.logger.error(`Failed to update issue ${issueKey}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof JiraNotFoundError) {
        throw new JiraNotFoundError("Issue", issueKey);
      }

      if (error instanceof JiraPermissionError) {
        throw new JiraPermissionError(
          `Insufficient permissions to update issue ${issueKey}`,
        );
      }

      throw new JiraApiError(
        `Failed to update issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get available transitions for an issue
   */
  async getIssueTransitions(issueKey: string): Promise<Transition[]> {
    this.logger.debug(`Getting transitions for issue: ${issueKey}`, {
      prefix: "JIRA:Client",
    });

    try {
      const response = await this.httpClient.sendRequest<{
        transitions: Transition[];
      }>({
        endpoint: `issue/${issueKey}/transitions`,
        method: "GET",
      });

      return response.transitions;
    } catch (error) {
      this.logger.error(`Failed to get transitions for issue ${issueKey}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof JiraNotFoundError) {
        throw new JiraNotFoundError("Issue", issueKey);
      }

      throw new JiraApiError(
        `Failed to get transitions for issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Transition an issue to a new status
   */
  async transitionIssue(
    issueKey: string,
    transitionId: string,
    fields?: Record<string, unknown>,
  ): Promise<void> {
    this.logger.debug(
      `Transitioning issue ${issueKey} with transition ${transitionId}`,
      { prefix: "JIRA:Client" },
    );

    try {
      const transitionPayload: Record<string, unknown> = {
        transition: {
          id: transitionId,
        },
      };

      if (fields) {
        transitionPayload.fields = fields;
      }

      await this.httpClient.sendRequest({
        endpoint: `issue/${issueKey}/transitions`,
        method: "POST",
        body: transitionPayload,
      });

      this.logger.debug(`Successfully transitioned issue ${issueKey}`, {
        prefix: "JIRA:Client",
      });
    } catch (error) {
      this.logger.error(`Failed to transition issue ${issueKey}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof JiraNotFoundError) {
        throw new JiraNotFoundError("Issue", issueKey);
      }

      if (error instanceof JiraPermissionError) {
        throw new JiraPermissionError(
          `Insufficient permissions to transition issue ${issueKey}`,
        );
      }

      throw new JiraApiError(
        `Failed to transition issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Add a worklog entry to an issue for time tracking
   */
  async addWorklog(
    issueKey: string,
    timeSpent: string,
    comment?: string,
    started?: string,
  ): Promise<WorklogEntry> {
    this.logger.debug(`Adding worklog to issue: ${issueKey}`, {
      prefix: "JIRA:Client",
    });

    try {
      const worklogData: Record<string, unknown> = {
        timeSpent,
      };

      if (comment) {
        worklogData.comment = comment;
      }

      if (started) {
        worklogData.started = started;
      }

      const response = await this.httpClient.sendRequest<WorklogEntry>({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: worklogData,
      });

      this.logger.debug(`Successfully added worklog to issue ${issueKey}`, {
        prefix: "JIRA:Client",
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to add worklog to issue ${issueKey}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof JiraNotFoundError) {
        throw new JiraNotFoundError("Issue", issueKey);
      }

      if (error instanceof JiraPermissionError) {
        throw new JiraPermissionError(
          `Insufficient permissions to add worklog to issue ${issueKey}`,
        );
      }

      throw new JiraApiError(
        `Failed to add worklog to issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<unknown> {
    this.logger.debug("Getting current user information", {
      prefix: "JIRA:Client",
    });

    return this.httpClient.sendRequest<unknown>({
      endpoint: "myself",
      method: "GET",
    });
  }

  /**
   * Get all projects accessible to the current user
   */
  async getProjects(options?: GetProjectsOptions): Promise<Project[]> {
    this.logger.debug("Fetching projects", { prefix: "JIRA:Client" });

    try {
      const params = new URLSearchParams();

      if (options?.expand?.length) {
        params.append("expand", options.expand.join(","));
      }

      if (options?.recent) {
        params.append("recent", options.recent.toString());
      }

      if (options?.properties?.length) {
        params.append("properties", options.properties.join(","));
      }

      if (options?.typeKey) {
        params.append("typeKey", options.typeKey);
      }

      if (options?.categoryId) {
        params.append("categoryId", options.categoryId.toString());
      }

      if (options?.searchQuery) {
        params.append("query", options.searchQuery);
      }

      if (options?.orderBy) {
        params.append("orderBy", options.orderBy);
      }

      if (options?.maxResults) {
        params.append("maxResults", options.maxResults.toString());
      }

      if (options?.startAt) {
        params.append("startAt", options.startAt.toString());
      }

      const queryString = params.toString();
      const url = queryString
        ? `/project/search?${queryString}`
        : "/project/search";

      const response = await this.httpClient.sendRequest<{ values: Project[] }>(
        {
          endpoint: url,
          method: "GET",
        },
      );

      // Handle both paginated and direct array responses
      const projects = response.values || response;

      this.logger.debug(`Successfully fetched ${projects.length} projects`, {
        prefix: "JIRA:Client",
      });
      return projects as Project[];
    } catch (error) {
      this.logger.error("Failed to fetch projects", {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get details of a specific project
   */
  async getProject(projectKey: string, expand?: string[]): Promise<Project> {
    this.logger.debug(`Fetching project: ${projectKey}`, {
      prefix: "JIRA:Client",
    });

    try {
      const params = new URLSearchParams();

      if (expand?.length) {
        params.append("expand", expand.join(","));
      }

      const queryString = params.toString();
      const url = queryString
        ? `/project/${projectKey}?${queryString}`
        : `/project/${projectKey}`;

      const response = await this.httpClient.sendRequest<Project>({
        endpoint: url,
        method: "GET",
      });

      this.logger.debug(`Successfully fetched project: ${projectKey}`, {
        prefix: "JIRA:Client",
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch project ${projectKey}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch project ${projectKey}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get permissions for a specific project
   */
  async getProjectPermissions(projectKey: string): Promise<ProjectPermissions> {
    this.logger.debug(`Fetching permissions for project: ${projectKey}`, {
      prefix: "JIRA:Client",
    });

    try {
      const response = await this.httpClient.sendRequest<ProjectPermissions>({
        endpoint: `/user/permission/search?projectKey=${projectKey}`,
        method: "GET",
      });

      this.logger.debug(
        `Successfully fetched permissions for project: ${projectKey}`,
        { prefix: "JIRA:Client" },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch permissions for project ${projectKey}`,
        {
          prefix: "JIRA:Client",
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw new JiraApiError(
        `Failed to fetch permissions for project ${projectKey}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Search projects by name or key
   */
  async searchProjects(query: string, maxResults = 50): Promise<Project[]> {
    this.logger.debug(`Searching projects with query: ${query}`, {
      prefix: "JIRA:Client",
    });

    try {
      const params = new URLSearchParams({
        query,
        maxResults: maxResults.toString(),
      });

      const response = await this.httpClient.sendRequest<{ values: Project[] }>(
        {
          endpoint: `/project/search?${params.toString()}`,
          method: "GET",
        },
      );

      // Handle both paginated and direct array responses
      const projects = response.values || response;

      this.logger.debug(
        `Found ${projects.length} projects matching query: ${query}`,
        { prefix: "JIRA:Client" },
      );
      return projects as Project[];
    } catch (error) {
      this.logger.error(`Failed to search projects with query ${query}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to search projects with query "${query}": ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get all boards accessible to the current user
   */
  async getBoards(options?: GetBoardsOptions): Promise<Board[]> {
    this.logger.debug("Fetching boards", { prefix: "JIRA:Client" });

    try {
      const params = new URLSearchParams();

      if (options?.startAt) {
        params.append("startAt", options.startAt.toString());
      }

      if (options?.maxResults) {
        params.append("maxResults", options.maxResults.toString());
      }

      if (options?.type) {
        params.append("type", options.type);
      }

      if (options?.name) {
        params.append("name", options.name);
      }

      if (options?.projectKeyOrId) {
        params.append("projectKeyOrId", options.projectKeyOrId);
      }

      if (options?.accountIdLocation) {
        params.append("accountIdLocation", options.accountIdLocation);
      }

      if (options?.projectLocation) {
        params.append("projectLocation", options.projectLocation);
      }

      if (options?.includePrivate !== undefined) {
        params.append("includePrivate", options.includePrivate.toString());
      }

      if (options?.negateLocationFiltering !== undefined) {
        params.append(
          "negateLocationFiltering",
          options.negateLocationFiltering.toString(),
        );
      }

      if (options?.orderBy) {
        params.append("orderBy", options.orderBy);
      }

      if (options?.expand) {
        params.append("expand", options.expand);
      }

      if (options?.filterId) {
        params.append("filterId", options.filterId.toString());
      }

      const queryString = params.toString();
      const url = queryString
        ? `/rest/agile/1.0/board?${queryString}`
        : "/rest/agile/1.0/board";

      const response = await this.httpClient.sendRequest<{ values: Board[] }>({
        endpoint: url,
        method: "GET",
      });

      const boards = response.values || response;

      this.logger.debug(`Successfully fetched ${boards.length} boards`, {
        prefix: "JIRA:Client",
      });
      return boards as Board[];
    } catch (error) {
      this.logger.error("Failed to fetch boards", {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch boards: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get details of a specific board
   */
  async getBoard(boardId: number): Promise<Board> {
    this.logger.debug(`Fetching board: ${boardId}`, { prefix: "JIRA:Client" });

    try {
      const response = await this.httpClient.sendRequest<Board>({
        endpoint: `/rest/agile/1.0/board/${boardId}`,
        method: "GET",
      });

      this.logger.debug(`Successfully fetched board: ${boardId}`, {
        prefix: "JIRA:Client",
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch board ${boardId}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch board ${boardId}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get configuration details for a specific board
   */
  async getBoardConfiguration(boardId: number): Promise<BoardConfiguration> {
    this.logger.debug(`Fetching board configuration: ${boardId}`, {
      prefix: "JIRA:Client",
    });

    try {
      const response = await this.httpClient.sendRequest<BoardConfiguration>({
        endpoint: `/rest/agile/1.0/board/${boardId}/configuration`,
        method: "GET",
      });

      this.logger.debug(
        `Successfully fetched board configuration: ${boardId}`,
        { prefix: "JIRA:Client" },
      );
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch board configuration ${boardId}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch board configuration ${boardId}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get all sprints for a specific board
   */
  async getSprints(
    boardId: number,
    options?: GetSprintsOptions,
  ): Promise<Sprint[]> {
    this.logger.debug(`Fetching sprints for board: ${boardId}`, {
      prefix: "JIRA:Client",
    });

    try {
      const params = new URLSearchParams();

      if (options?.startAt) {
        params.append("startAt", options.startAt.toString());
      }

      if (options?.maxResults) {
        params.append("maxResults", options.maxResults.toString());
      }

      if (options?.state) {
        params.append("state", options.state);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/rest/agile/1.0/board/${boardId}/sprint?${queryString}`
        : `/rest/agile/1.0/board/${boardId}/sprint`;

      const response = await this.httpClient.sendRequest<{ values: Sprint[] }>({
        endpoint: url,
        method: "GET",
      });

      const sprints = response.values || response;

      this.logger.debug(
        `Successfully fetched ${sprints.length} sprints for board: ${boardId}`,
        { prefix: "JIRA:Client" },
      );
      return sprints as Sprint[];
    } catch (error) {
      this.logger.error(`Failed to fetch sprints for board ${boardId}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch sprints for board ${boardId}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get details of a specific sprint
   */
  async getSprint(sprintId: number): Promise<Sprint> {
    this.logger.debug(`Fetching sprint: ${sprintId}`, {
      prefix: "JIRA:Client",
    });

    try {
      const response = await this.httpClient.sendRequest<Sprint>({
        endpoint: `/rest/agile/1.0/sprint/${sprintId}`,
        method: "GET",
      });

      this.logger.debug(`Successfully fetched sprint: ${sprintId}`, {
        prefix: "JIRA:Client",
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch sprint ${sprintId}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch sprint ${sprintId}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Get sprint report with analytics and metrics
   */
  async getSprintReport(sprintId: number): Promise<SprintReport> {
    this.logger.debug(`Fetching sprint report: ${sprintId}`, {
      prefix: "JIRA:Client",
    });

    try {
      const response = await this.httpClient.sendRequest<SprintReport>({
        endpoint: `/rest/agile/1.0/sprint/${sprintId}/report`,
        method: "GET",
      });

      this.logger.debug(`Successfully fetched sprint report: ${sprintId}`, {
        prefix: "JIRA:Client",
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch sprint report ${sprintId}`, {
        prefix: "JIRA:Client",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new JiraApiError(
        `Failed to fetch sprint report ${sprintId}: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }
}

/**
 * Create a new JIRA client
 *
 * @param jiraConfig - Validated JIRA configuration object
 */
export function createJiraClient(jiraConfig: JiraConfig): JiraClient {
  return new JiraClient(jiraConfig);
}
