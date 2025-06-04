import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { GetSprintsOptions, Sprint, SprintReport } from "../models";

/**
 * Sprint repository
 */
export interface SprintRepository {
  getSprints(boardId: number, options?: GetSprintsOptions): Promise<Sprint[]>;
  getSprint(sprintId: number): Promise<Sprint>;
  getSprintReport(sprintId: number): Promise<SprintReport>;
}

/**
 * Implementation of the sprint repository
 */
export class SprintRepositoryImpl implements SprintRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get all sprints for a specific board
   */
  async getSprints(
    boardId: number,
    options?: GetSprintsOptions,
  ): Promise<Sprint[]> {
    this.logger.debug(`Getting sprints for board: ${boardId}`, {
      prefix: "JIRA:SprintRepository",
    });

    const queryParams: Record<string, string | number | undefined> = {};

    if (options?.startAt) {
      queryParams.startAt = options.startAt;
    }

    if (options?.maxResults) {
      queryParams.maxResults = options.maxResults;
    }

    if (options?.state) {
      queryParams.state = options.state;
    }

    const response = await this.httpClient.sendRequest<{ values: Sprint[] }>({
      endpoint: `board/${boardId}/sprint`,
      method: "GET",
      queryParams,
    });

    return response.values;
  }

  /**
   * Get a specific sprint by ID
   */
  async getSprint(sprintId: number): Promise<Sprint> {
    this.logger.debug(`Getting sprint: ${sprintId}`, {
      prefix: "JIRA:SprintRepository",
    });

    return this.httpClient.sendRequest<Sprint>({
      endpoint: `sprint/${sprintId}`,
      method: "GET",
    });
  }

  /**
   * Get sprint report with analytics and metrics
   */
  async getSprintReport(sprintId: number): Promise<SprintReport> {
    this.logger.debug(`Getting sprint report: ${sprintId}`, {
      prefix: "JIRA:SprintRepository",
    });

    return this.httpClient.sendRequest<SprintReport>({
      endpoint: "rapid/charts/sprintreport",
      method: "GET",
      queryParams: {
        rapidViewId: sprintId,
        sprintId,
      },
    });
  }
}
