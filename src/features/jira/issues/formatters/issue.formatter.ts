/**
 * Issue formatter
 */
import type { Issue } from "../models/issue.models";
import type { Formatter } from "@features/jira/shared/formatters/formatter.interface";
import { parseADF } from "@features/jira/shared/parsers/adf.parser";

/**
 * Issue formatter class that converts issues to markdown strings
 */
export class IssueFormatter implements Formatter<Issue, string> {
  format(issue: Issue): string {
    if (!issue) {
      return "";
    }
    
    // Handle case where issue exists but fields is null or undefined
    if (!issue.fields) {
      let markdown = issue.key ? `# ${issue.key}: No Summary\n\n` : "";
      markdown += "**Status:** Unknown\n";
      markdown += "**Priority:** None\n";
      markdown += "**Assignee:** Unassigned\n\n";
      return markdown;
    }

    // Title with key and summary
    let markdown = `# ${issue.key}: ${issue.fields.summary || "No Summary"}\n\n`;

    // Status, Priority, Assignee
    markdown += `**Status:** ${issue.fields.status?.name || "Unknown"}\n`;
    markdown += `**Priority:** ${issue.fields.priority?.name || "None"}\n`;
    markdown += `**Assignee:** ${issue.fields.assignee?.displayName || "Unassigned"}\n\n`;

    // Description - only add if description is non-empty
    if (issue.fields.description) {
      const isEmptyObject = typeof issue.fields.description === "object" && 
                           (!issue.fields.description.content || 
                            issue.fields.description.content.length === 0);
      
      if (!isEmptyObject) {
        markdown += "## Description\n";
        
        // Handle ADF document or string description
        if (typeof issue.fields.description === "object") {
          const descriptionMarkdown = parseADF(issue.fields.description);
          markdown += `${descriptionMarkdown}\n\n`;
        } else {
          markdown += `${issue.fields.description}\n\n`;
        }
      }
    }

    // Labels
    if (issue.fields.labels && issue.fields.labels.length > 0) {
      markdown += "## Labels\n";
      markdown += `${issue.fields.labels.join(", ")}\n\n`;
    }

    // Dates - only show section if at least one date exists
    if (issue.fields.created || issue.fields.updated) {
      markdown += "## Dates\n";
      if (issue.fields.created) {
        markdown += `**Created**: ${new Date(issue.fields.created).toLocaleString()}\n`;
      }
      if (issue.fields.updated) {
        markdown += `**Updated**: ${new Date(issue.fields.updated).toLocaleString()}\n`;
      }
      markdown += "\n";
    }

    // Link to JIRA
    if (issue.self) {
      const baseUrl = issue.self.split("/rest/")[0];
      markdown += `[View in JIRA](${baseUrl}/browse/${issue.key})\n`;
    }

    return markdown;
  }
  
  /**
   * Format an issue as a simple object (for API compatibility)
   */
  formatAsObject(issue: Issue) {
    if (!issue || !issue.fields) {
      return {};
    }
    
    // Cast to any to avoid index signature access requirements
    const fields = issue.fields as any;
    
    return {
      id: issue.id,
      key: issue.key,
      self: issue.self,
      fields: {
        summary: issue.fields.summary,
        description: issue.fields.description,
        issuetype: issue.fields.issuetype,
        project: fields.project,
        status: issue.fields.status,
        creator: fields.creator,
        reporter: issue.fields.reporter,
        assignee: issue.fields.assignee,
        created: issue.fields.created,
        updated: issue.fields.updated,
      },
    };
  }
}
