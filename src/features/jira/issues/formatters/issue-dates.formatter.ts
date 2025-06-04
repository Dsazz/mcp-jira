/**
 * Issue Dates Formatter
 *
 * Handles formatting of issue date information
 * Extracted from IssueFormatter to reduce complexity
 */
import type { Issue } from "../models/issue.models";

/**
 * Formats issue date information (created, updated)
 */
export class IssueDatesFormatter {
  /**
   * Format the dates section if at least one date exists
   */
  formatDates(issue: Issue): string {
    if (!this.hasDates(issue)) {
      return "";
    }

    const dateLines: string[] = [];

    if (issue.fields?.created) {
      const createdDate = new Date(issue.fields.created).toLocaleString();
      dateLines.push(`**Created**: ${createdDate}`);
    }

    if (issue.fields?.updated) {
      const updatedDate = new Date(issue.fields.updated).toLocaleString();
      dateLines.push(`**Updated**: ${updatedDate}`);
    }

    if (dateLines.length === 0) {
      return "";
    }

    return `## Dates\n${dateLines.join("\n")}\n\n`;
  }

  /**
   * Check if issue has any date information
   */
  private hasDates(issue: Issue): boolean {
    return !!(issue?.fields?.created || issue?.fields?.updated);
  }
}
