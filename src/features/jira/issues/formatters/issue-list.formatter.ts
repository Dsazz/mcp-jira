import type { Issue } from "@features/jira/issues/models/issue.models";
/**
 * Formatter for lists of JIRA issues to markdown
 */
import type { Formatter } from "@features/jira/shared";
/**
 * Formats a list of JIRA issues into markdown
 * Implements the Formatter interface for arrays of Issue objects
 */
export class IssueListFormatter implements Formatter<Issue[], string> {
  /**
   * Format a list of issues to markdown
   * Note: This function assumes the issues array is not empty.
   * Empty arrays should be handled before calling this function.
   */
  format(issues: Issue[]): string {
    // Note: The caller should check for empty arrays before calling this function
    let markdown = "# Your Assigned Issues\n\n";

    // Use proper singular/plural form based on count
    const issueCount = issues.length;
    const issueText = issueCount === 1 ? "issue" : "issues";
    markdown += `${issueCount} ${issueText} assigned to you\n\n`;

    // Create a table
    markdown += "| Key | Summary | Status | Priority | Updated |\n";
    markdown += "| --- | ------- | ------ | -------- | ------- |\n";

    for (const issue of issues) {
      const key = issue.key;
      const fields = issue.fields || {};
      const summary = fields.summary || "No Summary";
      const status = fields.status?.name || "Unknown";
      const priority = fields.priority?.name || "None";

      // Format the updated date if it exists
      let updated = "N/A";
      if (fields.updated) {
        const updatedDate = new Date(fields.updated);
        updated = updatedDate.toLocaleDateString();
      }

      markdown += `| ${key} | ${summary} | ${status} | ${priority} | ${updated} |\n`;
    }

    return markdown;
  }
}
