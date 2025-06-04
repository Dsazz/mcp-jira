/**
 * Issue Description Formatter
 *
 * Handles formatting of issue descriptions with ADF parsing
 * Extracted from IssueFormatter to reduce complexity
 */
import { parseADF } from "@features/jira/shared/parsers/adf.parser";
import type { Issue } from "../models/issue.models";

/**
 * Formats issue descriptions handling both ADF and string formats
 */
export class IssueDescriptionFormatter {
  /**
   * Format the description section if it has meaningful content
   */
  formatDescription(issue: Issue): string {
    if (!issue?.fields?.description) {
      return "";
    }

    // Check if description is empty
    if (this.isEmptyDescription(issue.fields.description)) {
      return "";
    }

    let descriptionContent = "";

    // Handle ADF document or string description
    if (typeof issue.fields.description === "object") {
      descriptionContent = parseADF(issue.fields.description);
    } else {
      descriptionContent = issue.fields.description;
    }

    return `## Description\n${descriptionContent}\n\n`;
  }

  /**
   * Check if description is empty (handles both object and string types)
   */
  private isEmptyDescription(description: unknown): boolean {
    if (!description) {
      return true;
    }

    // Handle ADF object descriptions
    if (typeof description === "object") {
      const adfDescription = description as { content?: unknown[] };
      return !adfDescription.content || adfDescription.content.length === 0;
    }

    // Handle string descriptions
    if (typeof description === "string") {
      return description.trim().length === 0;
    }

    return true;
  }
}
