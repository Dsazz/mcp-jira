import { parseADF } from "@features/jira/parsers/adf.parser";
/**
 * Issue Update Formatter
 *
 * Formats responses for successful issue updates with professional output,
 * change summaries, and next action guidance
 */
import type { Issue } from "@features/jira/repositories/issue.models";

/**
 * Update context information for formatting
 */
export interface UpdateContext {
  hasTransition?: boolean;
  hasWorklog?: boolean;
  fieldsUpdated?: string[];
  arraysUpdated?: string[];
}

/**
 * Formatter for issue update responses
 * Provides rich, actionable formatting for updated issues with change summaries
 */
export class IssueUpdateFormatter {
  /**
   * Format an updated issue into a comprehensive response
   *
   * @param updatedIssue - The updated JIRA issue
   * @param context - Context about what was updated
   * @returns Formatted string with issue details and change summary
   */
  format(updatedIssue: Issue, context: UpdateContext = {}): string {
    const issueKey = updatedIssue.key;
    const summary = updatedIssue.fields?.summary || "No summary";
    const projectKey = this.extractProjectKey(issueKey);

    // Extract issue details using existing proper types
    const issueType = updatedIssue.fields?.issuetype?.name || "Unknown";
    const status = updatedIssue.fields?.status?.name || "Open";
    const assignee = updatedIssue.fields?.assignee?.displayName || "Unassigned";
    const priority = updatedIssue.fields?.priority?.name || "Medium";
    const updated = updatedIssue.fields?.updated || new Date().toISOString();

    // Build formatted response
    return `
## ✅ Issue Updated Successfully

**${issueKey}**: ${summary}

🔗 **Quick Links:**
- [View Issue](${this.buildIssueUrl(updatedIssue)})
- [Edit Issue](${this.buildEditUrl(updatedIssue)})
- [Add Comment](${this.buildCommentUrl(updatedIssue)})

📋 **Current Issue Details:**
- **Project**: ${projectKey}
- **Type**: ${issueType}
- **Status**: ${status}
- **Assignee**: ${assignee}
- **Priority**: ${priority}
- **Last Updated**: ${this.formatDate(updated)}

${this.formatUpdateSummary(context)}

${this.formatAdditionalDetails(updatedIssue)}

🚀 **Next Actions:**
- Use \`jira_get_issue ${issueKey}\` to view full details
- Use \`jira_update_issue ${issueKey}\` to make additional changes
- Use \`jira_get_issue_comments ${issueKey}\` to view comments
- Use \`search_jira_issues project=${projectKey}\` to see related issues

✨ Issue update completed successfully!
    `.trim();
  }

  /**
   * Format update summary based on context
   */
  private formatUpdateSummary(context: UpdateContext): string {
    const changes: string[] = [];

    if (context.fieldsUpdated && context.fieldsUpdated.length > 0) {
      changes.push(`**Fields Updated:** ${context.fieldsUpdated.join(", ")}`);
    }

    if (context.arraysUpdated && context.arraysUpdated.length > 0) {
      changes.push(`**Arrays Modified:** ${context.arraysUpdated.join(", ")}`);
    }

    if (context.hasTransition) {
      changes.push("**Status Transition:** ✅ Applied");
    }

    if (context.hasWorklog) {
      changes.push("**Worklog Entry:** ✅ Added");
    }

    if (changes.length === 0) {
      return "\n🔄 **Changes Applied:**\n- Issue updated successfully\n";
    }

    return `\n🔄 **Changes Applied:**\n${changes.map((c) => `- ${c}`).join("\n")}\n`;
  }

  /**
   * Build JIRA issue URL for direct access
   */
  private buildIssueUrl(issue: Issue): string {
    // Extract base URL from self link
    const selfUrl = issue.self;
    if (selfUrl) {
      const baseUrl = selfUrl.split("/rest/api/")[0];
      return `${baseUrl}/browse/${issue.key}`;
    }

    // Fallback if self URL not available
    return `https://your-domain.atlassian.net/browse/${issue.key}`;
  }

