/**
 * Create Issue Handler Unit Tests
 * Comprehensive unit tests for JIRA create issue MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import { IssueTypeValidationError } from "@features/jira/api/jira.errors";
import type {
  CreateIssueParams,
  CreateIssueRequest,
} from "@features/jira/api/jira.schemas";
import { CreateIssueHandler } from "@features/jira/tools/handlers/create-issue.handler";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { jiraApiMocks, mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("CreateIssueHandler", () => {
  let handler: CreateIssueHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a simplified mock JIRA client
    mockClient = {
      createIssueWithParams: async (request: CreateIssueRequest) => {
        // This will be mocked by jiraApiMocks in individual tests
        const response = await fetch("/rest/api/3/issue", {
          method: "POST",
          body: JSON.stringify(request),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
      },
      validateProject: async (projectKey: string) => {
        // Simple validation - return true for successful tests
        return projectKey !== "NONEXIST" && projectKey !== "RESTRICTED";
      },
      validateIssueType: async (projectKey: string, issueType: string) => {
        // Simple validation - return true for valid combinations
        if (projectKey === "TEST" && issueType === "InvalidType") {
          throw new IssueTypeValidationError(issueType, projectKey);
        }
        return true;
      },
    };

    handler = new CreateIssueHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("successful issue creation", () => {
    test("should create issue with minimal required parameters", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        id: "issue-123",
        fields: {
          summary: "Test issue",
          issuetype: { name: "Task" },
          status: { name: "To Do" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("✅ Issue Created Successfully");
      expect(result.data).toContain("TEST-123");
      expect(result.data).toContain("Test issue");
    });

    test("should create issue with all optional parameters", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "PROJ-456",
        id: "issue-456",
        fields: {
          summary: "Complex issue with all fields",
          description: "Detailed description",
          issuetype: { name: "Bug" },
          priority: { name: "High" },
          labels: ["urgent", "frontend"],
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "PROJ",
        summary: "Complex issue with all fields",
        issueType: "Bug",
        description: "Detailed description",
        priority: "High",
        labels: ["urgent", "frontend"],
        assignee: "john.doe",
        components: ["Frontend", "API"],
        fixVersions: ["v1.2.0"],
        customFields: {
          customfield_10001: "Epic Link",
          customfield_10002: 5, // Story points
        },
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("PROJ-456");
      expect(result.data).toContain("Complex issue with all fields");
    });

    test("should apply bug template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "BUG-789",
        id: "bug-789",
        fields: {
          summary: "Critical bug in login",
          issuetype: { name: "Bug" },
          priority: { name: "High" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "BUG",
        summary: "Critical bug in login",
        issueType: "Bug",
        template: "bug",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("BUG-789");
      expect(result.data).toContain("Critical bug in login");
    });

    test("should apply story template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "STORY-101",
        id: "story-101",
        fields: {
          summary: "User can view dashboard",
          issuetype: { name: "Story" },
          priority: { name: "Medium" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "STORY",
        summary: "User can view dashboard",
        issueType: "Story",
        template: "story",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("STORY-101");
      expect(result.data).toContain("User can view dashboard");
    });

    test("should apply task template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TASK-202",
        id: "task-202",
        fields: {
          summary: "Update documentation",
          issuetype: { name: "Task" },
          priority: { name: "Low" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "TASK",
        summary: "Update documentation",
        issueType: "Task",
        template: "task",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TASK-202");
      expect(result.data).toContain("Update documentation");
    });

    test("should apply epic template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "EPIC-303",
        id: "epic-303",
        fields: {
          summary: "New user onboarding flow",
          issuetype: { name: "Epic" },
          priority: { name: "High" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "EPIC",
        summary: "New user onboarding flow",
        issueType: "Epic",
        template: "epic",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("EPIC-303");
      expect(result.data).toContain("New user onboarding flow");
    });

    test("should apply feature template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "FEAT-404",
        id: "feat-404",
        fields: {
          summary: "Advanced search functionality",
          issuetype: { name: "New Feature" },
          priority: { name: "Medium" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "FEAT",
        summary: "Advanced search functionality",
        issueType: "New Feature",
        template: "feature",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("FEAT-404");
      expect(result.data).toContain("Advanced search functionality");
    });

    test("should handle invalid template gracefully", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-505",
        id: "test-505",
        fields: {
          summary: "Issue without template",
          issuetype: { name: "Task" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Issue without template",
        issueType: "Task",
        // No template provided
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-505");
      expect(result.data).toContain("Issue without template");
    });
  });

  describe("parameter validation", () => {
    test("should reject missing projectKey", async () => {
      const result = await handler.handle({
        summary: "Test issue",
        issueType: "Task",
      } as CreateIssueParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
      expect(result.error).toContain("projectKey");
    });

    test("should reject missing summary", async () => {
      const result = await handler.handle({
        projectKey: "TEST",
        issueType: "Task",
      } as CreateIssueParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
      expect(result.error).toContain("summary");
    });

    test("should reject missing issueType", async () => {
      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
      } as CreateIssueParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
      expect(result.error).toContain("issueType");
    });

    test("should reject empty projectKey", async () => {
      const result = await handler.handle({
        projectKey: "",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });

    test("should reject empty summary", async () => {
      const result = await handler.handle({
        projectKey: "TEST",
        summary: "",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });

    test("should reject empty issueType", async () => {
      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });

    test("should reject invalid priority", async () => {
      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
        priority: "InvalidPriority",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });

    test("should accept valid priorities", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        fields: { priority: { name: "High" } },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const validPriorities = ["Highest", "High", "Medium", "Low", "Lowest"];

      for (const priority of validPriorities) {
        const result = (await handler.handle({
          projectKey: "TEST",
          summary: "Test issue",
          issueType: "Task",
          priority,
        })) as McpResponse<string>;

        expect(result.success).toBe(true);
      }
    });
  });

  describe("project validation", () => {
    test("should handle project not found error", async () => {
      const result = await handler.handle({
        projectKey: "NONEXIST",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("❌ **Project Validation Failed**");
      expect(result.error).toContain("NONEXIST");
      expect(result.error).toContain("not found or you don't have permission");
    });

    test("should handle project permission error", async () => {
      const result = await handler.handle({
        projectKey: "RESTRICTED",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("❌ **Project Validation Failed**");
      expect(result.error).toContain("RESTRICTED");
    });
  });

  describe("issue type validation", () => {
    test("should handle invalid issue type error", async () => {
      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "InvalidType",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("❌ **Issue Type Validation Failed**");
      expect(result.error).toContain("InvalidType");
      expect(result.error).toContain("TEST");
    });
  });

  describe("issue creation errors", () => {
    test("should handle JIRA API creation error", async () => {
      // Mock issue creation failure
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue",
        400,
        "Field 'summary' is required",
      );

      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("❌ **Unexpected Error**");
    });

    test("should handle authentication error during creation", async () => {
      // Mock authentication error during creation
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue",
        401,
        "Authentication failed",
      );

      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("❌ **Unexpected Error**");
      expect(result.error).toContain("Authentication failed");
    });

    test("should handle network error", async () => {
      // Mock network error during creation
      jiraApiMocks.mockNetworkError("/rest/api/3/issue");

      const result = await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("❌ **Unexpected Error**");
    });
  });

  describe("client initialization", () => {
    test("should handle missing client", async () => {
      const handlerWithoutClient = new CreateIssueHandler();

      const result = await handlerWithoutClient.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA client not initialized");
    });
  });

  describe("response formatting", () => {
    test("should include direct JIRA links in response", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        id: "issue-123",
        self: "https://company.atlassian.net/rest/api/3/issue/issue-123",
        fields: {
          summary: "Test issue with links",
          issuetype: { name: "Task" },
          status: { name: "To Do" },
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Test issue with links",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("🔗 **Quick Links:**");
      expect(result.data).toContain("[View Issue]");
      expect(result.data).toContain("[Edit Issue]");
      expect(result.data).toContain("[Add Comment]");
      expect(result.data).toContain(
        "https://company.atlassian.net/browse/TEST-123",
      );
    });

    test("should include next actions in response", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-456",
        fields: { summary: "Test issue with actions" },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Test issue with actions",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("🚀 **Next Actions:**");
      expect(result.data).toContain("jira_get_issue TEST-456");
      expect(result.data).toContain("jira_update_issue TEST-456");
      expect(result.data).toContain("jira_get_issue_comments TEST-456");
      expect(result.data).toContain("search_jira_issues project=TEST");
    });

    test("should include issue details in response", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "DETAIL-789",
        fields: {
          summary: "Detailed issue",
          issuetype: { name: "Bug" },
          status: { name: "In Progress" },
          priority: { name: "High" },
          assignee: { displayName: "John Doe", accountId: "john-doe-123" },
          reporter: { displayName: "Jane Smith", accountId: "jane-smith-456" },
          labels: ["urgent", "frontend"],
        },
      });

      // Mock issue creation
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/issue", mockCreatedIssue);

      const result = (await handler.handle({
        projectKey: "DETAIL",
        summary: "Detailed issue",
        issueType: "Bug",
        labels: ["urgent", "frontend"],
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("📋 **Issue Details:**");
      expect(result.data).toContain("**Project**: DETAIL");
      expect(result.data).toContain("**Type**: Bug");
      expect(result.data).toContain("**Status**: In Progress");
      expect(result.data).toContain("**Priority**: High");
      expect(result.data).toContain("**Assignee**: John Doe");
      expect(result.data).toContain("**Reporter**: Jane Smith");
      expect(result.data).toContain("**Labels:** urgent, frontend");
    });
  });
});
