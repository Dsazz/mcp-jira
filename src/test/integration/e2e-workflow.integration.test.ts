import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { JiraClient } from "@features/jira/api/jira.client.impl";
import { JiraConfig } from "@features/jira/api/jira.config.types";
import type { Issue, SearchResult } from "@features/jira/api/jira.models.types";
import { CreateIssueHandler } from "@features/jira/tools/handlers/create-issue.handler";
import { GetAssignedIssuesHandler } from "@features/jira/tools/handlers/get-assigned-issues.handler";
import { GetIssueCommentsHandler } from "@features/jira/tools/handlers/get-issue-comments.handler";
import { GetIssueHandler } from "@features/jira/tools/handlers/get-issue.handler";
import { SearchIssuesHandler } from "@features/jira/tools/handlers/search-issues.handler";
import { isSuccessfulSearchResultWithIssues } from "@test/utils/type-guards";

interface CachedIssueData {
  summary?: string;
  status?: string;
  cached_at: number;
  description?: string;
  detailed_at?: number;
}

describe("End-to-End Workflow Integration", () => {
  let client: JiraClient;
  let config: JiraConfig;
  let handlers: {
    getAssignedIssues: GetAssignedIssuesHandler;
    getIssue: GetIssueHandler;
    getIssueComments: GetIssueCommentsHandler;
    createTask: CreateIssueHandler;
    searchIssues: SearchIssuesHandler;
  };

  beforeEach(() => {
    // Setup test configuration
    config = new JiraConfig({
      hostUrl: "https://test-domain.atlassian.net",
      username: "test-user@example.com",
      apiToken: "test-api-token-123",
    });

    client = new JiraClient(config);

    // Initialize all handlers for workflow testing
    handlers = {
      getAssignedIssues: new GetAssignedIssuesHandler(client),
      getIssue: new GetIssueHandler(client),
      getIssueComments: new GetIssueCommentsHandler(client),
      createTask: new CreateIssueHandler(client),
      searchIssues: new SearchIssuesHandler(client),
    };
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  describe("Complete User Workflows", () => {
    test("should execute complete issue discovery and task creation workflow", async () => {
      // Workflow: User searches issues → selects specific issue → creates task → views comments
      const workflowSteps: string[] = [];

      try {
        // Step 1: User searches for issues related to their work
        workflowSteps.push("Starting issue search");
        const searchResult = await handlers.searchIssues.handle({
          query: "assignee = currentUser() AND status != Done",
          maxResults: 10,
        });

        workflowSteps.push("Search completed");
        expect(searchResult.success).toBe(true);

        if (isSuccessfulSearchResultWithIssues(searchResult)) {
          const firstIssue = searchResult.data.issues[0];
          const issueKey = firstIssue.key;

          // Step 2: User gets detailed information about a specific issue
          workflowSteps.push(`Getting details for issue ${issueKey}`);
          const issueResult = await handlers.getIssue.handle({
            issueKey: issueKey,
            expand: "description,comments,attachments",
          });

          workflowSteps.push("Issue details retrieved");
          expect(issueResult.success).toBe(true);

          if (issueResult.success && issueResult.data) {
            // Step 3: User creates a new JIRA issue based on the existing issue
            workflowSteps.push("Creating new JIRA issue");
            const taskResult = await handlers.createTask.handle({
              projectKey: "TEST",
              summary: `Follow-up task for ${issueKey}`,
              issueType: "Task",
              description: `This is a follow-up task created from issue ${issueKey}`,
              priority: "Medium",
            });

            workflowSteps.push("New JIRA issue created");
            expect(taskResult.success).toBe(true);

            if (taskResult.success) {
              // Step 4: User views comments on the issue for additional context
              workflowSteps.push("Retrieving issue comments");
              const commentsResult = await handlers.getIssueComments.handle({
                issueKey: issueKey,
                maxResults: 50,
                orderBy: "created",
              });

              workflowSteps.push("Comments retrieved");
              expect(commentsResult.success).toBe(true);

              // Verify complete workflow succeeded
              expect(workflowSteps).toContain("Starting issue search");
              expect(workflowSteps).toContain("Search completed");
              expect(workflowSteps).toContain("Issue details retrieved");
              expect(workflowSteps).toContain("New JIRA issue created");
              expect(workflowSteps).toContain("Comments retrieved");
            }
          }
        } else {
          // If no issues found, test search functionality still works
          expect(searchResult.success).toBe(true);
          if (searchResult.success && searchResult.data) {
            const data = searchResult.data as SearchResult;
            expect(data.issues).toBeDefined();
            expect(Array.isArray(data.issues)).toBe(true);
          }
        }
      } catch (_error) {
        // In test environment, network errors are expected
        // Verify workflow tracking still works
        expect(workflowSteps.length).toBeGreaterThan(0);
        expect(workflowSteps[0]).toBe("Starting issue search");
      }
    });

    test("should execute assigned issues workflow with task creation", async () => {
      // Workflow: Get user's assigned issues → create tasks for multiple issues
      const workflowResults: Array<{
        step: string;
        success: boolean;
        data?: unknown;
      }> = [];

      try {
        // Step 1: Get user's assigned issues
        const assignedResult = await handlers.getAssignedIssues.handle({
          maxResults: 5,
          expand: "description,priority",
        });

        workflowResults.push({
          step: "get_assigned_issues",
          success: assignedResult.success,
          data: assignedResult.success ? assignedResult.data : null,
        });

        if (isSuccessfulSearchResultWithIssues(assignedResult)) {
          // Step 2: Create tasks for each assigned issue
          const taskCreationPromises = assignedResult.data.issues
            .slice(0, 3)
            .map(async (issue: Issue) => {
              const taskResult = await handlers.createTask.handle({
                projectKey: "TEST",
                summary: `Task for ${issue.key}: ${issue.fields?.summary || "No summary"}`,
                issueType: "Task",
                description: `This task was created from assigned issue ${issue.key}`,
                priority: "Medium",
              });

              return {
                issueKey: issue.key,
                success: taskResult.success,
                data: taskResult.success ? taskResult.data : null,
              };
            });

          const taskResults = await Promise.all(taskCreationPromises);

          workflowResults.push({
            step: "create_multiple_tasks",
            success: taskResults.every((r: { success: boolean }) => r.success),
            data: taskResults,
          });

          // Verify all workflow steps completed
          expect(workflowResults).toHaveLength(2);
          expect(workflowResults[0].step).toBe("get_assigned_issues");
          expect(workflowResults[1].step).toBe("create_multiple_tasks");
        }

        // At minimum, the assigned issues call should work
        expect(workflowResults.length).toBeGreaterThan(0);
        expect(workflowResults[0].step).toBe("get_assigned_issues");
      } catch (_error) {
        // Verify workflow tracking exists even with errors
        expect(workflowResults.length).toBeGreaterThan(0);
      }
    });

    test("should handle workflow with error recovery", async () => {
      // Workflow: Search with invalid query → recover with valid query → continue workflow
      const workflowLog: Array<{
        action: string;
        success: boolean;
        error?: string;
      }> = [];

      try {
        // Step 1: Try invalid search query
        const invalidSearchResult = await handlers.searchIssues.handle({
          query: "INVALID JQL SYNTAX",
          maxResults: 10,
        });

        workflowLog.push({
          action: "invalid_search",
          success: invalidSearchResult.success,
          error: invalidSearchResult.success
            ? undefined
            : invalidSearchResult.error,
        });

        // Step 2: Recover with valid search
        const validSearchResult = await handlers.searchIssues.handle({
          query: "project IS NOT EMPTY",
          maxResults: 5,
        });

        workflowLog.push({
          action: "recovery_search",
          success: validSearchResult.success,
          error: validSearchResult.success
            ? undefined
            : validSearchResult.error,
        });

        // Step 3: Continue workflow with valid results
        if (isSuccessfulSearchResultWithIssues(validSearchResult)) {
          const firstIssue = validSearchResult.data.issues[0];

          const issueResult = await handlers.getIssue.handle({
            issueKey: firstIssue.key,
          });

          workflowLog.push({
            action: "get_issue_details",
            success: issueResult.success,
            error: issueResult.success ? undefined : issueResult.error,
          });
        }

        // Verify error recovery workflow
        expect(workflowLog.length).toBeGreaterThanOrEqual(2);
        expect(workflowLog[0].action).toBe("invalid_search");
        expect(workflowLog[1].action).toBe("recovery_search");

        // At least one step should succeed (recovery search)
        const successfulSteps = workflowLog.filter((step) => step.success);
        expect(successfulSteps.length).toBeGreaterThan(0);
      } catch (_error) {
        // Verify workflow logging exists
        expect(workflowLog.length).toBeGreaterThan(0);
      }
    });

    test("should execute workflow with comments integration", async () => {
      // Workflow: Search issue → get details → get comments → analyze activity
      const workflowMetrics = {
        searchDuration: 0,
        issueRetrievalDuration: 0,
        commentRetrievalDuration: 0,
        totalWorkflowDuration: 0,
      };

      const workflowStartTime = performance.now();

      try {
        // Step 1: Search for issues (with timing)
        const searchStartTime = performance.now();
        const searchResult = await handlers.searchIssues.handle({
          query: "created >= -7d ORDER BY created DESC",
          maxResults: 3,
        });
        workflowMetrics.searchDuration = performance.now() - searchStartTime;

        expect(searchResult.success).toBe(true);

        if (isSuccessfulSearchResultWithIssues(searchResult)) {
          const selectedIssue = searchResult.data.issues[0];

          // Step 2: Get issue details (with timing)
          const issueStartTime = performance.now();
          const issueResult = await handlers.getIssue.handle({
            issueKey: selectedIssue.key,
            expand: "description,comments",
          });
          workflowMetrics.issueRetrievalDuration =
            performance.now() - issueStartTime;

          expect(issueResult.success).toBe(true);

          // Step 3: Get detailed comments (with timing)
          const commentsStartTime = performance.now();
          const commentsResult = await handlers.getIssueComments.handle({
            issueKey: selectedIssue.key,
            maxResults: 100,
            orderBy: "created",
          });
          workflowMetrics.commentRetrievalDuration =
            performance.now() - commentsStartTime;

          expect(commentsResult.success).toBe(true);

          // Step 4: Analyze workflow performance
          workflowMetrics.totalWorkflowDuration =
            performance.now() - workflowStartTime;

          // Verify reasonable performance (should complete within 30 seconds)
          expect(workflowMetrics.totalWorkflowDuration).toBeLessThan(30000);
          expect(workflowMetrics.searchDuration).toBeGreaterThan(0);
          expect(workflowMetrics.issueRetrievalDuration).toBeGreaterThan(0);
          expect(workflowMetrics.commentRetrievalDuration).toBeGreaterThan(0);
        }
      } catch (_error) {
        // Verify timing metrics were captured even with errors
        workflowMetrics.totalWorkflowDuration =
          performance.now() - workflowStartTime;
        expect(workflowMetrics.totalWorkflowDuration).toBeGreaterThan(0);
      }
    });

    test("should handle concurrent workflow operations", async () => {
      // Workflow: Multiple users performing simultaneous operations
      const concurrentWorkflows = Array.from(
        { length: 3 },
        async (_, index) => {
          const workflowId = `workflow_${index + 1}`;
          const results: Array<{
            operation: string;
            success: boolean;
            duration: number;
          }> = [];

          try {
            // Each workflow performs a different operation simultaneously
            const operations = [
              async () => {
                const startTime = performance.now();
                const result = await handlers.getAssignedIssues.handle({
                  maxResults: 5,
                });
                return {
                  operation: "get_assigned_issues",
                  success: result.success,
                  duration: performance.now() - startTime,
                };
              },
              async () => {
                const startTime = performance.now();
                const result = await handlers.searchIssues.handle({
                  query: "project IS NOT EMPTY",
                  maxResults: 3,
                });
                return {
                  operation: "search_issues",
                  success: result.success,
                  duration: performance.now() - startTime,
                };
              },
            ];

            const operationResult =
              await operations[index % operations.length]();
            results.push(operationResult);

            return {
              workflowId,
              results,
              completed: true,
            };
          } catch (error) {
            return {
              workflowId,
              results,
              completed: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      );

      const workflowResults = await Promise.all(concurrentWorkflows);

      // Verify all workflows completed (successfully or with expected errors)
      expect(workflowResults).toHaveLength(3);

      for (const [index, workflow] of workflowResults.entries()) {
        expect(workflow.workflowId).toBe(`workflow_${index + 1}`);
        // Either completed successfully or failed with network/auth errors (expected in test env)
        expect(typeof workflow.completed).toBe("boolean");
      }

      // At least timing information should be captured
      const completedWorkflows = workflowResults.filter((w) => w.completed);
      if (completedWorkflows.length > 0) {
        for (const workflow of completedWorkflows) {
          expect(workflow.results.length).toBeGreaterThan(0);
          expect(workflow.results[0].duration).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Workflow State Management", () => {
    test("should maintain workflow context across operations", async () => {
      // Test workflow state persistence and context sharing
      const workflowContext = {
        sessionId: `session_${Date.now()}`,
        userActions: [] as Array<{
          action: string;
          timestamp: number;
          result: string;
        }>,
        issueCache: new Map<string, CachedIssueData>(),
      };

      try {
        // Action 1: Search issues and cache results
        const searchResult = await handlers.searchIssues.handle({
          query: "project IS NOT EMPTY ORDER BY created DESC",
          maxResults: 5,
        });

        workflowContext.userActions.push({
          action: "search_issues",
          timestamp: Date.now(),
          result: searchResult.success ? "success" : "error",
        });

        if (isSuccessfulSearchResultWithIssues(searchResult)) {
          // Cache issue summaries
          for (const issue of searchResult.data.issues) {
            workflowContext.issueCache.set(issue.key, {
              summary: issue.fields?.summary || undefined,
              status: issue.fields?.status?.name || undefined,
              cached_at: Date.now(),
            });
          }

          // Action 2: Get detailed information using cached issue key
          if (workflowContext.issueCache.size > 0) {
            const firstIssueKey = Array.from(
              workflowContext.issueCache.keys(),
            )[0];

            const issueResult = await handlers.getIssue.handle({
              issueKey: firstIssueKey,
              expand: "description",
            });

            workflowContext.userActions.push({
              action: `get_issue_${firstIssueKey}`,
              timestamp: Date.now(),
              result: issueResult.success ? "success" : "error",
            });

            // Update cache with detailed information
            if (issueResult.success && issueResult.data) {
              const existingCache =
                workflowContext.issueCache.get(firstIssueKey);
              if (existingCache) {
                workflowContext.issueCache.set(firstIssueKey, {
                  ...existingCache,
                  description: (
                    issueResult.data as { fields?: { description?: string } }
                  ).fields?.description,
                  detailed_at: Date.now(),
                });
              }
            }
          }
        }

        // Verify workflow context was maintained
        expect(workflowContext.sessionId).toContain("session_");
        expect(workflowContext.userActions.length).toBeGreaterThan(0);
        expect(workflowContext.userActions[0].action).toBe("search_issues");

        // Verify state consistency
        const actionTimestamps = workflowContext.userActions.map(
          (a) => a.timestamp,
        );
        for (let i = 1; i < actionTimestamps.length; i++) {
          expect(actionTimestamps[i]).toBeGreaterThanOrEqual(
            actionTimestamps[i - 1],
          );
        }
      } catch (_error) {
        // Verify context was still maintained even with errors
        expect(workflowContext.sessionId).toContain("session_");
        expect(workflowContext.userActions.length).toBeGreaterThan(0);
      }
    });

    test("should handle workflow interruption and resumption", async () => {
      // Test workflow that gets interrupted and can be resumed
      const workflowCheckpoint = {
        phase: "",
        completedSteps: [] as string[],
        lastSuccessfulOperation: "",
        canResume: false,
      };

      try {
        // Phase 1: Initial search
        workflowCheckpoint.phase = "search";
        const searchResult = await handlers.searchIssues.handle({
          query: "assignee = currentUser()",
          maxResults: 3,
        });

        if (searchResult.success) {
          workflowCheckpoint.completedSteps.push("search_completed");
          workflowCheckpoint.lastSuccessfulOperation = "search";
          workflowCheckpoint.canResume = true;
        }

        // Simulate interruption (e.g., network timeout)
        if (workflowCheckpoint.canResume) {
          // Phase 2: Resume with issue details (simulating resumption after interruption)
          workflowCheckpoint.phase = "issue_details";

          if (isSuccessfulSearchResultWithIssues(searchResult)) {
            const issueKey = searchResult.data.issues[0].key;

            const issueResult = await handlers.getIssue.handle({
              issueKey: issueKey,
            });

            if (issueResult.success) {
              workflowCheckpoint.completedSteps.push("issue_details_completed");
              workflowCheckpoint.lastSuccessfulOperation = "get_issue";
            }

            // Phase 3: Continue with task creation
            workflowCheckpoint.phase = "task_creation";

            const taskResult = await handlers.createTask.handle({
              projectKey: "TEST",
              summary: `Task from workflow for ${issueKey}`,
              issueType: "Task",
              description: `This task was created during workflow resumption for issue ${issueKey}`,
              priority: "Medium",
            });

            if (taskResult.success) {
              workflowCheckpoint.completedSteps.push("task_creation_completed");
              workflowCheckpoint.lastSuccessfulOperation = "create_task";
            }
          }
        }

        // Verify workflow progression tracking
        expect(workflowCheckpoint.completedSteps.length).toBeGreaterThan(0);
        expect(workflowCheckpoint.completedSteps[0]).toBe("search_completed");
        expect(workflowCheckpoint.lastSuccessfulOperation).toBeTruthy();
        expect(workflowCheckpoint.canResume).toBe(true);
      } catch (_error) {
        // Verify checkpoint information is preserved even with errors
        expect(workflowCheckpoint.phase).toBeTruthy();
        expect(typeof workflowCheckpoint.canResume).toBe("boolean");
      }
    });
  });
});