  /**
   * Build JIRA edit URL for quick editing
   */
  private buildEditUrl(issue: Issue): string {
    // Extract base URL from self link
    const selfUrl = issue.self;
    if (selfUrl) {
      const baseUrl = selfUrl.split("/rest/api/")[0];
      return `${baseUrl}/secure/EditIssue!default.jspa?key=${issue.key}`;
    }

    // Fallback if self URL not available
    return `https://your-domain.atlassian.net/secure/EditIssue!default.jspa?key=${issue.key}`;
  }

  /**
   * Build JIRA comment URL for quick commenting
   */
  private buildCommentUrl(issue: Issue): string {
    // Extract base URL from self link
    const selfUrl = issue.self;
    if (selfUrl) {
      const baseUrl = selfUrl.split("/rest/api/")[0];
      return `${baseUrl}/browse/${issue.key}?focusedCommentId=&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#action_id=comment`;
    }

    // Fallback if self URL not available
    return `https://your-domain.atlassian.net/browse/${issue.key}#add-comment`;
  }

  /**
   * Extract project key from issue key
   */
  private extractProjectKey(issueKey: string): string {
    return issueKey.split("-")[0];
  }

  /**
   * Format additional issue details if available
   */
  private formatAdditionalDetails(issue: Issue): string {
    const details: string[] = [];

    // Add description if available (truncated)
    if (issue.fields?.description) {
      const description = this.truncateDescription(
        parseADF(issue.fields.description),
      );
      details.push(`**Description:** ${description}`);
    }

    // Add labels if available and not empty
    if (
      issue.fields?.labels &&
      Array.isArray(issue.fields.labels) &&
      issue.fields.labels.length > 0
    ) {
      details.push(`**Labels:** ${issue.fields.labels.join(", ")}`);
    }

    // Add components if available and not empty
    if (
      issue.fields?.components &&
      Array.isArray(issue.fields.components) &&
      issue.fields.components.length > 0
    ) {
      const components = issue.fields.components
        .map((comp: { name?: string }) => comp.name || "Unknown")
        .join(", ");
      details.push(`**Components:** ${components}`);
    }

    // Add fix versions if available and not empty
    if (
      issue.fields?.fixVersions &&
      Array.isArray(issue.fields.fixVersions) &&
      issue.fields.fixVersions.length > 0
    ) {
      const versions = issue.fields.fixVersions
        .map((version: { name?: string }) => version.name || "Unknown")
        .join(", ");
      details.push(`**Fix Versions:** ${versions}`);
    }

    // Add time tracking if available
    if (issue.fields?.timeoriginalestimate || issue.fields?.timeestimate) {
      const original = this.formatTimeTracking(
        issue.fields.timeoriginalestimate,
      );
      const remaining = this.formatTimeTracking(issue.fields.timeestimate);
      if (original || remaining) {
        details.push(
          `**Time Tracking:** Original: ${original || "None"}, Remaining: ${remaining || "None"}`,
        );
      }
    }

    // Add story points if available (common field)
    if (issue.fields?.customfield_10004) {
      details.push(`Story Points: ${issue.fields.customfield_10004}`);
    }

    return details.length > 0
      ? `\n📝 **Additional Details:**\n${details.map((d) => `- ${d}`).join("\n")}\n`
      : "";
  }

  /**
   * Format time tracking values
   */
  private formatTimeTracking(timeValue: unknown): string | null {
    if (typeof timeValue === "number") {
      // Convert seconds to human readable format
      const hours = Math.floor(timeValue / 3600);
      const minutes = Math.floor((timeValue % 3600) / 60);

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      }
      if (hours > 0) {
        return `${hours}h`;
      }
      if (minutes > 0) {
        return `${minutes}m`;
      }
    }

    if (typeof timeValue === "string") {
      return timeValue;
    }

    return null;
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  }

  /**
   * Truncate description for display
   */
  private truncateDescription(description: string, maxLength = 150): string {
    if (description.length <= maxLength) {
      return description;
    }

    return `${description.substring(0, maxLength)}...`;
  }
}
