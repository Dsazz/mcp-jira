/**
 * Issues List Formatter Tests
 *
 * Tests for JIRA issues list markdown formatting
 */
import { describe, expect, it } from "bun:test";
import type { Issue } from "@features/jira/api/jira.models.types";
import { IssuesListFormatter } from "@features/jira/formatters/issues-list.formatter";
import type { SearchResultMetadata } from "@features/jira/formatters/issues-list.formatter";

describe("IssuesListFormatter", () => {
  const formatter = new IssuesListFormatter();

  const mockIssue: Issue = {
    id: "12345",
    key: "PROJ-123",
    self: "https://example.atlassian.net/rest/api/2/issue/12345",
    fields: {
      summary: "Sample issue summary",
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a sample description with some details about the issue.",
              },
            ],
          },
        ],
      },
      status: {
        name: "In Progress",
        statusCategory: {
          name: "In Progress",
          colorName: "yellow",
        },
      },
      priority: {
        name: "High",
        iconUrl: "https://example.com/icon.png",
      },
      assignee: {
        displayName: "John Doe",
        emailAddress: "john.doe@example.com",
        accountId: "abc123",
      },
      reporter: {
        displayName: "Jane Smith",
        emailAddress: "jane.smith@example.com",
        accountId: "def456",
      },
      created: "2024-01-15T10:30:00.000Z",
      updated: "2024-01-16T14:45:00.000Z",
      labels: ["bug", "urgent"],
    },
  };

  const mockMetadata: SearchResultMetadata = {
    query: "Test query",
    totalResults: 1,
    maxResults: 25,
    searchParams: {
      text: "bug",
      maxResults: 25,
    },
  };

  describe("format", () => {
    it("should format single issue correctly", () => {
      const result = formatter.format([mockIssue], mockMetadata);

      expect(result).toContain("# JIRA Search Results");
      expect(result).toContain("**Results**: 1");
      expect(result).toContain("## 🎫 PROJ-123: Sample issue summary");
      expect(result).toContain("**Status**: 🔄 In Progress");
      expect(result).toContain("**Priority**: High");
      expect(result).toContain("**Assignee**: John Doe");
      expect(result).toContain(
        "**Description**: This is a sample description with some details about the issue.",
      );
      expect(result).toContain("**[View Details →](get_jira_issue PROJ-123)**");
    });

    it("should format multiple issues", () => {
      const secondIssue: Issue = {
        ...mockIssue,
        id: "67890",
        key: "PROJ-124",
        fields: {
          ...mockIssue.fields,
          summary: "Another issue",
        },
      };

      const metadata: SearchResultMetadata = {
        ...mockMetadata,
        totalResults: 2,
      };

      const result = formatter.format([mockIssue, secondIssue], metadata);

      expect(result).toContain("**Results**: 2");
      expect(result).toContain("PROJ-123: Sample issue summary");
      expect(result).toContain("PROJ-124: Another issue");
    });

    it("should handle empty results", () => {
      const result = formatter.format([], mockMetadata);

      expect(result).toContain("# JIRA Search Results");
      expect(result).toContain(
        "📭 **No issues found matching your search criteria.**",
      );
      expect(result).toContain("Try adjusting your search parameters");
    });

    it("should handle issues without optional fields", () => {
      const minimalIssue: Issue = {
        id: "12345",
        key: "PROJ-123",
        self: "https://example.atlassian.net/rest/api/2/issue/12345",
        fields: {
          summary: "Minimal issue",
        },
      };

      const result = formatter.format([minimalIssue], mockMetadata);

      expect(result).toContain("PROJ-123: Minimal issue");
      expect(result).toContain("**Status**: 🔵 Unknown");
      expect(result).toContain("**Priority**: None");
      expect(result).toContain("**Assignee**: Unassigned");
      expect(result).not.toContain("**Description**:");
    });
  });

  describe("status icons", () => {
    it("should show correct icon for done status", () => {
      const doneIssue: Issue = {
        ...mockIssue,
        fields: {
          ...mockIssue.fields,
          status: { name: "Done" },
        },
      };

      const result = formatter.format([doneIssue], mockMetadata);
      expect(result).toContain("**Status**: ✅ Done");
    });

    it("should show correct icon for blocked status", () => {
      const blockedIssue: Issue = {
        ...mockIssue,
        fields: {
          ...mockIssue.fields,
          status: { name: "Blocked" },
        },
      };

      const result = formatter.format([blockedIssue], mockMetadata);
      expect(result).toContain("**Status**: 🚫 Blocked");
    });

    it("should show correct icon for todo status", () => {
      const todoIssue: Issue = {
        ...mockIssue,
        fields: {
          ...mockIssue.fields,
          status: { name: "To Do" },
        },
      };

      const result = formatter.format([todoIssue], mockMetadata);
      expect(result).toContain("**Status**: 📋 To Do");
    });
  });

  describe("description truncation", () => {
    it("should truncate long descriptions", () => {
      const longDescription = "A".repeat(150);
      const longDescIssue: Issue = {
        ...mockIssue,
        fields: {
          ...mockIssue.fields,
          description: longDescription,
        },
      };

      const result = formatter.format([longDescIssue], mockMetadata);
      expect(result).toContain(`${"A".repeat(100)}...`);
      expect(result).not.toContain("A".repeat(150));
    });

    it("should not truncate short descriptions", () => {
      const shortDescription = "Short description";
      const shortDescIssue: Issue = {
        ...mockIssue,
        fields: {
          ...mockIssue.fields,
          description: shortDescription,
        },
      };

      const result = formatter.format([shortDescIssue], mockMetadata);
      expect(result).toContain("Short description");
      expect(result).not.toContain("...");
    });
  });

  describe("metadata formatting", () => {
    it("should format JQL query metadata", () => {
      const jqlMetadata: SearchResultMetadata = {
        query: "project = PROJ",
        totalResults: 5,
        maxResults: 25,
        searchParams: {
          jql: "project = PROJ AND status = Open",
          maxResults: 25,
        },
      };

      const result = formatter.format([mockIssue], jqlMetadata);
      expect(result).toContain(
        "**JQL Query**: `project = PROJ AND status = Open`",
      );
    });

    it("should format helper parameters metadata", () => {
      const helperMetadata: SearchResultMetadata = {
        query: "Helper parameters",
        totalResults: 3,
        maxResults: 25,
        searchParams: {
          assignedToMe: true,
          project: "PROJ",
          status: "Open",
          text: "bug",
          maxResults: 25,
        },
      };

      const result = formatter.format([mockIssue], helperMetadata);
      expect(result).toContain("**Query**: Helper parameters");
      expect(result).toContain(
        '**Filters**: Assigned to me | Project: PROJ | Status: Open | Text: "bug"',
      );
    });

    it("should show max results warning", () => {
      const maxMetadata: SearchResultMetadata = {
        query: "Test",
        totalResults: 25,
        maxResults: 25,
        searchParams: {
          text: "test",
          maxResults: 25,
        },
      };

      const issues = Array(25).fill(mockIssue);
      const result = formatter.format(issues, maxMetadata);
      expect(result).toContain(
        "*Showing first 25 results. Use `maxResults` parameter to see more.*",
      );
    });

    it("should not show max results warning when under limit", () => {
      const underMetadata: SearchResultMetadata = {
        query: "Test",
        totalResults: 10,
        maxResults: 25,
        searchParams: {
          text: "test",
          maxResults: 25,
        },
      };

      const issues = Array(10).fill(mockIssue);
      const result = formatter.format(issues, underMetadata);
      expect(result).not.toContain("*Showing first");
    });
  });

  describe("date formatting", () => {
    it("should format creation and update dates", () => {
      const result = formatter.format([mockIssue], mockMetadata);
      expect(result).toContain("Created:");
      expect(result).toContain("Updated:");
      expect(result).toContain("1/15/2024"); // Created date
      expect(result).toContain("1/16/2024"); // Updated date
    });

    it("should handle missing dates gracefully", () => {
      const noDateIssue: Issue = {
        ...mockIssue,
        fields: {
          ...mockIssue.fields,
          created: undefined,
          updated: undefined,
        },
      };

      const result = formatter.format([noDateIssue], mockMetadata);
      expect(result).not.toContain("Created:");
      expect(result).not.toContain("Updated:");
    });
  });

  describe("footer", () => {
    it("should include navigation tip", () => {
      const result = formatter.format([mockIssue], mockMetadata);
      expect(result).toContain(
        "💡 **Tip**: Use `get_jira_issue <ISSUE-KEY>` for detailed information",
      );
    });
  });
});
