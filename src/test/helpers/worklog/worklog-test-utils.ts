/**
 * Worklog test utilities
 */
import type { McpResponse } from "@core/responses";
import type { WorklogEntry } from "@features/jira/issues/models/worklog.models";

/**
 * Creates a standard worklog entry test response
 */
export function createWorklogResponse(
  worklog: WorklogEntry,
): McpResponse<WorklogEntry> {
  return {
    success: true,
    data: worklog,
  };
}

/**
 * Creates a standard worklogs list test response
 */
export function createWorklogsResponse(
  worklogs: WorklogEntry[],
): McpResponse<WorklogEntry[]> {
  return {
    success: true,
    data: worklogs,
  };
}

/**
 * Creates a standard worklog creation success response
 */
export function createWorklogCreatedResponse(
  worklog: WorklogEntry,
): McpResponse<WorklogEntry> {
  return {
    success: true,
    data: worklog,
  };
}

/**
 * Creates a standard worklog update success response
 */
export function createWorklogUpdatedResponse(
  worklog: WorklogEntry,
): McpResponse<WorklogEntry> {
  return {
    success: true,
    data: worklog,
  };
}

/**
 * Creates a standard worklog deletion success response
 */
export function createWorklogDeletedResponse(): McpResponse<{
  message: string;
}> {
  return {
    success: true,
    data: { message: "Worklog deleted successfully" },
  };
}

/**
 * Creates a standard worklog error response
 */
export function createWorklogErrorResponse(
  message: string,
): McpResponse<unknown> {
  return {
    success: false,
    error: message,
  };
}
