import { parseADF } from "@features/jira/shared/parsers/adf.parser";
/**
 * Formatter for JIRA issues list to markdown
 *
 * Formats search results as rich markdown cards with description previews
 */
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { SearchJiraIssuesParams } from "@features/jira/issues/use-cases/search-issues.use-case";
import type { Formatter } from "@features/jira/shared";

/**
 * Search result metadata for formatting context
 */
export interface SearchResultMetadata {
  query: string;
  totalResults: number;
  maxResults: number;
  searchParams: SearchJiraIssuesParams;
}

/**
 * Formats a list of JIRA issues into markdown cards
 * Implements the Formatter interface for Issue arrays
 */
export class IssuesListFormatter implements Formatter<Issue[], string> {
  /**
   * Format issues list to markdown with metadata
   * @param issues - Array of JIRA issues
   * @param metadata - Optional search metadata for context
   */
  format(issues: Issue[], metadata?: SearchResultMetadata): string {
    if (!issues || issues.length === 0) {
      return this.formatEmptyResults(metadata);
    }

    let markdown = this.formatHeader(metadata, issues);

    // Add individual issue cards
    for (const issue of issues) {
      markdown += this.formatIssueCard(issue);
    }

    // Add footer with navigation hints
    markdown += this.formatFooter(metadata);

    return markdown;
  }

  /**
   * Format header with search information
   */
  private formatHeader(metadata?: SearchResultMetadata, issues?: Issue[]): string {
    // Start with the basic header
    let header = "# JIRA Search Results\n\n";

    if (metadata) {
      // Show query information from metadata
      if (metadata.searchParams.jql) {
        header += `**JQL Query**: \`${metadata.searchParams.jql}\`\n`;
      } else {
        header += "**Query**: Helper parameters\n";
        const helpers = this.formatHelperSummary(metadata.searchParams);
        if (helpers) {
          header += `**Filters**: ${helpers}\n`;
        }
      }

      // Show results count from metadata
      header += `**Results**: ${metadata.totalResults} ${metadata.totalResults === metadata.maxResults ? `(max ${metadata.maxResults})` : ""}\n\n`;
    } else if (issues) {
      // When no metadata but we have issues, show the count from the array length
      const count = issues.length;
      header += `**Found**: ${count} issue${count !== 1 ? "s" : ""}\n\n`;
    }

    header += "---\n\n";
    return header;
  }

  /**
   * Format helper parameters summary
   */
  private formatHelperSummary(params: SearchJiraIssuesParams): string {
    const filters: string[] = [];

    if (params.assignedToMe) {
      filters.push("Assigned to me");
    }

    if (params.project) {
      filters.push(`Project: ${params.project}`);
    }

    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      filters.push(`Status: ${statuses.join(", ")}`);
    }

    if (params.text) {
      filters.push(`Text: "${params.text}"`);
    }

    return filters.join(" | ");
  }

  /**
   * Format individual issue as a card
   */
  private formatIssueCard(issue: Issue): string {
    const fields = issue.fields || {};

    // Card header with issue key and summary
    let card = `## 🎫 ${issue.key}: ${fields.summary || "No Summary"}\n\n`;

    // Status, priority, and assignee line
    const statusText = fields.status?.name || "Unknown";
    const statusIcon = this.getStatusIcon(statusText);
    const priorityText = fields.priority?.name || "None";
    const assigneeText = fields.assignee?.displayName || "Unassigned";

    card += `**Status**: ${statusIcon} ${statusText} | **Priority**: ${priorityText} | **Assignee**: ${assigneeText}\n\n`;

    // Description preview (if available)
    if (fields.description) {
      const descriptionText = parseADF(fields.description);
      const preview = this.truncateText(descriptionText, 100);
      card += `**Description**: ${preview}\n\n`;
    }

    // Metadata line with dates
    const dates = this.formatDates(fields.created || undefined, fields.updated || undefined);
    if (dates) {
      card += `*${dates}*\n`;
    }

    // Action link
    card += `**[View Details →](get_jira_issue ${issue.key})**\n\n`;
    card += "---\n\n";

    return card;
  }

  /**
   * Get status icon based on status name
   */
  private getStatusIcon(status: string): string {
    const statusLower = status.toLowerCase();

    if (
      statusLower.includes("done") ||
      statusLower.includes("resolved") ||
      statusLower.includes("closed")
    ) {
      return "✅";
    }
    if (
      statusLower.includes("progress") ||
      statusLower.includes("review") ||
      statusLower.includes("testing")
    ) {
      return "🔄";
    }
    if (statusLower.includes("blocked") || statusLower.includes("impediment")) {
      return "🚫";
    }
    if (
      statusLower.includes("todo") ||
      statusLower.includes("to do") ||
      statusLower.includes("open") ||
      statusLower.includes("new")
    ) {
      return "📋";
    }

    return "🔵"; // Default
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return "";

    // Remove multiple whitespace and newlines for preview
    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    return `${cleanText.substring(0, maxLength)}...`;
  }

  /**
   * Format creation and update dates
   */
  private formatDates(created?: string, updated?: string): string {
    const parts: string[] = [];

    if (created) {
      const createdDate = new Date(created);
      parts.push(`Created: ${createdDate.toLocaleDateString()}`);
    }

    if (updated) {
      const updatedDate = new Date(updated);
      parts.push(`Updated: ${updatedDate.toLocaleDateString()}`);
    }

    return parts.join(" | ");
  }

  /**
   * Format footer with navigation hints
   */
  private formatFooter(metadata?: SearchResultMetadata): string {
    if (!metadata) return "";

    let footer = "";

    if (metadata.totalResults === metadata.maxResults) {
      footer += `*Showing first ${metadata.maxResults} results. Use \`maxResults\` parameter to see more.*\n\n`;
    }

    footer +=
      "💡 **Tip**: Use `get_jira_issue <ISSUE-KEY>` for detailed information about any issue.\n";

    return footer;
  }

  /**
   * Format empty results message
   */
  private formatEmptyResults(metadata?: SearchResultMetadata): string {
    let message = "# JIRA Search Results\n\n";

    if (metadata) {
      if (metadata.searchParams.jql) {
        message += `**JQL Query**: \`${metadata.searchParams.jql}\`\n\n`;
      } else {
        message += "**Query**: Helper parameters\n\n";
      }
    }

    message += "**Found**: 0 issues\n\n";
    message += "---\n\n";
    message += "📭 **No issues found matching your search criteria.**\n\n";
    message += "Try adjusting your search parameters or JQL query.\n";

    return message;
  }
}
