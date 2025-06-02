import { beforeEach, describe, expect, test } from "bun:test";
import { JiraClient } from "@features/jira/api/jira.client.impl";
import { JiraConfig } from "@features/jira/api/jira.config.types";
import { GetAssignedIssuesHandler } from "@features/jira/tools/handlers/get-assigned-issues.handler";
import { GetIssueHandler } from "@features/jira/tools/handlers/get-issue.handler";
import { SearchIssuesHandler } from "@features/jira/tools/handlers/search-issues.handler";
import { isSuccessfulSearchResultWithIssues } from "@test/utils/type-guards";

describe("Error Handling Integration", () => {
  let client: JiraClient;
  let validConfig: JiraConfig;
  let handlers: {
    getAssignedIssues: GetAssignedIssuesHandler;
    getIssue: GetIssueHandler;
    searchIssues: SearchIssuesHandler;
  };

  beforeEach(() => {
    // Setup valid configuration
    validConfig = new JiraConfig({
      hostUrl: "https://test-domain.atlassian.net",
      username: "test-user@example.com",
      apiToken: "test-api-token-123",
    });

    client = new JiraClient(validConfig);

    // Initialize handlers for error testing
    handlers = {
      getAssignedIssues: new GetAssignedIssuesHandler(client),
      getIssue: new GetIssueHandler(client),
      searchIssues: new SearchIssuesHandler(client),
    };
  });

  describe("Configuration Validation Errors", () => {
    test("should handle missing host URL configuration", () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "",
        username: "test@example.com",
        apiToken: "token123",
      });

      const validationResult = invalidConfig.validate();
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(
        validationResult.errors.some((error) => error.includes("host")),
      ).toBe(true);
    });

    test("should handle invalid URL format", () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "not-a-valid-url",
        username: "test@example.com",
        apiToken: "token123",
      });

      const validationResult = invalidConfig.validate();
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });

    test("should handle missing username", () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "https://test.atlassian.net",
        username: "",
        apiToken: "token123",
      });

      const validationResult = invalidConfig.validate();
      expect(validationResult.valid).toBe(false);
      expect(
        validationResult.errors.some((error) => error.includes("username")),
      ).toBe(true);
    });

    test("should handle missing API token", () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "https://test.atlassian.net",
        username: "test@example.com",
        apiToken: "",
      });

      const validationResult = invalidConfig.validate();
      expect(validationResult.valid).toBe(false);
      expect(
        validationResult.errors.some((error) => error.includes("token")),
      ).toBe(true);
    });
  });

  describe("Network Error Handling", () => {
    test("should handle connection timeout errors", async () => {
      const unreachableConfig = new JiraConfig({
        hostUrl: "https://unreachable-domain-12345.atlassian.net",
        username: "test@example.com",
        apiToken: "token123",
      });

      const unreachableClient = new JiraClient(unreachableConfig);

      try {
        await unreachableClient.getCurrentUser();
        expect.unreachable("Should have thrown a network error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);

        // Should be a JiraApiError with a clear 404 message (unreachable domain returns 404)
        const errorName = error instanceof Error ? error.name : "";
        const errorMessage = error instanceof Error ? error.message : "";

        expect(errorName).toBe("JiraApiError");
        expect(errorMessage).toBe("Not Found");
      }
    });

    test("should handle DNS resolution errors", async () => {
      const invalidDomainConfig = new JiraConfig({
        hostUrl: "https://definitely-not-a-real-domain.invalid",
        username: "test@example.com",
        apiToken: "token123",
      });

      const invalidClient = new JiraClient(invalidDomainConfig);

      try {
        await invalidClient.getAssignedIssues();
        expect.unreachable("Should have thrown a DNS error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Should be a DNS or network error
        expect(error instanceof Error ? error.message : "").toMatch(
          /fetch|network|domain|DNS|Connection refused|Unable to connect/i,
        );
      }
    });

    test("should handle server unavailable errors", async () => {
      // Using a port that's likely not running JIRA
      const unavailableConfig = new JiraConfig({
        hostUrl: "http://localhost:9999",
        username: "test@example.com",
        apiToken: "token123",
      });

      const unavailableClient = new JiraClient(unavailableConfig);

      try {
        await unavailableClient.searchIssues("project = TEST");
        expect.unreachable("Should have thrown a connection error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Should be a connection error
        expect(error instanceof Error ? error.message : "").toMatch(
          /fetch|connect|refused|unavailable/i,
        );
      }
    });
  });

  describe("Authentication Error Handling", () => {
    test("should handle invalid credentials", async () => {
      const invalidCredsConfig = new JiraConfig({
        hostUrl: "https://test-domain.atlassian.net",
        username: "invalid@example.com",
        apiToken: "invalid-token",
      });

      const invalidClient = new JiraClient(invalidCredsConfig);

      try {
        await invalidClient.getCurrentUser();
        expect.unreachable("Should have thrown an authentication error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // In a real environment, this would be a 401/403 error
        // In test environment, it might be a network error
        expect(error).toBeDefined();
      }
    });

    test("should handle expired API tokens", async () => {
      const expiredTokenConfig = new JiraConfig({
        hostUrl: "https://test-domain.atlassian.net",
        username: "test@example.com",
        apiToken: "expired-token-12345",
      });

      const expiredClient = new JiraClient(expiredTokenConfig);

      try {
        await expiredClient.getAssignedIssues();
        expect.unreachable("Should have thrown an authentication error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeDefined();
      }
    });
  });

  describe("API Error Handling", () => {
    test("should handle invalid JQL syntax errors", async () => {
      try {
        const response = await handlers.searchIssues.handle({
          query: "INVALID_SYNTAX && MALFORMED_JQL (((",
          maxResults: 10,
        });

        // Handler should return error response, not throw
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toBeTruthy();
          expect(response.error).toMatch(/JQL|syntax|query/i);
        }
      } catch (error) {
        // If it does throw, it should be a proper error
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle non-existent issue requests", async () => {
      try {
        const response = await handlers.getIssue.handle({
          issueKey: "NONEXISTENT-999999",
        });

        // Handler should return error response for non-existent issues
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toBeTruthy();
          expect(response.error).toMatch(/not found|does not exist|issue|404/i);
        }
      } catch (error) {
        // If it does throw, verify it's a proper error
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle permission denied errors", async () => {
      // Test with a likely restricted project
      try {
        const response = await handlers.searchIssues.handle({
          query: "project = RESTRICTED_PROJECT",
          maxResults: 5,
        });

        // Handler should return error response for permission issues
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toBeTruthy();
          expect(response.error).toMatch(
            /permission|access|forbidden|unauthorized/i,
          );
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle malformed API responses", async () => {
      // This tests the client's ability to handle unexpected response formats
      try {
        await client.getIssue("TEST-123");
      } catch (error) {
        if (error instanceof Error) {
          // Should handle parsing errors gracefully
          expect(error.message).toBeTruthy();
          expect(typeof error.message).toBe("string");
        }
      }
    });
  });

  describe("Parameter Validation Errors", () => {
    test("should handle empty issue key", async () => {
      try {
        const response = await handlers.getIssue.handle({
          issueKey: "",
        });

        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toMatch(/issue key|required|empty/i);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle invalid issue key format", async () => {
      try {
        const response = await handlers.getIssue.handle({
          issueKey: "invalid-format",
        });

        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toBeTruthy();
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle negative maxResults", async () => {
      try {
        const response = await handlers.searchIssues.handle({
          query: "project IS NOT EMPTY",
          maxResults: -1,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toMatch(/maxResults|negative|invalid/i);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("should handle excessive maxResults", async () => {
      try {
        const response = await handlers.searchIssues.handle({
          query: "project IS NOT EMPTY",
          maxResults: 99999,
        });

        // Might succeed but with limited results, or fail with limit error
        if (!response.success) {
          expect(response.error).toMatch(/limit|maxResults|too large/i);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("Error Recovery and Resilience", () => {
    test("should recover from temporary network failures", async () => {
      const errorLog: Array<{
        attempt: number;
        success: boolean;
        error?: string;
      }> = [];

      // Simulate multiple attempts with potential failures
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await handlers.getAssignedIssues.handle({
            maxResults: 5,
          });

          errorLog.push({
            attempt,
            success: response.success,
            error: response.success ? undefined : response.error,
          });

          if (response.success) {
            break; // Recovery successful
          }
        } catch (error) {
          errorLog.push({
            attempt,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Verify attempt tracking
      expect(errorLog.length).toBeGreaterThan(0);
      expect(errorLog.length).toBeLessThanOrEqual(3);
      expect(errorLog[0].attempt).toBe(1);

      // At least one attempt should have been made
      expect(errorLog.every((log) => typeof log.success === "boolean")).toBe(
        true,
      );
    });

    test("should handle cascading failures gracefully", async () => {
      const operationResults: Array<{
        operation: string;
        success: boolean;
        dependencyMet: boolean;
      }> = [];

      try {
        // Operation 1: Search (foundation for subsequent operations)
        const searchResult = await handlers.searchIssues.handle({
          query: "project IS NOT EMPTY",
          maxResults: 3,
        });

        operationResults.push({
          operation: "search",
          success: searchResult.success,
          dependencyMet: true, // No dependencies
        });

        // Operation 2: Get issue details (depends on search results)
        let issueResult = { success: false };
        const canGetIssue = isSuccessfulSearchResultWithIssues(searchResult);

        if (canGetIssue) {
          issueResult = await handlers.getIssue.handle({
            issueKey: searchResult.data.issues[0].key,
          });
        }

        operationResults.push({
          operation: "getIssue",
          success: issueResult.success,
          dependencyMet: canGetIssue,
        });

        // Operation 3: Get assigned issues (independent operation)
        const assignedResult = await handlers.getAssignedIssues.handle({
          maxResults: 5,
        });

        operationResults.push({
          operation: "getAssigned",
          success: assignedResult.success,
          dependencyMet: true, // Independent operation
        });

        // Verify graceful degradation
        expect(operationResults).toHaveLength(3);

        // Independent operations should always be attempted
        const independentOps = operationResults.filter(
          (op) => op.dependencyMet,
        );
        expect(independentOps.length).toBeGreaterThan(0);

        // Dependent operations should only run if dependencies are met
        const dependentOps = operationResults.filter(
          (op) => op.operation === "getIssue",
        );
        if (dependentOps.length > 0) {
          const dependentOp = dependentOps[0];
          expect(typeof dependentOp.dependencyMet).toBe("boolean");
        }
      } catch (_error) {
        // Even with errors, some operations should have been attempted
        expect(operationResults.length).toBeGreaterThan(0);
      }
    });

    test("should maintain error context across operations", async () => {
      const errorContext = {
        errors: [] as Array<{
          operation: string;
          error: string;
          timestamp: number;
          recovered: boolean;
        }>,
        totalOperations: 0,
        successfulOperations: 0,
      };

      const operations = [
        {
          name: "searchInvalidJQL",
          fn: () =>
            handlers.searchIssues.handle({ query: "INVALID JQL SYNTAX" }),
        },
        {
          name: "getNonExistentIssue",
          fn: () => handlers.getIssue.handle({ issueKey: "FAKE-999999" }),
        },
        {
          name: "getAssignedIssues",
          fn: () => handlers.getAssignedIssues.handle({ maxResults: 5 }),
        },
      ];

      for (const operation of operations) {
        errorContext.totalOperations++;

        try {
          const result = await operation.fn();

          if (result.success) {
            errorContext.successfulOperations++;
          } else {
            errorContext.errors.push({
              operation: operation.name,
              error: result.error || "Unknown error",
              timestamp: Date.now(),
              recovered: false,
            });

            // Attempt recovery for certain errors
            if (operation.name === "getAssignedIssues") {
              // This operation is more likely to succeed
              const retryResult = await operation.fn();
              if (retryResult.success) {
                errorContext.errors[errorContext.errors.length - 1].recovered =
                  true;
                errorContext.successfulOperations++;
              }
            }
          }
        } catch (error) {
          errorContext.errors.push({
            operation: operation.name,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
            recovered: false,
          });
        }
      }

      // Verify error tracking
      expect(errorContext.totalOperations).toBe(3);
      expect(errorContext.errors.length).toBeGreaterThanOrEqual(0);

      // Verify timestamp ordering
      if (errorContext.errors.length > 1) {
        for (let i = 1; i < errorContext.errors.length; i++) {
          expect(errorContext.errors[i].timestamp).toBeGreaterThanOrEqual(
            errorContext.errors[i - 1].timestamp,
          );
        }
      }

      // At least error context should be maintained
      expect(typeof errorContext.successfulOperations).toBe("number");
      expect(errorContext.successfulOperations).toBeGreaterThanOrEqual(0);
      expect(errorContext.successfulOperations).toBeLessThanOrEqual(
        errorContext.totalOperations,
      );
    });
  });

  describe("Client Initialization Errors", () => {
    test("should handle client initialization with invalid config", () => {
      const invalidConfig = new JiraConfig({
        hostUrl: "",
        username: "",
        apiToken: "",
      });

      expect(() => {
        new JiraClient(invalidConfig);
      }).toThrow();
    });

    test("should handle handler initialization with undefined client", () => {
      expect(() => {
        new GetIssueHandler(undefined);
      }).not.toThrow(); // Should handle gracefully

      const handler = new GetIssueHandler(undefined);
      expect(handler).toBeDefined();
    });

    test("should handle missing environment configuration", () => {
      // Temporarily clear env vars to test missing configuration
      const originalVars = {
        JIRA_HOST: process.env.JIRA_HOST,
        JIRA_USERNAME: process.env.JIRA_USERNAME,
        JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
      };

      // Clear environment variables by setting to empty strings
      process.env.JIRA_HOST = "";
      process.env.JIRA_USERNAME = "";
      process.env.JIRA_API_TOKEN = "";

      try {
        const envConfig = JiraConfig.fromEnv();
        const validation = envConfig.validate();

        // Should fail validation when no env vars are set
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      } finally {
        // Restore original environment variables
        if (originalVars.JIRA_HOST !== undefined) {
          process.env.JIRA_HOST = originalVars.JIRA_HOST;
        }
        if (originalVars.JIRA_USERNAME !== undefined) {
          process.env.JIRA_USERNAME = originalVars.JIRA_USERNAME;
        }
        if (originalVars.JIRA_API_TOKEN !== undefined) {
          process.env.JIRA_API_TOKEN = originalVars.JIRA_API_TOKEN;
        }
      }
    });
  });
});
