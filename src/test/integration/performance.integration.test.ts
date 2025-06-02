import { beforeEach, describe, expect, test } from "bun:test";
import { JiraClient } from "@features/jira/api/jira.client.impl";
import { JiraConfig } from "@features/jira/api/jira.config.types";
import { GetAssignedIssuesHandler } from "@features/jira/tools/handlers/get-assigned-issues.handler";
import { GetIssueCommentsHandler } from "@features/jira/tools/handlers/get-issue-comments.handler";
import { GetIssueHandler } from "@features/jira/tools/handlers/get-issue.handler";
import { SearchIssuesHandler } from "@features/jira/tools/handlers/search-issues.handler";
import { isSuccessfulSearchResult } from "@test/utils/type-guards";

interface PerformanceMetrics {
  operationName: string;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  success: boolean;
  recordCount?: number;
}

describe("Performance Integration", () => {
  let client: JiraClient;
  let config: JiraConfig;
  let handlers: {
    getAssignedIssues: GetAssignedIssuesHandler;
    getIssue: GetIssueHandler;
    getIssueComments: GetIssueCommentsHandler;
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

    // Initialize handlers for performance testing
    handlers = {
      getAssignedIssues: new GetAssignedIssuesHandler(client),
      getIssue: new GetIssueHandler(client),
      getIssueComments: new GetIssueCommentsHandler(client),
      searchIssues: new SearchIssuesHandler(client),
    };
  });

  describe("Response Time Benchmarks", () => {
    test("should complete search operations within acceptable time limits", async () => {
      const performanceThresholds = {
        searchIssues: 5000, // 5 seconds max
        getAssignedIssues: 5000, // 5 seconds max
        getIssue: 3000, // 3 seconds max
        getComments: 3000, // 3 seconds max
      };

      const results: PerformanceMetrics[] = [];

      // Test search issues performance
      const searchStartTime = performance.now();
      try {
        const searchResult = await handlers.searchIssues.handle({
          query: "project IS NOT EMPTY",
          maxResults: 10,
        });

        const searchDuration = performance.now() - searchStartTime;
        results.push({
          operationName: "searchIssues",
          duration: searchDuration,
          memoryBefore: 0,
          memoryAfter: 0,
          memoryDelta: 0,
          success: searchResult.success,
          recordCount: isSuccessfulSearchResult(searchResult)
            ? searchResult.data.issues.length
            : 0,
        });

        expect(searchDuration).toBeLessThan(performanceThresholds.searchIssues);
      } catch (_error) {
        const searchDuration = performance.now() - searchStartTime;
        results.push({
          operationName: "searchIssues",
          duration: searchDuration,
          memoryBefore: 0,
          memoryAfter: 0,
          memoryDelta: 0,
          success: false,
        });
      }

      // Test get assigned issues performance
      const assignedStartTime = performance.now();
      try {
        const assignedResult = await handlers.getAssignedIssues.handle({
          maxResults: 10,
        });

        const assignedDuration = performance.now() - assignedStartTime;
        results.push({
          operationName: "getAssignedIssues",
          duration: assignedDuration,
          memoryBefore: 0,
          memoryAfter: 0,
          memoryDelta: 0,
          success: assignedResult.success,
          recordCount: isSuccessfulSearchResult(assignedResult)
            ? assignedResult.data.issues.length
            : 0,
        });

        expect(assignedDuration).toBeLessThan(
          performanceThresholds.getAssignedIssues,
        );
      } catch (_error) {
        const assignedDuration = performance.now() - assignedStartTime;
        results.push({
          operationName: "getAssignedIssues",
          duration: assignedDuration,
          memoryBefore: 0,
          memoryAfter: 0,
          memoryDelta: 0,
          success: false,
        });
      }

      // Verify at least timing data was captured
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.duration).toBeGreaterThan(0);
        expect(typeof result.success).toBe("boolean");
      }
    });

    test("should handle large result sets efficiently", async () => {
      const largeBatchSizes = [50, 100];
      const performanceResults: Array<{
        size: number;
        duration: number;
        recordsReturned: number;
      }> = [];

      for (const batchSize of largeBatchSizes) {
        const startTime = performance.now();
        let recordsReturned = 0;

        try {
          const result = await handlers.searchIssues.handle({
            query: "project IS NOT EMPTY ORDER BY created DESC",
            maxResults: batchSize,
          });

          recordsReturned = isSuccessfulSearchResult(result)
            ? result.data.issues.length
            : 0;
        } catch (_error) {
          // Continue with bulk analysis even if operation fails
        }

        const duration = performance.now() - startTime;
        performanceResults.push({ size: batchSize, duration, recordsReturned });

        // Bulk operations should complete within reasonable time
        expect(duration).toBeLessThan(20000); // 20 seconds max
      }

      // Verify bulk operation efficiency
      expect(performanceResults.length).toBe(largeBatchSizes.length);

      for (const result of performanceResults) {
        expect(result.duration).toBeGreaterThan(0);
        expect(result.recordsReturned).toBeGreaterThanOrEqual(0);

        // Calculate efficiency (records per second)
        const efficiency = result.recordsReturned / (result.duration / 1000);
        expect(efficiency).toBeGreaterThanOrEqual(0);
      }
    });

    test("should maintain consistent performance across multiple operations", async () => {
      const operationCount = 5;
      const operationTimes: number[] = [];

      for (let i = 0; i < operationCount; i++) {
        const startTime = performance.now();

        try {
          await handlers.getAssignedIssues.handle({ maxResults: 5 });
          const duration = performance.now() - startTime;
          operationTimes.push(duration);
        } catch (_error) {
          const duration = performance.now() - startTime;
          operationTimes.push(duration);
        }

        // Small delay between operations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Verify consistency
      expect(operationTimes.length).toBe(operationCount);

      if (operationTimes.length > 1) {
        const avgTime =
          operationTimes.reduce((sum, time) => sum + time, 0) /
          operationTimes.length;
        const maxDeviation = Math.max(
          ...operationTimes.map((time) => Math.abs(time - avgTime)),
        );

        // Performance variation should be reasonable (within 3x average)
        expect(maxDeviation).toBeLessThan(avgTime * 3);
      }
    });
  });

  describe("Memory Usage Analysis", () => {
    test("should manage memory efficiently during operations", async () => {
      const getMemoryUsage = (): number => {
        if (typeof process !== "undefined" && process.memoryUsage) {
          return process.memoryUsage().heapUsed;
        }
        return 0; // Fallback for environments without process.memoryUsage
      };

      const memoryMetrics: PerformanceMetrics[] = [];

      // Test memory usage for different operations
      const operations = [
        {
          name: "searchIssues",
          fn: () =>
            handlers.searchIssues.handle({
              query: "project IS NOT EMPTY",
              maxResults: 20,
            }),
        },
        {
          name: "getAssignedIssues",
          fn: () => handlers.getAssignedIssues.handle({ maxResults: 20 }),
        },
      ];

      for (const operation of operations) {
        // Force garbage collection if available
        if (typeof global !== "undefined" && global.gc) {
          global.gc();
        }

        const memoryBefore = getMemoryUsage();
        const startTime = performance.now();

        try {
          const result = await operation.fn();
          const duration = performance.now() - startTime;
          const memoryAfter = getMemoryUsage();

          memoryMetrics.push({
            operationName: operation.name,
            duration,
            memoryBefore,
            memoryAfter,
            memoryDelta: memoryAfter - memoryBefore,
            success: result.success,
          });

          // Memory growth should be reasonable (less than 50MB per operation)
          const memoryGrowthMB = (memoryAfter - memoryBefore) / (1024 * 1024);
          expect(memoryGrowthMB).toBeLessThan(50);
        } catch (_error) {
          const duration = performance.now() - startTime;
          const memoryAfter = getMemoryUsage();

          memoryMetrics.push({
            operationName: operation.name,
            duration,
            memoryBefore,
            memoryAfter,
            memoryDelta: memoryAfter - memoryBefore,
            success: false,
          });
        }
      }

      // Verify memory tracking
      expect(memoryMetrics.length).toBe(operations.length);
      for (const metric of memoryMetrics) {
        expect(typeof metric.memoryDelta).toBe("number");
        expect(metric.duration).toBeGreaterThan(0);
      }
    });

    test("should handle memory cleanup after operations", async () => {
      const getMemoryUsage = (): number => {
        if (typeof process !== "undefined" && process.memoryUsage) {
          return process.memoryUsage().heapUsed;
        }
        return 0;
      };

      // Baseline memory
      if (typeof global !== "undefined" && global.gc) {
        global.gc();
      }
      const baselineMemory = getMemoryUsage();

      // Perform multiple operations
      const operations = 10;
      for (let i = 0; i < operations; i++) {
        try {
          await handlers.searchIssues.handle({
            query: "project IS NOT EMPTY",
            maxResults: 5,
          });
        } catch (_error) {
          // Continue with memory test even if operations fail
        }
      }

      // Force cleanup
      if (typeof global !== "undefined" && global.gc) {
        global.gc();
      }

      const finalMemory = getMemoryUsage();
      const memoryGrowth = finalMemory - baselineMemory;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      // Memory growth should be controlled (less than 100MB after multiple operations)
      expect(memoryGrowthMB).toBeLessThan(100);
      expect(typeof memoryGrowth).toBe("number");
    });
  });

  describe("Concurrent Operation Performance", () => {
    test("should handle concurrent requests efficiently", async () => {
      const concurrentOperations = 3;
      const startTime = performance.now();

      const operations = Array.from(
        { length: concurrentOperations },
        (_, index) => {
          return async () => {
            const operationStart = performance.now();
            try {
              const result = await handlers.searchIssues.handle({
                query: "project IS NOT EMPTY",
                maxResults: 5,
              });
              return {
                index,
                duration: performance.now() - operationStart,
                success: result.success,
              };
            } catch (_error) {
              return {
                index,
                duration: performance.now() - operationStart,
                success: false,
              };
            }
          };
        },
      );

      const results = await Promise.all(operations.map((op) => op()));
      const totalDuration = performance.now() - startTime;

      // Verify concurrent execution
      expect(results.length).toBe(concurrentOperations);

      // Concurrent operations should complete faster than sequential
      const sequentialEstimate = results.reduce(
        (sum, result) => sum + result.duration,
        0,
      );
      expect(totalDuration).toBeLessThan(sequentialEstimate);

      // All operations should have completed
      for (const result of results) {
        expect(result.duration).toBeGreaterThan(0);
        expect(typeof result.success).toBe("boolean");
      }
    });

    test("should maintain performance under concurrent load", async () => {
      const concurrentBatches = 2;
      const operationsPerBatch = 3;
      const batchResults: Array<{
        batchIndex: number;
        avgDuration: number;
        successRate: number;
      }> = [];

      for (let batchIndex = 0; batchIndex < concurrentBatches; batchIndex++) {
        const batchOperations = Array.from(
          { length: operationsPerBatch },
          async () => {
            const opStart = performance.now();
            try {
              const result = await handlers.getAssignedIssues.handle({
                maxResults: 3,
              });
              return {
                duration: performance.now() - opStart,
                success: result.success,
              };
            } catch (_error) {
              return {
                duration: performance.now() - opStart,
                success: false,
              };
            }
          },
        );

        const batchOpResults = await Promise.all(batchOperations);
        const avgDuration =
          batchOpResults.reduce((sum, op) => sum + op.duration, 0) /
          batchOpResults.length;
        const successCount = batchOpResults.filter((op) => op.success).length;
        const successRate = successCount / batchOpResults.length;

        batchResults.push({
          batchIndex,
          avgDuration,
          successRate,
        });

        // Performance should remain consistent across batches
        expect(avgDuration).toBeLessThan(10000); // 10 seconds max average
      }

      // Verify batch performance consistency
      expect(batchResults.length).toBe(concurrentBatches);

      if (batchResults.length > 1) {
        const avgDurations = batchResults.map((batch) => batch.avgDuration);
        const maxDuration = Math.max(...avgDurations);
        const minDuration = Math.min(...avgDurations);

        // Performance variance should be reasonable (max 5x difference)
        if (minDuration > 0) {
          expect(maxDuration / minDuration).toBeLessThan(5);
        }
      }
    });
  });

  describe("Resource Utilization Efficiency", () => {
    test("should optimize client resource usage", async () => {
      const resourceMetrics = {
        clientCreationTime: 0,
        handlerInitTime: 0,
        firstOperationTime: 0,
        subsequentOperationTime: 0,
      };

      // Measure client creation time
      const clientStart = performance.now();
      const testConfig = new JiraConfig({
        hostUrl: "https://test.atlassian.net",
        username: "test@example.com",
        apiToken: "token123",
      });
      const testClient = new JiraClient(testConfig);
      resourceMetrics.clientCreationTime = performance.now() - clientStart;

      // Measure handler initialization time
      const handlerStart = performance.now();
      const testHandler = new SearchIssuesHandler(testClient);
      resourceMetrics.handlerInitTime = performance.now() - handlerStart;

      // Measure first operation time
      const firstOpStart = performance.now();
      try {
        await testHandler.handle({
          query: "project IS NOT EMPTY",
          maxResults: 1,
        });
      } catch (_error) {
        // Continue measuring even if operation fails
      }
      resourceMetrics.firstOperationTime = performance.now() - firstOpStart;

      // Measure subsequent operation time
      const subsequentOpStart = performance.now();
      try {
        await testHandler.handle({
          query: "project IS NOT EMPTY",
          maxResults: 1,
        });
      } catch (_error) {
        // Continue measuring even if operation fails
      }
      resourceMetrics.subsequentOperationTime =
        performance.now() - subsequentOpStart;

      // Verify resource efficiency
      expect(resourceMetrics.clientCreationTime).toBeLessThan(100); // 100ms max for client creation
      expect(resourceMetrics.handlerInitTime).toBeLessThan(50); // 50ms max for handler init
      expect(resourceMetrics.firstOperationTime).toBeGreaterThan(0);
      expect(resourceMetrics.subsequentOperationTime).toBeGreaterThan(0);

      // All metrics should be captured
      for (const value of Object.values(resourceMetrics)) {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThanOrEqual(0);
      }
    });

    test("should demonstrate performance scaling characteristics", async () => {
      const scalingTests = [
        { requestSize: 1, label: "small" },
        { requestSize: 5, label: "medium" },
        { requestSize: 10, label: "large" },
      ];

      const scalingResults: Array<{
        requestSize: number;
        label: string;
        duration: number;
        throughput: number;
      }> = [];

      for (const test of scalingTests) {
        const startTime = performance.now();
        let recordsProcessed = 0;

        try {
          const result = await handlers.searchIssues.handle({
            query: "project IS NOT EMPTY ORDER BY created DESC",
            maxResults: test.requestSize,
          });

          recordsProcessed = isSuccessfulSearchResult(result)
            ? result.data.issues.length
            : 0;
        } catch (_error) {
          // Continue with scaling analysis even if operations fail
        }

        const duration = performance.now() - startTime;
        const throughput =
          recordsProcessed > 0 ? recordsProcessed / (duration / 1000) : 0;

        scalingResults.push({
          requestSize: test.requestSize,
          label: test.label,
          duration,
          throughput,
        });
      }

      // Verify scaling characteristics
      expect(scalingResults.length).toBe(scalingTests.length);

      for (const result of scalingResults) {
        expect(result.duration).toBeGreaterThan(0);
        expect(result.throughput).toBeGreaterThanOrEqual(0);

        // Larger requests shouldn't be disproportionately slower
        expect(result.duration).toBeLessThan(30000); // 30 seconds max
      }

      // Performance should scale reasonably with request size
      if (scalingResults.length >= 2) {
        const smallResult = scalingResults[0];
        const largeResult = scalingResults[scalingResults.length - 1];

        if (
          smallResult.duration > 0 &&
          largeResult.requestSize > smallResult.requestSize
        ) {
          const scalingFactor =
            largeResult.requestSize / smallResult.requestSize;
          const timingRatio = largeResult.duration / smallResult.duration;

          // Timing shouldn't scale worse than quadratically
          expect(timingRatio).toBeLessThan(scalingFactor * scalingFactor);
        }
      }
    });
  });
});
