/**
 * Formatter for single JIRA issue to markdown
 */
import type { Issue } from "../api/";
import type { Formatter } from "./formatter.interface";

/**
 * Formats a single JIRA issue into markdown
 * Implements the Formatter interface for Issue objects
 */
export class IssueFormatter implements Formatter<Issue> {
  /**
   * Format a single issue to markdown
   */
  format(issue: Issue): string {
    const fields = issue.fields || {};
    let markdown = `# ${issue.key}: ${fields.summary || "No Summary"}\n\n`;

    // Add status, priority, and assignee info if available
    const statusText = fields.status?.name || "Unknown";
    const priorityText = fields.priority?.name || "None";
    const assigneeText = fields.assignee?.displayName || "Unassigned";

    markdown += `**Status:** ${statusText}\n`;
    markdown += `**Priority:** ${priorityText}\n`;
    markdown += `**Assignee:** ${assigneeText}\n\n`;

    // Add description if available
    if (fields.description) {
      markdown += `## Description\n\n${fields.description}\n\n`;
    }

    // Add labels if available
    if (Array.isArray(fields.labels) && fields.labels.length > 0) {
      markdown += `## Labels\n\n${fields.labels.join(", ")}\n\n`;
    }

    // Add dates
    if (fields.created || fields.updated) {
      markdown += "## Dates\n\n";

      if (fields.created) {
        const created = new Date(fields.created);
        markdown += `**Created**: ${created.toLocaleString()}\n\n`;
      }

      if (fields.updated) {
        const updated = new Date(fields.updated);
        markdown += `**Updated**: ${updated.toLocaleString()}\n\n`;
      }
    }

    // Add link to JIRA
    if (issue.self) {
      const baseUrl = issue.self.split("/rest/")[0];
      markdown += `---\n\n[View in JIRA](${baseUrl}/browse/${issue.key})`;
    }

    return markdown;
  }
}
