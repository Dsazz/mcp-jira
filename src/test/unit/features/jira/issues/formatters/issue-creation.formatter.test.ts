/**
 * Issue Creation Formatter Unit Tests
 * Comprehensive unit tests for JIRA issue creation response formatter
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { IssueCreationFormatter } from "@features/jira/issues/formatters/issue-creation.formatter";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("IssueCreationFormatter", () => {
  let formatter: IssueCreationFormatter;

  beforeEach(() => {
    formatter = new IssueCreationFormatter();
  });

  describe("basic formatting", () => {
    test("should format minimal issue correctly", async () => {
      const issue = mockFactory.createMockIssue({
        key: "TEST-123",
        id: "issue-123",
        self: "https://company.atlassian.net/rest/api/3/issue/issue-123",
        fields: {
          summary: "Test issue",
          issuetype: { name: "Task" },
          status: { name: "To Do" },
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("✅ Issue Created Successfully");
      expect(result).toContain("TEST-123");
      expect(result).toContain("Test issue");
      expect(result).toContain("**Type**: Task");
      expect(result).toContain("**Status**: To Do");
    });

    test("should format issue with all fields correctly", async () => {
      const issue = mockFactory.createMockIssue({
        key: "PROJ-456",
        id: "issue-456",
        self: "https://company.atlassian.net/rest/api/3/issue/issue-456",
        fields: {
          summary: "Complex issue with all fields",
          description: "This is a detailed description of the issue",
          issuetype: { name: "Bug" },
          status: { name: "In Progress" },
          priority: { name: "High" },
          assignee: { displayName: "John Doe", accountId: "john-123" },
          reporter: { displayName: "Jane Smith", accountId: "jane-456" },
          labels: ["urgent", "frontend", "api"],
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("PROJ-456");
      expect(result).toContain("Complex issue with all fields");
      expect(result).toContain("**Type**: Bug");
      expect(result).toContain("**Status**: In Progress");
      expect(result).toContain("**Priority**: High");
      expect(result).toContain("**Assignee**: John Doe");
      expect(result).toContain("**Reporter**: Jane Smith");
      expect(result).toContain("**Labels:** urgent, frontend, api");
      expect(result).toContain(
        "**Description:** This is a detailed description",
      );
    });

    test("should handle missing optional fields gracefully", async () => {
      const issue = mockFactory.createMockIssue({
        key: "MIN-789",
        id: "issue-789",
        self: "https://company.atlassian.net/rest/api/3/issue/issue-789",
        fields: {
          summary: "Minimal issue",
          // Missing optional fields
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("MIN-789");
      expect(result).toContain("Minimal issue");
      expect(result).toContain("**Type**: Unknown");
      expect(result).toContain("**Status**: Open");
      expect(result).toContain("**Assignee**: Unassigned");
      expect(result).toContain("**Priority**: Medium");
      expect(result).toContain("**Reporter**: Unknown");
    });
  });

  describe("URL generation", () => {
    test("should generate correct JIRA URLs from self link", async () => {
      const issue = mockFactory.createMockIssue({
        key: "URL-123",
        self: "https://mycompany.atlassian.net/rest/api/3/issue/12345",
        fields: {
          summary: "Issue with URLs",
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("🔗 **Quick Links:**");
      expect(result).toContain(
        "[View Issue](https://mycompany.atlassian.net/browse/URL-123)",
      );
      expect(result).toContain(
        "[Edit Issue](https://mycompany.atlassian.net/secure/EditIssue!default.jspa?key=URL-123)",
      );
      expect(result).toContain("[Add Comment]");
    });

    test("should handle missing self URL with fallback", async () => {
      const issue = mockFactory.createMockIssue({
        key: "FALLBACK-456",
        self: null,
        fields: {
          summary: "Issue without self URL",
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("🔗 **Quick Links:**");
      expect(result).toContain(
        "[View Issue](https://your-domain.atlassian.net/browse/FALLBACK-456)",
      );
      expect(result).toContain(
        "[Edit Issue](https://your-domain.atlassian.net/secure/EditIssue!default.jspa?key=FALLBACK-456)",
      );
    });
  });

  describe("project key extraction", () => {
    test("should extract project key correctly", async () => {
      const issue = mockFactory.createMockIssue({
        key: "MYPROJECT-789",
        fields: {
          summary: "Test project extraction",
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("**Project**: MYPROJECT");
    });

    test("should handle complex project keys", async () => {
      const issue = mockFactory.createMockIssue({
        key: "COMPLEX_PROJ-123",
        fields: {
          summary: "Complex project key",
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("**Project**: COMPLEX_PROJ");
    });
  });

  describe("additional details formatting", () => {
    test("should format components correctly", async () => {
      const issue = mockFactory.createMockIssue({
        key: "COMP-123",
        fields: {
          summary: "Issue with components",
          components: [
            { name: "Frontend" },
            { name: "Backend" },
            { name: "Database" },
          ],
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("📝 **Additional Details:**");
      expect(result).toContain("**Components:** Frontend, Backend, Database");
    });

    test("should format fix versions correctly", async () => {
      const issue = mockFactory.createMockIssue({
        key: "VER-456",
        fields: {
          summary: "Issue with fix versions",
          fixVersions: [{ name: "v1.2.0" }, { name: "v1.3.0" }],
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("📝 **Additional Details:**");
      expect(result).toContain("**Fix Versions:** v1.2.0, v1.3.0");
    });

    test("should format story points correctly", async () => {
      const issue = mockFactory.createMockIssue({
        key: "STORY-789",
        fields: {
          summary: "Issue with story points",
          customfield_10004: 8, // Story points
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("📝 **Additional Details:**");
      expect(result).toContain("**Story Points:** 8");
    });

    test("should handle components with missing names", async () => {
      const issue = mockFactory.createMockIssue({
        key: "COMP-MISSING-123",
        fields: {
          summary: "Issue with missing component names",
          components: [
            { name: "Frontend" },
            {}, // Missing name
            { name: "Backend" },
          ],
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("**Components:** Frontend, Unknown, Backend");
    });

    test("should handle fix versions with missing names", async () => {
      const issue = mockFactory.createMockIssue({
        key: "VER-MISSING-456",
        fields: {
          summary: "Issue with missing version names",
          fixVersions: [
            { name: "v1.0.0" },
            {}, // Missing name
          ],
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("**Fix Versions:** v1.0.0, Unknown");
    });
  });

  describe("description truncation", () => {
    test("should truncate long descriptions", async () => {
      const longDescription = "A".repeat(300); // 300 characters
      const issue = mockFactory.createMockIssue({
        key: "LONG-123",
        fields: {
          summary: "Issue with long description",
          description: longDescription,
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain(`**Description:** ${"A".repeat(200)}...`);
      expect(result).not.toContain("A".repeat(250));
    });

    test("should not truncate short descriptions", async () => {
      const shortDescription = "This is a short description";
      const issue = mockFactory.createMockIssue({
        key: "SHORT-456",
        fields: {
          summary: "Issue with short description",
          description: shortDescription,
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain(`**Description:** ${shortDescription}`);
      expect(result).not.toContain("...");
    });
  });

  describe("next actions", () => {
    test("should include next actions with correct issue key", async () => {
      const issue = mockFactory.createMockIssue({
        key: "ACTION-123",
        fields: {
          summary: "Issue for next actions test",
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("🚀 **Next Actions:**");
      expect(result).toContain("jira_get_issue ACTION-123");
      expect(result).toContain("jira_update_issue ACTION-123");
      expect(result).toContain("jira_get_issue_comments ACTION-123");
      expect(result).toContain("search_jira_issues project=ACTION");
    });

    test("should include completion message", async () => {
      const issue = mockFactory.createMockIssue({
        key: "COMPLETE-456",
        fields: {
          summary: "Issue for completion test",
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("✨ Issue is ready for development workflow!");
    });
  });

  describe("edge cases", () => {
    test("should handle null/undefined field values", async () => {
      const issue = mockFactory.createMockIssue({
        key: "NULL-123",
        fields: {
          summary: null,
          description: null,
          issuetype: null,
          status: null,
          priority: null,
          assignee: null,
          reporter: null,
          labels: null,
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("NULL-123");
      expect(result).toContain("No summary");
      expect(result).toContain("**Type**: Unknown");
      expect(result).toContain("**Status**: Open");
      expect(result).toContain("**Priority**: Medium");
      expect(result).toContain("**Assignee**: Unassigned");
      expect(result).toContain("**Reporter**: Unknown");
    });

    test("should handle empty arrays", async () => {
      const issue = mockFactory.createMockIssue({
        key: "EMPTY-456",
        fields: {
          summary: "Issue with empty arrays",
          labels: [],
          components: [],
          fixVersions: [],
        },
      });

      const result = formatter.format(issue);

      expect(result).toContain("EMPTY-456");
      expect(result).toContain("Issue with empty arrays");
      // Should contain additional details section but with empty values
      expect(result).toContain("📝 **Additional Details:**");
      expect(result).toContain("**Labels:** ");
      expect(result).toContain("**Components:** ");
      expect(result).toContain("**Fix Versions:** ");
    });

    test("should handle missing fields object", async () => {
      const issue = mockFactory.createMockIssue({
        key: "NO-FIELDS-789",
        fields: null,
      });

      const result = formatter.format(issue);

      expect(result).toContain("NO-FIELDS-789");
      expect(result).toContain("No summary");
      expect(result).toContain("**Type**: Unknown");
    });
  });
});
