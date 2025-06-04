/**
 * Issue update formatter
 */
import type { Formatter } from "@features/jira/shared";
import type { UpdateIssueRequest } from "@features/jira/issues/use-cases/update-issue.use-case";

/**
 * Format an issue update request for the API
 */
export function formatIssueUpdate(request: UpdateIssueRequest) {
  const fields: Record<string, any> = {};

  if (request.summary) {
    fields.summary = request.summary;
  }

  if (request.description) {
    fields.description = request.description;
  }

  if (request.customFields) {
    Object.assign(fields, request.customFields);
  }

  return {
    fields,
  };
}

/**
 * Issue update formatter class
 */
export class IssueUpdateFormatter implements Formatter<UpdateIssueRequest, any> {
  format(request: UpdateIssueRequest) {
    return formatIssueUpdate(request);
  }
}
