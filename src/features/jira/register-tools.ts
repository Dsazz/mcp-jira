/**
 * JIRA Tools Registration
 *
 * Registers JIRA MCP tools with proper dependency injection
 */

import { logger } from "@core/logging";
import { type McpResponse, adaptHandler } from "@core/responses";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JiraConfig } from "./client/config";
import { JiraHttpClient } from "./client/http/jira.http-client.impl";
import {
  BoardRepositoryImpl,
  IssueCommentRepositoryImpl,
  IssueRepositoryImpl,
  IssueSearchRepositoryImpl,
  IssueTransitionRepositoryImpl,
  ProjectRepositoryImpl,
  SprintRepositoryImpl,
  UserProfileRepositoryImpl,
  WorklogRepositoryImpl,
} from "./repositories";
import { type JiraTools, createJiraTools } from "./tools";

import {
  BoardValidatorImpl,
  IssueCommentValidatorImpl,
  IssueParamsValidatorImpl,
  ProjectParamsValidatorImpl,
  ProjectPermissionCheckerImpl,
  ProjectValidatorImpl,
  SprintValidatorImpl,
  getBoardsParamsSchema,
  getIssueCommentsSchema,
  getProjectsParamsSchema,
  getSprintsParamsSchema,
  issueKeySchema,
} from "@features/jira/validators";

import {
  createIssueParamsSchema,
  searchJiraIssuesBaseSchema,
  updateIssueParamsSchema,
} from "@features/jira/use-cases";

// Import use case implementations
import {
  CreateIssueUseCaseImpl,
  GetAssignedIssuesUseCaseImpl,
  GetBoardsUseCaseImpl,
  GetIssueCommentsUseCaseImpl,
  GetIssueUseCaseImpl,
  GetProjectsUseCaseImpl,
  GetSprintsUseCaseImpl,
  SearchIssuesUseCaseImpl,
  UpdateIssueUseCaseImpl,
} from "./use-cases";

/**
 * Tool configuration interface
 */
interface ToolConfig {
  name: string;
  description: string;
  params: Record<string, unknown>;
  handler: (args: unknown) => Promise<McpResponse> | McpResponse;
}

/**
 * Register all JIRA tools with the MCP server
 *
 * @param server - MCP server instance
 */
