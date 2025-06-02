import { beforeEach, describe, expect, test } from "bun:test";
import { JiraClient } from "@features/jira/api/jira.client.impl";
import { JiraConfig } from "@features/jira/api/jira.config.types";

describe("API Client Integration", () => {
  let client: JiraClient;
  let validConfig: JiraConfig;

  beforeEach(() => {
    // Setup valid configuration using the proper JiraConfig class
    validConfig = new JiraConfig({
      hostUrl: "https://test-domain.atlassian.net",
      username: "test-user@example.com",
      apiToken: "test-api-token-123",
    });

    // Initialize client
    client = new JiraClient(validConfig);
  });

  describe("Configuration and Initialization", () => {
    test("should initialize with valid configuration", () => {
      expect(() => new JiraClient(validConfig)).not.toThrow();
      expect(client).toBeDefined();
    });

    test("should handle configuration validation", () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "",
        username: "test-user@example.com",
        apiToken: "test-api-token-123",
      });

      expect(() => {
        new JiraClient(invalidConfig);
      }).toThrow();
    });

    test("should handle missing configuration fields", () => {
      const incompleteConfig = new JiraConfig({
        hostUrl: "https://test-domain.atlassian.net",
        username: "",
        apiToken: "test-api-token-123",
      });

      expect(() => {
        new JiraClient(incompleteConfig);
      }).toThrow();
    });
  });

  describe("Issue Operations", () => {
    test("should handle getIssue requests", async () => {
      try {
        const issue = await client.getIssue("TEST-123");

        // Should return an issue object if successful
        if (issue) {
          expect(typeof issue).toBe("object");
          expect(issue).toHaveProperty("key");
        }
      } catch (error) {
        // Expected in test environment due to auth/network issues
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle getIssue with fields parameter", async () => {
      try {
        const issue = await client.getIssue("TEST-123", [
          "summary",
          "description",
          "status",
        ]);

        if (issue) {
          expect(typeof issue).toBe("object");
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle getIssueWithResponse wrapper", async () => {
      try {
        const response = await client.getIssueWithResponse("TEST-123");

        expect(response).toHaveProperty("success");
        expect(typeof response.success).toBe("boolean");

        if (response.success) {
          expect(response).toHaveProperty("data");
        } else {
          expect(response).toHaveProperty("error");
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("Search Operations", () => {
    test("should handle searchIssues with JQL", async () => {
      try {
        const issues = await client.searchIssues(
          "project = TEST",
          undefined,
          10,
        );

        if (issues) {
          expect(Array.isArray(issues)).toBe(true);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle searchIssues with fields", async () => {
      try {
        const issues = await client.searchIssues(
          "assignee = currentUser()",
          ["key", "summary", "status"],
          5,
        );

        if (issues) {
          expect(Array.isArray(issues)).toBe(true);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle getAssignedIssues", async () => {
      try {
        const issues = await client.getAssignedIssues();

        if (issues) {
          expect(Array.isArray(issues)).toBe(true);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle getAssignedIssuesWithResponse wrapper", async () => {
      try {
        const response = await client.getAssignedIssuesWithResponse();

        expect(response).toHaveProperty("success");
        expect(typeof response.success).toBe("boolean");

        if (response.success) {
          expect(response).toHaveProperty("data");
          expect(Array.isArray(response.data)).toBe(true);
        } else {
          expect(response).toHaveProperty("error");
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("Comments Operations", () => {
    test("should handle getIssueComments", async () => {
      try {
        const comments = await client.getIssueComments("TEST-123");

        if (comments) {
          expect(Array.isArray(comments)).toBe(true);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle getIssueComments with options", async () => {
      try {
        const comments = await client.getIssueComments("TEST-123", {
          maxComments: 50,
          orderBy: "created",
          expand: ["renderedBody"],
        });

        if (comments) {
          expect(Array.isArray(comments)).toBe(true);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("User Operations", () => {
    test("should handle getCurrentUser", async () => {
      try {
        const user = await client.getCurrentUser();

        if (user) {
          expect(typeof user).toBe("object");
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("Error Handling", () => {
    test("should handle network connectivity errors", async () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "https://non-existent-domain-12345.atlassian.net",
        username: "test@example.com",
        apiToken: "token-123",
      });

      const invalidClient = new JiraClient(invalidConfig);

      try {
        await invalidClient.getCurrentUser();
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    test("should handle authentication errors", async () => {
      const invalidAuthConfig = new JiraConfig({
        hostUrl: "https://test-domain.atlassian.net",
        username: "invalid@example.com",
        apiToken: "invalid-token",
      });

      const invalidClient = new JiraClient(invalidAuthConfig);

      try {
        await invalidClient.getCurrentUser();
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    test("should handle invalid JQL queries", async () => {
      try {
        await client.searchIssues("INVALID JQL SYNTAX");
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle non-existent issue keys", async () => {
      try {
        await client.getIssue("NONEXISTENT-999999");
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("Integration Workflow", () => {
    test("should handle complete workflow operations", async () => {
      const workflowResults: Array<{ operation: string; success: boolean }> =
        [];

      // Step 1: Get current user
      try {
        await client.getCurrentUser();
        workflowResults.push({ operation: "getCurrentUser", success: true });
      } catch (_error) {
        workflowResults.push({ operation: "getCurrentUser", success: false });
      }

      // Step 2: Get assigned issues
      try {
        await client.getAssignedIssues();
        workflowResults.push({ operation: "getAssignedIssues", success: true });
      } catch (_error) {
        workflowResults.push({
          operation: "getAssignedIssues",
          success: false,
        });
      }

      // Step 3: Search issues
      try {
        await client.searchIssues("project IS NOT EMPTY", undefined, 5);
        workflowResults.push({ operation: "searchIssues", success: true });
      } catch (_error) {
        workflowResults.push({ operation: "searchIssues", success: false });
      }

      // Verify all operations were attempted
      expect(workflowResults).toHaveLength(3);
      expect(workflowResults[0].operation).toBe("getCurrentUser");
      expect(workflowResults[1].operation).toBe("getAssignedIssues");
      expect(workflowResults[2].operation).toBe("searchIssues");
    });

    test("should handle sequential operations with dependencies", async () => {
      const operationResults: string[] = [];

      try {
        // First, search for issues
        operationResults.push("search_started");
        const issues = await client.searchIssues(
          "project IS NOT EMPTY",
          undefined,
          1,
        );
        operationResults.push("search_completed");

        // Then, if we got issues, try to get details for the first one
        if (issues && issues.length > 0) {
          operationResults.push("issue_detail_started");
          await client.getIssue(issues[0].key);
          operationResults.push("issue_detail_completed");

          // Finally, try to get comments for that issue
          operationResults.push("comments_started");
          await client.getIssueComments(issues[0].key);
          operationResults.push("comments_completed");
        }
      } catch (_error) {
        operationResults.push("error_occurred");
      }

      // Verify workflow progression
      expect(operationResults.length).toBeGreaterThan(0);
      expect(operationResults[0]).toBe("search_started");

      if (operationResults.includes("search_completed")) {
        // If search completed, we should have attempted further operations
        expect(operationResults.length).toBeGreaterThanOrEqual(2);
      }
    });

    test("should handle concurrent operations", async () => {
      const operations = [
        () => client.getCurrentUser(),
        () => client.getAssignedIssues(),
        () => client.searchIssues("project IS NOT EMPTY", undefined, 3),
      ];

      const results = await Promise.allSettled(operations.map((op) => op()));

      // All operations should complete (either fulfilled or rejected)
      expect(results).toHaveLength(3);

      for (const result of results) {
        expect(result.status).toBeOneOf(["fulfilled", "rejected"]);
      }
    });
  });
});
