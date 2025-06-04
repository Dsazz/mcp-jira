/**
 * Issue create formatter
 */
import type { CreateIssueRequest } from "@features/jira/issues/use-cases/create-issue.use-case";
import type { StringFormatter } from "@features/jira/shared";
import { parseADF } from "@features/jira/shared/parsers/adf.parser";

/**
 * Builder class for formatting issue creation request sections
 */
class IssueCreateSectionBuilder {
  private sections: string[] = [];

  constructor() {
    this.sections = [];
  }

  /**
   * Add header section
   */
  addHeader(): this {
    this.sections.push("# 🆕 Creating New Issue");
    return this;
  }

  /**
   * Add basic required information
   */
  addBasicInformation(request: CreateIssueRequest): this {
    this.sections.push(`**Project:** ${request.fields.project.key}`);
    this.sections.push(`**Issue Type:** ${request.fields.issuetype.name}`);
    this.sections.push(`**Summary:** ${request.fields.summary}`);

    // Description (handle ADF format)
    if (request.fields.description) {
      this.sections.push("**Description:**");
      const descriptionText = parseADF(request.fields.description);
      this.sections.push(descriptionText);
    }
    return this;
  }

  /**
   * Add optional single-value fields
   */
  addOptionalFields(request: CreateIssueRequest): this {
    if (request.fields.priority) {
      this.sections.push(`**Priority:** ${request.fields.priority.name}`);
    }

    if (request.fields.assignee) {
      this.sections.push(`**Assignee:** ${request.fields.assignee.accountId}`);
    }

    if (request.fields.environment) {
      this.sections.push("**Environment:**");
      const environmentText = parseADF(request.fields.environment);
      this.sections.push(environmentText);
    }
    return this;
  }

  /**
   * Add array-based fields
   */
  addArrayFields(request: CreateIssueRequest): this {
    if (request.fields.labels && request.fields.labels.length > 0) {
      this.sections.push(`**Labels:** ${request.fields.labels.join(", ")}`);
    }

    if (request.fields.components && request.fields.components.length > 0) {
      const componentNames = request.fields.components
        .map((c) => c.name)
        .join(", ");
      this.sections.push(`**Components:** ${componentNames}`);
    }

    if (request.fields.fixVersions && request.fields.fixVersions.length > 0) {
      const versionNames = request.fields.fixVersions
        .map((v) => v.name)
        .join(", ");
      this.sections.push(`**Fix Versions:** ${versionNames}`);
    }
    return this;
  }

  /**
   * Add time tracking and project-related fields
   */
  addTimeAndProjectFields(request: CreateIssueRequest): this {
    if (request.fields.parent) {
      this.sections.push(`**Parent Issue:** ${request.fields.parent.key}`);
    }

    if (request.fields.timetracking?.originalEstimate) {
      this.sections.push(
        `**Original Estimate:** ${request.fields.timetracking.originalEstimate}`,
      );
    }

    if (request.fields.customfield_10016) {
      this.sections.push(
        `**Story Points:** ${request.fields.customfield_10016}`,
      );
    }
    return this;
  }

  /**
   * Add any custom fields not in the known fields set
   */
  addCustomFields(request: CreateIssueRequest): this {
    const knownFields = new Set([
      "project",
      "issuetype",
      "summary",
      "description",
      "priority",
      "assignee",
      "labels",
      "components",
      "fixVersions",
      "parent",
      "timetracking",
      "environment",
      "customfield_10016",
    ]);

    const customFields = Object.entries(request.fields).filter(
      ([key]) => !knownFields.has(key),
    );

    if (customFields.length > 0) {
      this.sections.push("**Custom Fields:**");
      for (const [key, value] of customFields) {
        this.sections.push(`• **${key}:** ${JSON.stringify(value)}`);
      }
    }
    return this;
  }

  /**
   * Build the final formatted string
   */
  build(): string {
    return this.sections.join("\n\n");
  }
}

/**
 * Formatter class for issue creation requests - formats for display
 */
export class IssueCreateFormatter
  implements StringFormatter<CreateIssueRequest>
{
  /**
   * Format an issue creation request for display
   */
  format(request: CreateIssueRequest): string {
    return new IssueCreateSectionBuilder()
      .addHeader()
      .addBasicInformation(request)
      .addOptionalFields(request)
      .addArrayFields(request)
      .addTimeAndProjectFields(request)
      .addCustomFields(request)
      .build();
  }
}