export function registerTools(server: McpServer): void {
  try {
    // Create tools with dependencies
    const tools = createJiraToolsWithDI(JiraConfig.fromEnv());

    // Define tool configurations
    const toolConfigs: ToolConfig[] = [
      {
        name: "jira_get_issue",
        description:
          "Retrieves detailed information about a specific JIRA issue",
        params: { issueKey: issueKeySchema },
        handler: tools.jira_get_issue.handle.bind(tools.jira_get_issue),
      },
      {
        name: "jira_get_issue_comments",
        description:
          "Retrieves comments for a specific JIRA issue with configurable quantity and filtering options",
        params: getIssueCommentsSchema.shape,
        handler: tools.jira_get_issue_comments.handle.bind(
          tools.jira_get_issue_comments,
        ),
      },
      {
        name: "jira_get_assigned_issues",
        description: "Retrieves all JIRA issues assigned to the current user",
        params: {},
        handler: tools.jira_get_assigned_issues.handle.bind(
          tools.jira_get_assigned_issues,
        ),
      },
      {
        name: "jira_create_issue",
        description: "Creates a new JIRA issue with specified parameters",
        params: createIssueParamsSchema.shape,
        handler: tools.jira_create_issue.handle.bind(tools.jira_create_issue),
      },
      {
        name: "jira_update_issue",
        description:
          "Updates an existing JIRA issue with field changes, status transitions, and worklog entries",
        params: updateIssueParamsSchema.shape,
        handler: tools.jira_update_issue.handle.bind(tools.jira_update_issue),
      },
      {
        name: "search_jira_issues",
        description:
          "Search JIRA issues using JQL queries or helper parameters. Supports both expert JQL and beginner-friendly filters.",
        params: searchJiraIssuesBaseSchema.shape,
        handler: tools.jira_search_issues.handle.bind(tools.jira_search_issues),
      },
      {
        name: "jira_get_projects",
        description:
          "Get all accessible JIRA projects with filtering and search capabilities",
        params: getProjectsParamsSchema.shape,
        handler: tools.jira_get_projects.handle.bind(tools.jira_get_projects),
      },
      {
        name: "jira_get_boards",
        description:
          "Get all accessible JIRA boards with filtering by type, project, and name",
        params: getBoardsParamsSchema.shape,
        handler: tools.jira_get_boards.handle.bind(tools.jira_get_boards),
      },
      {
        name: "jira_get_sprints",
        description:
          "Get all sprints for a specific JIRA board with filtering by state",
        params: getSprintsParamsSchema.shape,
        handler: tools.jira_get_sprints.handle.bind(tools.jira_get_sprints),
      },
    ];

    // Register all tools with MCP server
    for (const config of toolConfigs) {
      server.tool(
        config.name,
        config.description,
        config.params,
        adaptHandler(config.handler),
      );
      logger.debug(`Registered tool: ${config.name}`);
    }

    logger.info("All JIRA tools registered successfully", { prefix: "JIRA" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register JIRA tools: ${errorMessage}`, {
      prefix: "JIRA",
    });
    throw new Error(`Failed to register JIRA tools: ${errorMessage}`);
  }
}

/**
 * Create JIRA tools with proper dependency injection (for testing)
 *
 * @param config - JIRA configuration
 * @returns Object containing all JIRA tool handlers
 */
export function createJiraToolsWithDI(config: JiraConfig): JiraTools {
  // Create shared HTTP client
  const httpClient = new JiraHttpClient(config);

  // Create repositories
  const issueRepository = new IssueRepositoryImpl(httpClient);
  const issueSearchRepository = new IssueSearchRepositoryImpl(httpClient);
  const issueCommentRepository = new IssueCommentRepositoryImpl(httpClient);
  const issueTransitionRepository = new IssueTransitionRepositoryImpl(
    httpClient,
  );
  const worklogRepository = new WorklogRepositoryImpl(httpClient);
  const projectRepository = new ProjectRepositoryImpl(httpClient);
  const boardRepository = new BoardRepositoryImpl(httpClient);
  const sprintRepository = new SprintRepositoryImpl(httpClient);
  const userProfileRepository = new UserProfileRepositoryImpl(httpClient);

  // Create validators
  const projectValidator = new ProjectValidatorImpl(httpClient);
  const projectPermissionChecker = new ProjectPermissionCheckerImpl(httpClient);
  const boardValidator = new BoardValidatorImpl();
  const sprintValidator = new SprintValidatorImpl();
  const issueCommentValidator = new IssueCommentValidatorImpl();
  const projectParamsValidator = new ProjectParamsValidatorImpl();
  const issueParamsValidator = new IssueParamsValidatorImpl();

  // Create use cases with appropriate dependencies
  const createIssueUseCase = new CreateIssueUseCaseImpl(
    issueRepository,
    projectValidator,
    projectPermissionChecker,
  );

  const updateIssueUseCase = new UpdateIssueUseCaseImpl(
    issueRepository,
    issueTransitionRepository,
    worklogRepository,
    projectPermissionChecker,
  );

  const searchIssuesUseCase = new SearchIssuesUseCaseImpl(
    issueSearchRepository,
  );

  const getBoardsUseCase = new GetBoardsUseCaseImpl(boardRepository);

  const getSprintsUseCase = new GetSprintsUseCaseImpl(sprintRepository);

  const getIssueCommentsUseCase = new GetIssueCommentsUseCaseImpl(
    issueCommentRepository,
  );

  const getProjectsUseCase = new GetProjectsUseCaseImpl(projectRepository);

  const getAssignedIssuesUseCase = new GetAssignedIssuesUseCaseImpl(
    issueSearchRepository,
  );

  const getIssueUseCase = new GetIssueUseCaseImpl(issueRepository);

  // Create tools with all required dependencies
  return createJiraTools({
    // Repositories
    issueRepository,
    issueSearchRepository,
    issueCommentRepository,
    issueTransitionRepository,
    worklogRepository,
    projectRepository,
    boardRepository,
    sprintRepository,
    userProfileRepository,

    // Use cases
    createIssueUseCase,
    updateIssueUseCase,
    searchIssuesUseCase,
    getBoardsUseCase,
    getSprintsUseCase,
    getIssueCommentsUseCase,
    getProjectsUseCase,
    getAssignedIssuesUseCase,
    getIssueUseCase,

    // Validators
    boardValidator,
    sprintValidator,
    issueCommentValidator,
    projectParamsValidator,
    issueParamsValidator,
  });
}
