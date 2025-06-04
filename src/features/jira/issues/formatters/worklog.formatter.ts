/**
 * Worklog formatter
 */
import type { AddWorklogRequest } from "@features/jira/issues/use-cases/worklog.use-cases";
import type { Formatter } from "@features/jira/shared";

/**
 * Formatter class for worklog requests
 */
export class WorklogFormatter implements Formatter<AddWorklogRequest, string> {
  /**
   * Format a worklog request for the API
   */
  format(request: AddWorklogRequest) {
    return {
      timeSpent: request.timeSpent,
      comment: request.comment,
      started: request.started,
    };
  }
}
