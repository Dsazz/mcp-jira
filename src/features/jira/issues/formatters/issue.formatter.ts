import type { Formatter } from "@features/jira/shared/formatters/formatter.interface";
/**
 * Issue formatter
 */
import type { Issue } from "../models/issue.models";
import {
  IssueFieldValidator,
  hasDateInfo,
  hasLabels,
  hasValidDescription,
  hasValidSelfUrl,
  validateIssue,
} from "../validators/issue-field.validator";
import { IssueDatesFormatter } from "./issue-dates.formatter";
import { IssueDescriptionFormatter } from "./issue-description.formatter";
import { IssueHeaderFormatter } from "./issue-header.formatter";

/**
 * Issue formatter class that converts issues to markdown strings using Zod schema validation
 */
export class IssueFormatter implements Formatter<Issue, string> {
  private readonly fieldValidator: IssueFieldValidator;
  private readonly headerFormatter: IssueHeaderFormatter;
  private readonly descriptionFormatter: IssueDescriptionFormatter;
  private readonly datesFormatter: IssueDatesFormatter;

  constructor() {
    this.fieldValidator = new IssueFieldValidator();
    this.headerFormatter = new IssueHeaderFormatter();
    this.descriptionFormatter = new IssueDescriptionFormatter();
    this.datesFormatter = new IssueDatesFormatter();
  }

  format(issue: Issue): string {
    if (!issue) {
      return "";
    }

    // Validate issue structure using Zod schema
    const validationResult = validateIssue(issue);
    if (!validationResult.success) {
      return this.headerFormatter.formatFallbackHeader(issue.key || "");
    }

    // Use original issue for compatibility with existing interfaces
    const validatedIssue = issue;

    // Handle case where issue exists but fields is null or undefined
    if (this.fieldValidator.hasEmptyFields(validatedIssue)) {
      return this.headerFormatter.formatFallbackHeader(
        validatedIssue.key || "",
      );
    }

    // Get safe field values using schema validation
    const safeValues = this.fieldValidator.getSafeFieldValues(validatedIssue);

    // Build the formatted output using extracted formatters
    let markdown = "";

    // Title and basic info
    markdown += this.headerFormatter.formatTitle(
      safeValues.key,
      safeValues.summary,
    );
    markdown += this.headerFormatter.formatBasicInfo(
      safeValues.status,
      safeValues.priority,
      safeValues.assignee,
    );

    // Description - use schema-based validation
    if (hasValidDescription(validatedIssue)) {
      markdown += this.descriptionFormatter.formatDescription(validatedIssue);
    }

    // Labels - use schema-based validation
    if (hasLabels(validatedIssue)) {
      markdown += this.headerFormatter.formatLabels(
        validatedIssue.fields?.labels || [],
      );
    }

    // Dates - use schema-based validation
    if (hasDateInfo(validatedIssue)) {
      markdown += this.datesFormatter.formatDates(validatedIssue);
    }

    // JIRA link - use schema-based validation
    if (hasValidSelfUrl(validatedIssue)) {
      markdown += this.headerFormatter.formatJiraLink(validatedIssue);
    }

    return markdown;
  }

  /**
   * Format an issue as a simple object (for API compatibility) with schema validation
   */
  formatAsObject(issue: Issue) {
    if (!issue) {
      return {};
    }

    // Validate issue structure using Zod schema
    const validationResult = validateIssue(issue);
    if (!validationResult.success || !issue.fields) {
      return {};
    }

    // Use original issue for compatibility with existing interfaces
    const fields = issue.fields;

    return {
      id: issue.id,
      key: issue.key,
      self: issue.self,
      fields: {
        summary: fields.summary,
        description: fields.description,
        issuetype: fields.issuetype,
        project: fields.project,
        status: fields.status,
        creator: fields.creator,
        reporter: fields.reporter,
        assignee: fields.assignee,
        created: fields.created,
        updated: fields.updated,
      },
    };
  }
}
