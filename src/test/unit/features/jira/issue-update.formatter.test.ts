/**
 * Issue Update Formatter Unit Tests
 * Comprehensive unit tests for JIRA issue update formatter
 */

import { beforeEach, describe, expect, test } from "bun:test";
import {
  IssueUpdateFormatter,
  type UpdateContext,
} from "@features/jira/formatters/issue-update.formatter";
import { testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("IssueUpdateFormatter", () => {
  let formatter: IssueUpdateFormatter;

  beforeEach(() => {
    formatter = new IssueUpdateFormatter();
  });

  describe("format method", () => {
    test("should format complete issue update correctly", () => {
      const issue = testDataBuilder.issueWithStatus("In Progress", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Updated test issue summary",
        status: { name: "In Progress" },
        priority: { name: "High" },
        assignee: { displayName: "John Doe", accountId: "user-123" },
        description: "This is an updated test description",
        labels: ["bug", "urgent", "updated"],
        updated: "2024-01-16T14:45:00.000Z",
        issuetype: { name: "Bug" },
        components: [{ name: "Frontend" }, { name: "API" }],
        fixVersions: [{ name: "v1.2.0" }],
      };
      issue.self = "https://company.atlassian.net/rest/api/3/issue/test-123";

      const context: UpdateContext = {
        fieldsUpdated: ["summary", "priority", "assignee"],
        arraysUpdated: ["labels", "components"],
        hasTransition: true,
        hasWorklog: false,
      };

      const result = formatter.format(issue, context);

      expect(result).toContain("✅ Issue Updated Successfully");
      expect(result).toContain("**TEST-123**: Updated test issue summary");
      expect(result).toContain("**Project**: TEST");
      expect(result).toContain("**Type**: Bug");
      expect(result).toContain("**Status**: In Progress");
      expect(result).toContain("**Assignee**: John Doe");
      expect(result).toContain("**Priority**: High");
      expect(result).toContain(
        "**Fields Updated:** summary, priority, assignee",
      );
      expect(result).toContain("**Arrays Modified:** labels, components");
      expect(result).toContain("**Status Transition:** ✅ Applied");
      expect(result).toContain(
        "**Description:** This is an updated test description",
      );
      expect(result).toContain("**Labels:** bug, urgent, updated");
      expect(result).toContain("**Components:** Frontend, API");
      expect(result).toContain("**Fix Versions:** v1.2.0");
      expect(result).toContain("[View Issue]");
      expect(result).toContain("[Edit Issue]");
      expect(result).toContain("🚀 **Next Actions:**");
      expect(result).toContain("✨ Issue update completed successfully!");
    });

    test("should handle minimal issue update", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "SIMPLE-456";
      issue.fields = {
        ...issue.fields,
        summary: "Simple issue",
        status: { name: "To Do" },
        updated: "2024-01-15T10:30:00.000Z",
      };
      issue.self = "https://company.atlassian.net/rest/api/3/issue/simple-456";

      const result = formatter.format(issue);

      expect(result).toContain("✅ Issue Updated Successfully");
      expect(result).toContain("**SIMPLE-456**: Simple issue");
      expect(result).toContain("**Project**: SIMPLE");
      expect(result).toContain("**Status**: To Do");
      expect(result).toContain("**Assignee**: Jane Assignee");
      expect(result).toContain("**Priority**: Medium");
      expect(result).toContain("[View Issue]");
      expect(result).toContain("✨ Issue update completed successfully!");
    });

    test("should handle missing summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-789";
      issue.fields = {
        ...issue.fields,
        summary: undefined,
        status: { name: "To Do" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**TEST-789**: No summary");
      expect(result).toContain("**Project**: TEST");
      expect(result).toContain("**Status**: To Do");
      expect(result).toContain("✨ Issue update completed successfully!");
    });

    test("should handle missing status", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-101";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: null,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Status**: Open");
    });

    test("should handle missing assignee", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-202";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        assignee: null,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Assignee**: Unassigned");
    });

    test("should handle missing priority", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-303";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        priority: null,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Priority**: Medium");
    });

    test("should handle missing issue type", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-404";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        issuetype: null,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Type**: Unknown");
    });

    test("should handle missing self URL", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-505";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        updated: "2024-01-15T10:30:00.000Z",
      };
      // Create issue without self property
      const issueWithoutSelf = {
        ...issue,
        self: null as string | null,
      };

      const result = formatter.format(issueWithoutSelf);

      expect(result).toContain(
        "[View Issue](https://your-domain.atlassian.net/browse/TEST-505)",
      );
      expect(result).toContain(
        "[Edit Issue](https://your-domain.atlassian.net/secure/EditIssue!default.jspa?key=TEST-505)",
      );
    });

    test("should handle empty labels array", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-606";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        labels: [],
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Labels:");
    });

    test("should handle missing labels", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-707";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        labels: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Labels:");
    });

    test("should handle empty components array", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-808";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        components: [],
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Components:");
    });

    test("should handle missing components", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-909";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        components: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Components:");
    });

    test("should handle empty fix versions array", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1010";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        fixVersions: [],
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Fix Versions:");
    });

    test("should handle missing fix versions", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1111";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        fixVersions: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Fix Versions:");
    });

    test("should handle time tracking fields", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1212";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue with time tracking",
        timeoriginalestimate: 28800, // 8 hours in seconds
        timeestimate: 14400, // 4 hours in seconds
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("Time Tracking:");
      expect(result).toContain("Original: 8h");
      expect(result).toContain("Remaining: 4h");
    });

    test("should handle missing time tracking fields", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1313";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        timeoriginalestimate: undefined,
        timeestimate: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Time Tracking:");
    });

    test("should handle story points custom field", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1414";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue with story points",
        customfield_10004: 5,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("Story Points: 5");
    });

    test("should handle missing story points", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1515";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        customfield_10004: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Story Points:");
    });

    test("should truncate long description", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1616";
      const longDescription =
        "This is a very long description that should be truncated because it exceeds the maximum length limit that we have set for descriptions in the formatter to keep the output clean and readable.";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue with long description",
        description: longDescription,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("Description:");
      expect(result).toContain("...");
    });

    test("should handle missing description", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1717";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        description: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("Description:");
    });

    test("should handle missing updated date", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-1818";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        updated: undefined,
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Last Updated**:");
      // Should use current date as fallback
    });
  });

  describe("update context handling", () => {
    test("should format fields updated context", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "CTX-001";
      issue.fields = {
        ...issue.fields,
        summary: "Context test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {
        fieldsUpdated: ["summary", "description", "priority"],
      };

      const result = formatter.format(issue, context);

      expect(result).toContain(
        "**Fields Updated:** summary, description, priority",
      );
    });

    test("should format arrays updated context", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "CTX-002";
      issue.fields = {
        ...issue.fields,
        summary: "Context test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {
        arraysUpdated: ["labels", "components", "fixVersions"],
      };

      const result = formatter.format(issue, context);

      expect(result).toContain(
        "**Arrays Modified:** labels, components, fixVersions",
      );
    });

    test("should format transition context", () => {
      const issue = testDataBuilder.issueWithStatus("In Progress", "blue");
      issue.key = "CTX-003";
      issue.fields = {
        ...issue.fields,
        summary: "Context test",
        status: { name: "In Progress" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {
        hasTransition: true,
      };

      const result = formatter.format(issue, context);

      expect(result).toContain("**Status Transition:** ✅ Applied");
    });

    test("should format worklog context", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "CTX-004";
      issue.fields = {
        ...issue.fields,
        summary: "Context test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {
        hasWorklog: true,
      };

      const result = formatter.format(issue, context);

      expect(result).toContain("**Worklog Entry:** ✅ Added");
    });

    test("should format combined context", () => {
      const issue = testDataBuilder.issueWithStatus("Done", "green");
      issue.key = "CTX-005";
      issue.fields = {
        ...issue.fields,
        summary: "Combined context test",
        status: { name: "Done" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {
        fieldsUpdated: ["summary", "assignee"],
        arraysUpdated: ["labels"],
        hasTransition: true,
        hasWorklog: true,
      };

      const result = formatter.format(issue, context);

      expect(result).toContain("**Fields Updated:** summary, assignee");
      expect(result).toContain("**Arrays Modified:** labels");
      expect(result).toContain("**Status Transition:** ✅ Applied");
      expect(result).toContain("**Worklog Entry:** ✅ Added");
    });

    test("should handle empty context", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "CTX-006";
      issue.fields = {
        ...issue.fields,
        summary: "Empty context test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {};

      const result = formatter.format(issue, context);

      expect(result).toContain("Issue updated successfully");
    });

    test("should handle undefined context", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "CTX-007";
      issue.fields = {
        ...issue.fields,
        summary: "Undefined context test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("Issue updated successfully");
    });

    test("should handle empty arrays in context", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "CTX-008";
      issue.fields = {
        ...issue.fields,
        summary: "Empty arrays context test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const context: UpdateContext = {
        fieldsUpdated: [],
        arraysUpdated: [],
        hasTransition: false,
        hasWorklog: false,
      };

      const result = formatter.format(issue, context);

      expect(result).toContain("Issue updated successfully");
      expect(result).not.toContain("Fields Updated:");
      expect(result).not.toContain("Arrays Modified:");
      expect(result).not.toContain("Status Transition:");
      expect(result).not.toContain("Worklog Entry:");
    });
  });

  describe("URL building", () => {
    test("should build correct URLs from self link", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "URL-001";
      issue.fields = {
        ...issue.fields,
        summary: "URL test",
        updated: "2024-01-15T10:30:00.000Z",
      };
      issue.self = "https://mycompany.atlassian.net/rest/api/3/issue/12345";

      const result = formatter.format(issue);

      expect(result).toContain(
        "[View Issue](https://mycompany.atlassian.net/browse/URL-001)",
      );
      expect(result).toContain(
        "[Edit Issue](https://mycompany.atlassian.net/secure/EditIssue!default.jspa?key=URL-001)",
      );
      expect(result).toContain(
        "[Add Comment](https://mycompany.atlassian.net/browse/URL-001?focusedCommentId=&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#action_id=comment)",
      );
    });

    test("should use fallback URLs when self link is missing", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "URL-002";
      issue.fields = {
        ...issue.fields,
        summary: "URL fallback test",
        updated: "2024-01-15T10:30:00.000Z",
      };
      // Create issue without self property
      const issueWithoutSelf = {
        ...issue,
        self: null as string | null,
      };

      const result = formatter.format(issueWithoutSelf);

      expect(result).toContain(
        "[View Issue](https://your-domain.atlassian.net/browse/URL-002)",
      );
      expect(result).toContain(
        "[Edit Issue](https://your-domain.atlassian.net/secure/EditIssue!default.jspa?key=URL-002)",
      );
      expect(result).toContain(
        "[Add Comment](https://your-domain.atlassian.net/browse/URL-002#add-comment)",
      );
    });
  });

  describe("project key extraction", () => {
    test("should extract project key correctly", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "MYPROJECT-12345";
      issue.fields = {
        ...issue.fields,
        summary: "Project key test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Project**: MYPROJECT");
    });

    test("should handle complex project keys", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "COMPLEX-PROJECT-KEY-999";
      issue.fields = {
        ...issue.fields,
        summary: "Complex project key test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Project**: COMPLEX");
    });
  });

  describe("next actions", () => {
    test("should include relevant next actions", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "NEXT-001";
      issue.fields = {
        ...issue.fields,
        summary: "Next actions test",
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("🚀 **Next Actions:**");
      expect(result).toContain("jira_get_issue NEXT-001");
      expect(result).toContain("jira_update_issue NEXT-001");
      expect(result).toContain("jira_get_issue_comments NEXT-001");
      expect(result).toContain("search_jira_issues project=NEXT");
    });
  });
});
