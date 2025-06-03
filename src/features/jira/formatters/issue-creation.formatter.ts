/**
 * Issue Creation Formatter
 *
 * Formats responses for successful issue creation with professional output,
 * direct links, and next action guidance
 */
import type { Issue } from "@features/jira/repositories/issue.models";

/**
 * Formatter for issue creation responses
 * Provides rich, actionable formatting for newly created issues
 */
export class IssueCreationFormatter {
  /**
   * Format a created issue into a comprehensive response
   *
   * @param createdIssue - The newly created JIRA issue
   * @returns Formatted string with issue details and next actions
   */
  format(createdIssue: Issue): string {
    const issueKey = createdIssue.key;
    const summary = createdIssue.fields?.summary || "No summary";
    const projectKey = this.extractProjectKey(issueKey);

    // Extract issue details using existing proper types
    const issueType = createdIssue.fields?.issuetype?.name || "Unknown";
    const status = createdIssue.fields?.status?.name || "Open";
    const assignee = createdIssue.fields?.assignee?.displayName || "Unassigned";
    const priority = createdIssue.fields?.priority?.name || "Medium";
    const reporter = createdIssue.fields?.reporter?.displayName || "Unknown";

    // Build formatted response
    return `
## ✅ Issue Created Successfully

**${issueKey}**: ${summary}

🔗 **Quick Links:**
- [View Issue](${this.buildIssueUrl(createdIssue)})
- [Edit Issue](${this.buildEditUrl(createdIssue)})
- [Add Comment](${this.buildCommentUrl(createdIssue)})

📋 **Issue Details:**
- **Project**: ${projectKey}
- **Type**: ${issueType}
- **Status**: ${status}
- **Reporter**: ${reporter}
- **Assignee**: ${assignee}
- **Priority**: ${priority}

${this.formatAdditionalDetails(createdIssue)}

🚀 **Next Actions:**
- Use \`jira_get_issue ${issueKey}\` to view full details
- Use \`jira_update_issue ${issueKey}\` to modify fields
- Use \`jira_get_issue_comments ${issueKey}\` to view comments
- Use \`search_jira_issues project=${projectKey}\` to see related issues

✨ Issue is ready for development workflow!
    `.trim();
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

    // Add description if available
    if (issue.fields?.description) {
      const description = this.truncateDescription(
        String(issue.fields.description),
      );
      details.push(`**Description:** ${description}`);
    }

    // Add labels if available
    if (issue.fields?.labels && Array.isArray(issue.fields.labels)) {
      details.push(`**Labels:** ${issue.fields.labels.join(", ")}`);
    }

    // Add components if available
    if (issue.fields?.components && Array.isArray(issue.fields.components)) {
      const components = issue.fields.components
        .map((comp: { name?: string }) => comp.name || "Unknown")
        .join(", ");
      details.push(`**Components:** ${components}`);
    }

    // Add fix versions if available
    if (issue.fields?.fixVersions && Array.isArray(issue.fields.fixVersions)) {
      const versions = issue.fields.fixVersions
        .map((version: { name?: string }) => version.name || "Unknown")
        .join(", ");
      details.push(`**Fix Versions:** ${versions}`);
    }

    // Add story points if available (common field)
    if (issue.fields?.customfield_10004) {
      details.push(`**Story Points:** ${issue.fields.customfield_10004}`);
    }

    return details.length > 0
      ? `\n📝 **Additional Details:**\n${details.map((d) => `- ${d}`).join("\n")}\n`
      : "";
  }

  /**
   * Truncate description for display
   */
  private truncateDescription(description: string, maxLength = 200): string {
    if (description.length <= maxLength) {
      return description;
    }

    return `${description.substring(0, maxLength)}...`;
  }
}
