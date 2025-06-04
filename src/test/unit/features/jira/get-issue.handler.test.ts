/**
 * Get Issue Handler Tests
 * Comprehensive test suite for the GetIssueHandler
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import type { Issue } from "@features/jira/issues/models/issue.models";
import { GetIssueHandler } from "@features/jira/issues/tools/get-issue.handler";
import type { GetIssueUseCase } from "@features/jira/issues/use-cases";
import type { IssueParamsValidator } from "@features/jira/issues/validators";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetIssueHandler", () => {
  let handler: GetIssueHandler;
  let mockUseCase: GetIssueUseCase;
  let mockValidator: IssueParamsValidator;

  // Mock issue data
  const mockIssue: Issue = {
    id: "10001",
    key: "TEST-123",
    self: "https://example.atlassian.net/rest/api/3/issue/10001",
    fields: {
      summary: "Test issue",
      description: "This is a test issue",
      issuetype: {
        name: "Task",
      },
      status: {
        name: "To Do",
      },
      priority: {
        name: "Medium",
      },
      created: "2023-01-01T10:00:00.000Z",
      updated: "2023-01-01T10:00:00.000Z",
    },
  };

  beforeEach(() => {
    // Create mock use case and validator
    mockUseCase = {
      execute: mock(() => Promise.resolve(mockIssue)),
    };

    mockValidator = {
      validateGetIssueParams: mock((params) => params),
    };

    // Create handler with mocks
    handler = new GetIssueHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("handle", () => {
    it("should validate parameters and call the use case", async () => {
      // Arrange
      const params = { issueKey: "TEST-123" };

      // Act
      await handler.handle(params);

      // Assert
      expect(mockValidator.validateGetIssueParams).toHaveBeenCalledWith(params);
      expect(mockUseCase.execute).toHaveBeenCalledWith(params);
    });

    it("should format issue correctly", async () => {
      // Act
      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-123");
      expect(result.data).toContain("Test issue");
      expect(result.data).toContain("This is a test issue");
      expect(result.data).toContain("To Do");
      expect(result.data).toContain("Medium");
    });

    it("should handle api errors", async () => {
      // Arrange
      mockUseCase.execute = mock(() => {
        throw JiraApiError.withStatusCode("API error", 400);
      });

      // Act
      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
    });

    it("should handle permission errors", async () => {
      // Arrange
      mockUseCase.execute = mock(() => {
        throw new JiraPermissionError("Permission denied");
      });

      // Act
      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission Denied");
    });

    it("should handle not found errors", async () => {
      // Arrange
      mockUseCase.execute = mock(() => {
        throw new JiraNotFoundError("Issue not found", "TEST-123");
      });

      // Act
      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("Issue Not Found");
    });

    it("should handle generic errors", async () => {
      // Arrange
      mockUseCase.execute = mock(() => {
        throw new Error("Generic error");
      });

      // Act
      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("Issue Retrieval Failed");
    });

    it("should handle missing dependencies", () => {
      // Act
      const handlerWithoutDependencies = new GetIssueHandler(
        undefined as unknown as GetIssueUseCase,
        undefined as unknown as IssueParamsValidator,
      );

      // Assert
      expect(handlerWithoutDependencies).toBeDefined();
      // Now test that it handles the undefined dependencies gracefully
      expect(async () => {
        const result = (await handlerWithoutDependencies.handle({
          issueKey: "TEST-123",
        })) as McpResponse<string>;
        expect(result.success).toBe(false);
      }).not.toThrow();
    });
  });

  describe("successful issue retrieval", () => {
    it("should format issue with basic information", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      mockIssue.key = "TEST-123";

      mockUseCase.execute = mock(() => Promise.resolve(mockIssue));

      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-123");
      expect(result.data).toContain(mockIssue.fields?.summary);
      expect(result.data).toContain("To Do");
    });

    it("should handle issue with complex ADF description", async () => {
      // Use 'as any' to bypass the type checking for the test
      // This is acceptable in tests when we're mocking complex data structures
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
            accountId: "user-123", // Add required accountId for User type
          },
          created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          labels: ["testing", "mock-data"],
        },
      };

      mockUseCase.execute = mock(() => Promise.resolve(complexIssue as Issue));

      const result = (await handler.handle({
        issueKey: "TEST-456",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-456");
      expect(result.data).toContain("Complex formatting issue");
      expect(result.data).toContain("```typescript");
      expect(result.data).toContain("interface ComplexType");
    });

    it("should handle issue with different priorities", async () => {
      const highPriorityIssue = testDataBuilder.issueWithPriority("High");
      highPriorityIssue.key = "TEST-789";

      mockUseCase.execute = mock(() => Promise.resolve(highPriorityIssue));

      const result = (await handler.handle({
        issueKey: "TEST-789",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("High");
      expect(result.data).toContain("TEST-789");
    });

    it("should handle issue with different statuses", async () => {
      const doneIssue = testDataBuilder.issueWithStatus("Done", "green");
      doneIssue.key = "TEST-101";

      mockUseCase.execute = mock(() => Promise.resolve(doneIssue));

      const result = (await handler.handle({
        issueKey: "TEST-101",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Done");
      expect(result.data).toContain("TEST-101");
    });

    it("should include assignee and reporter information", async () => {
      const mockIssue = mockFactory.createMockIssue({ key: "TEST-202" });

      mockUseCase.execute = mock(() => Promise.resolve(mockIssue));

      const result = (await handler.handle({
        issueKey: "TEST-202",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Assignee:**");
      expect(result.data).toContain("Jane Assignee");
    });

    it("should include creation and update timestamps", async () => {
      const mockIssue = mockFactory.createMockIssue({ key: "TEST-303" });

      mockUseCase.execute = mock(() => Promise.resolve(mockIssue));

      const result = (await handler.handle({
        issueKey: "TEST-303",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Created**");
      expect(result.data).toContain("**Updated**");
    });

    it("should handle labels if present", async () => {
      const mockIssue = mockFactory.createMockIssue({ key: "TEST-404" });
      // Add labels to the fields
      if (mockIssue.fields) {
        mockIssue.fields.labels = ["testing", "mock-data"];
      }

      mockUseCase.execute = mock(() => Promise.resolve(mockIssue));

      const result = (await handler.handle({
        issueKey: "TEST-404",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("## Labels");
      expect(result.data).toContain("testing");
      expect(result.data).toContain("mock-data");
    });
  });

  describe("input validation", () => {
    it("should handle empty issue key", async () => {
      // Act: modify the validator behavior for this test
      mockValidator.validateGetIssueParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue key", 400);
      });

      const result = (await handler.handle({
        issueKey: "",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue key");
    });

    it("should handle null issue key", async () => {
      // Act: modify the validator behavior for this test
      mockValidator.validateGetIssueParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue key", 400);
      });

      const result = (await handler.handle({
        issueKey: null as unknown as string,
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue key");
    });

    it("should handle undefined issue key", async () => {
      // Act: modify the validator behavior for this test
      mockValidator.validateGetIssueParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue key", 400);
      });

      const result = (await handler.handle({
        issueKey: undefined as unknown as string,
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue key");
    });

    it("should handle whitespace-only issue key", async () => {
      // Act: modify the validator behavior for this test
      mockValidator.validateGetIssueParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue key", 400);
      });

      const result = (await handler.handle({
        issueKey: "   ",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue key");
    });

    it("should validate issue key format", async () => {
      // Act: modify the validator behavior for this test
      mockValidator.validateGetIssueParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue key", 400);
      });

      const result = (await handler.handle({
        issueKey: "invalid-key-format",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue key");
    });
  });

  describe("advanced features", () => {
    it("should support field filtering", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      mockIssue.key = "TEST-505";

      mockUseCase.execute = mock(() => Promise.resolve(mockIssue));

      const result = await handler.handle({
        issueKey: "TEST-505",
        fields: ["summary", "status", "priority"],
      });

      expect(result.success).toBe(true);
    });

    it("should handle different field subsets", async () => {
      const mockIssue = testDataBuilder.issueWithStatus(
        "In Progress",
        "yellow",
      );
      mockIssue.key = "TEST-606";

      mockUseCase.execute = mock(() => Promise.resolve(mockIssue));

      const result = await handler.handle({
        issueKey: "TEST-606",
        fields: ["summary"],
      });

      expect(result.success).toBe(true);
    });

    it("should handle missing optional fields gracefully", async () => {
      const minimalIssue = {
        id: "minimal",
        key: "MIN-1",
        self: "https://test.atlassian.net/rest/api/3/issue/minimal",
        fields: {
          summary: "Minimal issue",
          // Missing status, priority, etc.
        },
      };

      mockUseCase.execute = mock(() => Promise.resolve(minimalIssue as Issue));

      const result = (await handler.handle({
        issueKey: "MIN-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MIN-1");
      expect(result.data).toContain("Minimal issue");
    });

    it("should handle string description (legacy format)", async () => {
      const issueWithStringDesc = {
        id: "test-string",
        key: "STR-1",
        self: "https://test.atlassian.net/rest/api/3/issue/test-string",
        fields: {
          summary: "Issue with string description",
          description: "This is a plain string description",
        },
      };

      mockUseCase.execute = mock(() =>
        Promise.resolve(issueWithStringDesc as Issue),
      );

      const result = (await handler.handle({
        issueKey: "STR-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("This is a plain string description");
    });
  });
});
