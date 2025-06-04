import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { WorklogEntry } from "../models";

/**
 * Repository interface for worklog operations
 * Clear responsibility: managing time tracking and worklog entries
 */
export interface WorklogRepository {
  addWorklog(
    issueKey: string,
    timeSpent: string,
    comment?: string,
    started?: string,
  ): Promise<WorklogEntry>;
  getWorklogs(issueKey: string): Promise<WorklogEntry[]>;
  updateWorklog(
    issueKey: string,
    worklogId: string,
    timeSpent: string,
    comment?: string,
  ): Promise<WorklogEntry>;
  deleteWorklog(issueKey: string, worklogId: string): Promise<void>;
}

/**
 * Implementation of WorklogRepository
 * Extracted from JiraClient god object - worklog operations only
 */
export class WorklogRepositoryImpl implements WorklogRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

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
      prefix: "JIRA:WorklogRepository",
      timeSpent,
    });

    const body: Record<string, unknown> = {
      timeSpent,
    };

    if (comment) {
      body.comment = comment;
    }

    if (started) {
      body.started = started;
    }

    const worklog = await this.httpClient.sendRequest<WorklogEntry>({
      endpoint: `issue/${issueKey}/worklog`,
      method: "POST",
      body,
    });

    this.logger.debug(`Successfully added worklog to issue: ${issueKey}`, {
      prefix: "JIRA:WorklogRepository",
      worklogId: worklog.id,
    });

    return worklog;
  }

  /**
   * Get all worklog entries for an issue
   */
  async getWorklogs(issueKey: string): Promise<WorklogEntry[]> {
    this.logger.debug(`Getting worklogs for issue: ${issueKey}`, {
      prefix: "JIRA:WorklogRepository",
    });

    const response = await this.httpClient.sendRequest<{
      worklogs: WorklogEntry[];
    }>({
      endpoint: `issue/${issueKey}/worklog`,
      method: "GET",
    });

    this.logger.debug(
      `Retrieved ${response.worklogs.length} worklogs for issue: ${issueKey}`,
      {
        prefix: "JIRA:WorklogRepository",
      },
    );

    return response.worklogs;
  }

  /**
   * Update an existing worklog entry
   */
  async updateWorklog(
    issueKey: string,
    worklogId: string,
    timeSpent: string,
    comment?: string,
  ): Promise<WorklogEntry> {
    this.logger.debug(`Updating worklog: ${worklogId} for issue: ${issueKey}`, {
      prefix: "JIRA:WorklogRepository",
    });

    const body: Record<string, unknown> = {
      timeSpent,
    };

    if (comment) {
      body.comment = comment;
    }

    const worklog = await this.httpClient.sendRequest<WorklogEntry>({
      endpoint: `issue/${issueKey}/worklog/${worklogId}`,
      method: "PUT",
      body,
    });

    this.logger.debug(`Successfully updated worklog: ${worklogId}`, {
      prefix: "JIRA:WorklogRepository",
    });

    return worklog;
  }

  /**
   * Delete a worklog entry
   */
  async deleteWorklog(issueKey: string, worklogId: string): Promise<void> {
    this.logger.debug(`Deleting worklog: ${worklogId} for issue: ${issueKey}`, {
      prefix: "JIRA:WorklogRepository",
    });

    await this.httpClient.sendRequest<void>({
      endpoint: `issue/${issueKey}/worklog/${worklogId}`,
      method: "DELETE",
    });

    this.logger.debug(`Successfully deleted worklog: ${worklogId}`, {
      prefix: "JIRA:WorklogRepository",
    });
  }
}
