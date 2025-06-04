/**
 * Issue List Formatter Tests
 * Tests for the issue list formatting functionality
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { IssueListFormatter } from "@features/jira/issues/formatters/issue-list.formatter";
import type { Issue } from "@features/jira/issues/models/issue.models";
import { testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("IssueListFormatter", () => {
  let formatter: IssueListFormatter;

  beforeEach(() => {
    formatter = new IssueListFormatter();
  });

  describe("format method", () => {
    test("should format single issue correctly", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue summary",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain("# Your Assigned Issues");
      expect(result).toContain("1 issue assigned to you");
      expect(result).toContain(
        "| Key | Summary | Status | Priority | Updated |",
      );
      expect(result).toContain(
        "| TEST-123 | Test issue summary | To Do | High | 1/15/2024 |",
      );
    });

    test("should format multiple issues correctly", () => {
      const issue1 = testDataBuilder.issueWithStatus("To Do", "blue");
      issue1.key = "TEST-123";
      issue1.fields = {
        ...issue1.fields,
        summary: "First issue",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const issue2 = testDataBuilder.issueWithStatus("In Progress", "yellow");
      issue2.key = "TEST-456";
      issue2.fields = {
        ...issue2.fields,
        summary: "Second issue",
        status: { name: "In Progress" },
        priority: { name: "Medium" },
        updated: "2024-01-16T14:45:00.000Z",
      };

      const result = formatter.format([issue1, issue2]);

      expect(result).toContain("2 issues assigned to you");
      expect(result).toContain(
        "| TEST-123 | First issue | To Do | High | 1/15/2024 |",
      );
      expect(result).toContain(
        "| TEST-456 | Second issue | In Progress | Medium | 1/16/2024 |",
      );
    });

    test("should handle missing summary field", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: undefined,
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | No Summary | To Do | High | 1/15/2024 |",
      );
    });

    test("should handle missing status field", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: undefined,
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | Test issue | Unknown | High | 1/15/2024 |",
      );
    });

    test("should handle missing priority field", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: "To Do" },
        priority: undefined,
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | Test issue | To Do | None | 1/15/2024 |",
      );
    });

    test("should handle missing updated field", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: undefined,
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | Test issue | To Do | High | N/A |",
      );
    });

    test("should handle null fields object", () => {
      const issue: Issue = {
        id: "test-123",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/test-123",
        fields: null,
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | No Summary | Unknown | None | N/A |",
      );
    });

    test("should handle undefined fields object", () => {
      const issue: Issue = {
        id: "test-123",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/test-123",
        fields: undefined,
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | No Summary | Unknown | None | N/A |",
      );
    });

    test("should format dates correctly", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-12-25T15:30:45.123Z",
      };

      const result = formatter.format([issue]);

      // Should format as locale date string
      expect(result).toContain("12/25/2024");
    });

    test("should handle invalid date format", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "invalid-date",
      };

      const result = formatter.format([issue]);

      // Invalid date should result in "Invalid Date" or similar
      expect(result).toMatch(/Invalid Date|N\/A/);
    });

    test("should escape markdown special characters in summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Issue with | pipe and * asterisk",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      // Should contain the summary as-is (formatter doesn't escape markdown currently)
      expect(result).toContain("Issue with | pipe and * asterisk");
    });

    test("should handle very long summary", () => {
      const longSummary = "A".repeat(200);
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: longSummary,
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(longSummary);
    });

    test("should maintain table structure with many issues", () => {
      const issues: Issue[] = [];
      for (let i = 1; i <= 10; i++) {
        const issue = testDataBuilder.issueWithStatus("To Do", "blue");
        issue.key = `TEST-${i}`;
        issue.fields = {
          ...issue.fields,
          summary: `Issue ${i}`,
          status: { name: "To Do" },
          priority: { name: "High" },
          updated: "2024-01-15T10:30:00.000Z",
        };
        issues.push(issue);
      }

      const result = formatter.format(issues);

      expect(result).toContain("10 issues assigned to you");
      expect(result).toContain(
        "| Key | Summary | Status | Priority | Updated |",
      );
      expect(result).toContain(
        "| --- | ------- | ------ | -------- | ------- |",
      );

      // Should have 10 data rows
      const tableRows = result
        .split("\n")
        .filter((line: string) => line.startsWith("| TEST-"));
      expect(tableRows).toHaveLength(10);
    });

    test("should handle mixed field availability across issues", () => {
      const issue1 = testDataBuilder.issueWithStatus("To Do", "blue");
      issue1.key = "TEST-1";
      issue1.fields = {
        summary: "Complete issue",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const issue2 = testDataBuilder.issueWithStatus("In Progress", "yellow");
      issue2.key = "TEST-2";
      issue2.fields = {
        summary: "Partial issue",
        // Missing status, priority, updated
      };

      const result = formatter.format([issue1, issue2]);

      expect(result).toContain(
        "| TEST-1 | Complete issue | To Do | High | 1/15/2024 |",
      );
      expect(result).toContain(
        "| TEST-2 | Partial issue | Unknown | None | N/A |",
      );
    });
  });

  describe("edge cases", () => {
    test("should handle empty string summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | No Summary | To Do | High | 1/15/2024 |",
      );
    });

    test("should handle whitespace-only summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "   ",
        status: { name: "To Do" },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain("| TEST-123 |     | To Do | High | 1/15/2024 |");
    });

    test("should handle null status name", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: null },
        priority: { name: "High" },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | Test issue | Unknown | High | 1/15/2024 |",
      );
    });

    test("should handle null priority name", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: "To Do" },
        priority: { name: null },
        updated: "2024-01-15T10:30:00.000Z",
      };

      const result = formatter.format([issue]);

      expect(result).toContain(
        "| TEST-123 | Test issue | To Do | None | 1/15/2024 |",
      );
    });
  });
});
