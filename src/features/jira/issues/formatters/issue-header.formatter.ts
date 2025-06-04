/**
 * Issue Header Formatter
 *
 * Handles formatting of issue headers and basic information
 * Extracted from IssueFormatter to reduce complexity
 */
import type { Issue } from "../models/issue.models";

/**
 * Formats issue headers and basic information sections
 */
export class IssueHeaderFormatter {
  /**
   * Format the main issue header with key and summary
   */
  formatTitle(key: string, summary: string): string {
    return `# ${key}: ${summary}\n\n`;
  }

  /**
   * Format the basic issue information section
   */
  formatBasicInfo(status: string, priority: string, assignee: string): string {
    const lines = [
      `**Status:** ${status}`,
      `**Priority:** ${priority}`,
      `**Assignee:** ${assignee}`,
    ];

    return `${lines.join("\n")}\n\n`;
  }

  /**
   * Format the labels section
   */
  formatLabels(labels: string[]): string {
    if (!labels || labels.length === 0) {
      return "";
    }

    return `## Labels\n${labels.join(", ")}\n\n`;
  }

  /**
   * Format the JIRA link section
   */
  formatJiraLink(issue: Issue): string {
    if (!issue?.self || !issue?.key) {
      return "";
    }

    const baseUrl = issue.self.split("/rest/")[0];
    return `[View in JIRA](${baseUrl}/browse/${issue.key})\n`;
  }

  /**
   * Format a fallback header for issues with missing fields
   */
  formatFallbackHeader(key: string): string {
    const lines = [
      key ? `# ${key}: No Summary\n\n` : "",
      "**Status:** Unknown",
      "**Priority:** None",
      "**Assignee:** Unassigned\n\n",
    ];

    return lines.filter((line) => line).join("\n");
  }
}
