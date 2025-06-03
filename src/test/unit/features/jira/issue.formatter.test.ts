/**
 * Issue Formatter Unit Tests
 * Co-located unit tests for JIRA single issue formatter
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { IssueFormatter } from "@features/jira/formatters/issue.formatter";
import type { ADFDocument, ADFNode } from "@features/jira/parsers/adf.parser";
import type { Issue } from "@features/jira/repositories/issue.models";
import { testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("IssueFormatter", () => {
  let formatter: IssueFormatter;

  beforeEach(() => {
    formatter = new IssueFormatter();
  });

  describe("format method", () => {
    test("should format complete issue correctly", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue summary",
        status: { name: "To Do" },
        priority: { name: "High" },
        assignee: { displayName: "John Doe", accountId: "user-123" },
        description: "This is a test description",
        labels: ["bug", "urgent"],
        created: "2024-01-15T10:30:00.000Z",
        updated: "2024-01-16T14:45:00.000Z",
      };
      issue.self = "https://company.atlassian.net/rest/api/3/issue/test-123";

      const result = formatter.format(issue);

      expect(result).toContain("# TEST-123: Test issue summary");
      expect(result).toContain("**Status:** To Do");
      expect(result).toContain("**Priority:** High");
      expect(result).toContain("**Assignee:** John Doe");
      expect(result).toContain("## Description");
      expect(result).toContain("This is a test description");
      expect(result).toContain("## Labels");
      expect(result).toContain("bug, urgent");
      expect(result).toContain("## Dates");
      expect(result).toContain("**Created**:");
      expect(result).toContain("**Updated**:");
      expect(result).toContain(
        "[View in JIRA](https://company.atlassian.net/browse/TEST-123)",
      );
    });

    test("should handle missing summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: undefined,
        status: { name: "To Do" },
      };

      const result = formatter.format(issue);

      expect(result).toContain("# TEST-123: No Summary");
    });

    test("should handle missing status", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: undefined,
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Status:** Unknown");
    });

    test("should handle missing priority", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        priority: undefined,
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Priority:** None");
    });

    test("should handle missing assignee", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        assignee: undefined,
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Assignee:** Unassigned");
    });

    test("should handle ADF description", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      const adfDescription: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a " },
              { type: "text", text: "formatted", marks: [{ type: "strong" }] },
              { type: "text", text: " description." },
            ],
          },
        ],
      };
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        description: adfDescription,
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Description");
      expect(result).toContain("This is a **formatted** description.");
    });

    test("should handle string description", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        description: "Simple string description",
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Description");
      expect(result).toContain("Simple string description");
    });

    test("should handle missing description", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        description: undefined,
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("## Description");
    });

    test("should handle empty labels array", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        labels: [],
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("## Labels");
    });

    test("should handle missing labels", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        labels: undefined,
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("## Labels");
    });

    test("should handle single label", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        labels: ["bug"],
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Labels");
      expect(result).toContain("bug");
    });

    test("should handle multiple labels", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        labels: ["bug", "urgent", "frontend"],
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Labels");
      expect(result).toContain("bug, urgent, frontend");
    });

    test("should handle only created date", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        created: "2024-01-15T10:30:00.000Z",
        updated: undefined,
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Dates");
      expect(result).toContain("**Created**:");
      expect(result).not.toContain("**Updated**:");
    });

    test("should handle only updated date", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        created: undefined,
        updated: "2024-01-16T14:45:00.000Z",
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Dates");
      expect(result).toContain("**Updated**:");
      expect(result).not.toContain("**Created**:");
    });

    test("should handle missing dates", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        created: undefined,
        updated: undefined,
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("## Dates");
    });

    test("should format dates correctly", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        created: "2024-01-15T10:30:00.000Z",
        updated: "2024-01-16T14:45:00.000Z",
      };

      const result = formatter.format(issue);

      // Should contain formatted dates (exact format depends on locale)
      expect(result).toMatch(/\*\*Created\*\*: \d{1,2}\/\d{1,2}\/\d{4}/);
      expect(result).toMatch(/\*\*Updated\*\*: \d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test("should handle missing self URL", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
      };
      issue.self = null;

      const result = formatter.format(issue);

      expect(result).not.toContain("[View in JIRA]");
    });

    test("should generate correct JIRA link", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
      };
      issue.self = "https://mycompany.atlassian.net/rest/api/3/issue/12345";

      const result = formatter.format(issue);

      expect(result).toContain(
        "[View in JIRA](https://mycompany.atlassian.net/browse/TEST-123)",
      );
    });

    test("should handle null fields object", () => {
      const issue: Issue = {
        id: "test-123",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/test-123",
        fields: null,
      };

      const result = formatter.format(issue);

      expect(result).toContain("# TEST-123: No Summary");
      expect(result).toContain("**Status:** Unknown");
      expect(result).toContain("**Priority:** None");
      expect(result).toContain("**Assignee:** Unassigned");
    });

    test("should handle undefined fields object", () => {
      const issue: Issue = {
        id: "test-123",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/test-123",
        fields: undefined,
      };

      const result = formatter.format(issue);

      expect(result).toContain("# TEST-123: No Summary");
      expect(result).toContain("**Status:** Unknown");
      expect(result).toContain("**Priority:** None");
      expect(result).toContain("**Assignee:** Unassigned");
    });
  });

  describe("ADF parsing integration", () => {
    test("should handle complex ADF structure", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      const complexAdf: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Complex " },
              { type: "text", text: "formatted", marks: [{ type: "em" }] },
              { type: "text", text: " content." },
            ],
          },
        ],
      };
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        description: complexAdf,
      };

      const result = formatter.format(issue);

      expect(result).toContain("Complex *formatted* content.");
    });

    test("should handle malformed ADF gracefully", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      // Create a malformed ADF that's missing required content in paragraph
      const malformedAdf: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            // Missing content property - this will be handled gracefully
          } as Partial<ADFNode> & { type: string },
        ],
      };
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        description: malformedAdf,
      };

      const result = formatter.format(issue);

      // Should handle gracefully without crashing
      expect(result).toContain("# TEST-123");
    });

    test("should handle empty ADF content", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      const emptyAdf: ADFDocument = {
        type: "doc",
        version: 1,
        content: [],
      };
      issue.fields = {
        summary: "Test issue",
        description: emptyAdf,
        status: { name: "To Do" },
        priority: { name: "Medium" },
        assignee: null,
        created: null,
        updated: null,
        labels: null,
      };

      const result = formatter.format(issue);

      expect(result).not.toContain("## Description");
    });
  });

  describe("edge cases", () => {
    test("should handle empty string summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "",
      };

      const result = formatter.format(issue);

      expect(result).toContain("# TEST-123: No Summary");
    });

    test("should handle whitespace-only summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "   ",
      };

      const result = formatter.format(issue);

      expect(result).toContain("# TEST-123:    ");
    });

    test("should handle very long summary", () => {
      const longSummary = "A".repeat(500);
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: longSummary,
      };

      const result = formatter.format(issue);

      expect(result).toContain(`# TEST-123: ${longSummary}`);
    });

    test("should handle special characters in summary", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Issue with # hash and * asterisk and [brackets]",
      };

      const result = formatter.format(issue);

      expect(result).toContain(
        "# TEST-123: Issue with # hash and * asterisk and [brackets]",
      );
    });

    test("should handle null status name", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        status: { name: null },
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Status:** Unknown");
    });

    test("should handle null priority name", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        priority: { name: null },
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Priority:** None");
    });

    test("should handle null assignee display name", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        assignee: { displayName: null, accountId: "user-456" },
      };

      const result = formatter.format(issue);

      expect(result).toContain("**Assignee:** Unassigned");
    });

    test("should handle invalid date strings", () => {
      const issue = testDataBuilder.issueWithStatus("To Do", "blue");
      issue.key = "TEST-123";
      issue.fields = {
        ...issue.fields,
        summary: "Test issue",
        created: "invalid-date",
        updated: "also-invalid",
      };

      const result = formatter.format(issue);

      expect(result).toContain("## Dates");
      // Should handle invalid dates gracefully
      expect(result).toBeDefined();
    });
  });
});
