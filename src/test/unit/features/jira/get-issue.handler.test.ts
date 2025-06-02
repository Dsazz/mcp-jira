/**
 * Get Issue Handler Unit Tests
 * Co-located unit tests for JIRA get issue MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import { GetIssueHandler } from "@features/jira/tools/handlers/get-issue.handler";
import { jiraApiMocks, testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetIssueHandler", () => {
  let handler: GetIssueHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client
    mockClient = {
      getIssue: async (issueKey: string) => {
        // This will be mocked by jiraApiMocks in individual tests
        const response = await fetch(`/rest/api/3/issue/${issueKey}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
      },
    };

    handler = new GetIssueHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("successful issue retrieval", () => {
    test("should format issue with basic information", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      // Override the key to match what we expect
      mockIssue.key = "TEST-123";
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue/TEST-123", mockIssue);

      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-123");
      expect(result.data).toContain(mockIssue.fields?.summary);
      expect(result.data).toContain("To Do");
    });

    test("should handle issue with complex ADF description", async () => {
      // Create a complex ADF issue with the expected key
      const complexIssue = {
        id: "test-complex",
        key: "TEST-456",
        self: "https://company.atlassian.net/rest/api/3/issue/test-complex",
        fields: {
          summary: "Complex formatting issue",
          description: {
            version: 1,
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "This issue demonstrates complex ADF formatting.",
                  },
                ],
              },
              {
                type: "codeBlock",
                attrs: { language: "typescript" },
                content: [
                  {
                    type: "text",
                    text: "interface ComplexType {\n  id: string;\n  data: {\n    nested: {\n      values: Array<string | number>;\n    };\n  };\n}",
                  },
                ],
              },
            ],
          },
          status: {
            name: "To Do",
            statusCategory: { name: "To Do", colorName: "blue" },
          },
          priority: { name: "Medium" },
          assignee: {
            displayName: "Jane Assignee",
            emailAddress: "jane@company.com",
          },
          created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          labels: ["testing", "mock-data"],
        },
      };

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/issue/TEST-456",
        complexIssue,
      );

      const result = (await handler.handle({
        issueKey: "TEST-456",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-456");
      expect(result.data).toContain("Complex formatting issue");
      // Should parse ADF content to markdown
      expect(result.data).toContain("```typescript");
      expect(result.data).toContain("interface ComplexType");
    });

    test("should handle issue with different priorities", async () => {
      const highPriorityIssue = testDataBuilder.issueWithPriority("High");
      highPriorityIssue.key = "TEST-789";
      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/issue/TEST-789",
        highPriorityIssue,
      );

      const result = (await handler.handle({
        issueKey: "TEST-789",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("High");
      expect(result.data).toContain("TEST-789");
    });

    test("should handle issue with different statuses", async () => {
      const doneIssue = testDataBuilder.issueWithStatus("Done", "green");
      doneIssue.key = "TEST-101";
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue/TEST-101", doneIssue);

      const result = (await handler.handle({
        issueKey: "TEST-101",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Done");
      expect(result.data).toContain("TEST-101");
    });

    test("should include assignee and reporter information", async () => {
      jiraApiMocks.mockGetIssue("TEST-202", "single-bug");

      const result = (await handler.handle({
        issueKey: "TEST-202",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Assignee:**");
      expect(result.data).toContain("Jane Assignee");
    });

    test("should include creation and update timestamps", async () => {
      jiraApiMocks.mockGetIssue("TEST-303");

      const result = (await handler.handle({
        issueKey: "TEST-303",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Created**");
      expect(result.data).toContain("**Updated**");
    });

    test("should handle labels if present", async () => {
      jiraApiMocks.mockGetIssue("TEST-404");

      const result = (await handler.handle({
        issueKey: "TEST-404",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("## Labels");
      expect(result.data).toContain("testing");
      expect(result.data).toContain("mock-data");
    });
  });

  describe("error handling", () => {
    test("should handle issue not found error", async () => {
      jiraApiMocks.mockIssueNotFound("NONEXIST-1");

      const result = await handler.handle({ issueKey: "NONEXIST-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 404");
    });

    test("should handle authentication error", async () => {
      jiraApiMocks.mockAuthError();

      const result = await handler.handle({ issueKey: "TEST-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 401");
    });

    test("should handle permission error", async () => {
      jiraApiMocks.mockPermissionError("RESTRICT-1");

      const result = await handler.handle({ issueKey: "RESTRICT-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 403");
    });

    test("should handle network error", async () => {
      jiraApiMocks.mockNetworkError("/rest/api/3/issue/NETWORK-1");

      const result = await handler.handle({ issueKey: "NETWORK-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle malformed response gracefully", async () => {
      // Mock a response that has some malformed fields but includes required key
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue/MALFORM-1", {
        id: "malformed",
        key: "MALFORM-1",
        // Missing or null fields that should be handled gracefully
        fields: null,
      });

      const result = (await handler.handle({
        issueKey: "MALFORM-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      // Should handle malformed data gracefully with fallback values
      expect(result.data).toContain("MALFORM-1");
      expect(result.data).toContain("No Summary");
      expect(result.data).toContain("Unknown");
      expect(result.data).toContain("Unassigned");
    });
  });

  describe("input validation", () => {
    test("should handle empty issue key", async () => {
      const result = await handler.handle({ issueKey: "" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue parameters");
    });

    test("should handle null issue key", async () => {
      const result = await handler.handle({ issueKey: null });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue parameters");
    });

    test("should handle undefined issue key", async () => {
      const result = await handler.handle({ issueKey: undefined });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue parameters");
    });

    test("should handle whitespace-only issue key", async () => {
      const result = await handler.handle({ issueKey: "   " });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue parameters");
    });

    test("should accept valid issue key formats", async () => {
      const validKeys = ["TEST-1", "PROJECT-123", "MYPROJ-999"];

      for (const key of validKeys) {
        jiraApiMocks.mockGetIssue(key);
        const result = await handler.handle({ issueKey: key });
        expect(result.success).toBe(true);
        jiraApiMocks.clearMocks();
      }
    });
  });

  describe("formatting and display", () => {
    test("should format markdown properly", async () => {
      jiraApiMocks.mockGetIssue("FORMAT-1");

      const result = (await handler.handle({
        issueKey: "FORMAT-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      // Check for proper markdown structure
      expect(result.data).toMatch(/^# /); // Should start with header
      expect(result.data).toContain("**Status:**");
      expect(result.data).toContain("**Priority:**");
      expect(result.data).toContain("## Description");
    });

    test("should handle missing optional fields gracefully", async () => {
      // Create issue with minimal fields
      const minimalIssue = {
        id: "test-minimal",
        key: "MIN-1",
        self: "https://test.atlassian.net/rest/api/3/issue/test-minimal",
        fields: {
          summary: "Minimal issue",
          // No description, assignee, etc.
        },
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue/MIN-1", minimalIssue);

      const result = (await handler.handle({
        issueKey: "MIN-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MIN-1");
      expect(result.data).toContain("Minimal issue");
      // Should handle missing fields gracefully - check for default values
      expect(result.data).toContain("Unassigned");
    });

    test("should handle string description (legacy format)", async () => {
      const issueWithStringDesc = {
        id: "test-string",
        key: "STR-1",
        self: "https://test.atlassian.net/rest/api/3/issue/test-string",
        fields: {
          summary: "Issue with string description",
          description: "This is a plain string description",
        },
      };

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/issue/STR-1",
        issueWithStringDesc,
      );

      const result = (await handler.handle({
        issueKey: "STR-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("This is a plain string description");
    });
  });
});
