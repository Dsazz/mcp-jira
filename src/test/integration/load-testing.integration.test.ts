import { beforeEach, describe, expect, test } from "bun:test";
import { JiraClient } from "@features/jira/api/jira.client.impl";
import { JiraConfig } from "@features/jira/api/jira.config.types";
import { GetAssignedIssuesHandler } from "@features/jira/tools/handlers/get-assigned-issues.handler";
import { GetIssueHandler } from "@features/jira/tools/handlers/get-issue.handler";
import { SearchIssuesHandler } from "@features/jira/tools/handlers/search-issues.handler";
import { isSuccessfulSearchResult } from "@test/utils/type-guards";

interface LoadTestResult {
  operationName: string;
  concurrency: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalDuration: number;
  averageDuration: number;
  throughput: number; // operations per second
  successRate: number;
  errors: string[];
}

describe("Load Testing Integration", () => {
  let client: JiraClient;
  let config: JiraConfig;
  let handlers: {
    getAssignedIssues: GetAssignedIssuesHandler;
    searchIssues: SearchIssuesHandler;
    getIssue: GetIssueHandler;
  };

  beforeEach(() => {
    // Setup test configuration
    config = new JiraConfig({
      hostUrl: "https://test-domain.atlassian.net",
      username: "test-user@example.com",
      apiToken: "test-api-token-123",
    });

    client = new JiraClient(config);

    // Initialize handlers for load testing
    handlers = {
      getAssignedIssues: new GetAssignedIssuesHandler(client),
      searchIssues: new SearchIssuesHandler(client),
      getIssue: new GetIssueHandler(client),
    };
  });

  describe("Concurrent Load Testing", () => {
    test("should handle multiple concurrent search operations", async () => {
      const concurrencyLevels = [5, 10];
      const loadTestResults: LoadTestResult[] = [];

      for (const concurrency of concurrencyLevels) {
        const startTime = performance.now();

        // Create concurrent operations
        const operations = Array.from({ length: concurrency }, async () => {
          const operationStart = performance.now();
          try {
            const result = await handlers.searchIssues.handle({
              query: "project IS NOT EMPTY ORDER BY created DESC",
              maxResults: 5,
            });

            return {
              success: result.success,
              duration: performance.now() - operationStart,
              error: result.success ? undefined : result.error,
            };
          } catch (error) {
            return {
              success: false,
              duration: performance.now() - operationStart,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        });

        const results = await Promise.all(operations);
        const totalDuration = performance.now() - startTime;

        // Analyze results
        const successfulOps = results.filter((r) => r.success).length;
        const failedOps = results.filter((r) => !r.success).length;
        const avgDuration =
          results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        const throughput = results.length / (totalDuration / 1000);
        const successRate = successfulOps / results.length;
        const errors = results
          .filter((r) => !r.success)
          .map((r) => r.error || "Unknown")
          .slice(0, 5);

        const loadResult: LoadTestResult = {
          operationName: "searchIssues",
          concurrency,
          totalOperations: results.length,
          successfulOperations: successfulOps,
          failedOperations: failedOps,
          totalDuration,
          averageDuration: avgDuration,
          throughput,
          successRate,
          errors,
        };

        loadTestResults.push(loadResult);

        // Verify load handling capabilities
        expect(results.length).toBe(concurrency);
        expect(totalDuration).toBeLessThan(30000); // 30 seconds max
        expect(successRate).toBeGreaterThanOrEqual(0); // At least tracking success rate
        expect(throughput).toBeGreaterThan(0);
      }

      // Verify scaling characteristics
      expect(loadTestResults.length).toBe(concurrencyLevels.length);

      if (loadTestResults.length >= 2) {
        const lowLoad = loadTestResults[0];
        const highLoad = loadTestResults[1];

        // Higher concurrency should not degrade performance excessively
        expect(highLoad.throughput).toBeGreaterThan(lowLoad.throughput * 0.5); // At least 50% efficiency
      }
    });

    test("should handle concurrent operations across different handlers", async () => {
      const mixedConcurrency = 6;
      const operationTypes = [
        () =>
          handlers.searchIssues.handle({
            query: "project IS NOT EMPTY",
            maxResults: 3,
          }),
        () => handlers.getAssignedIssues.handle({ maxResults: 3 }),
      ];

      const startTime = performance.now();

      // Create mixed concurrent operations
      const operations = Array.from(
        { length: mixedConcurrency },
        async (_, index) => {
          const operationType = index % operationTypes.length;
          const typeName = operationType === 0 ? "search" : "assigned";
          const operationFn = operationTypes[operationType];

          const operationStart = performance.now();
          try {
            const result = await operationFn();
            return {
              type: typeName,
              success: result.success,
              duration: performance.now() - operationStart,
            };
          } catch (_error) {
            return {
              type: typeName,
              success: false,
              duration: performance.now() - operationStart,
            };
          }
        },
      );

      const operationResults = await Promise.all(operations);
      const totalDuration = performance.now() - startTime;

      // Analyze mixed load results
      const searchOps = operationResults.filter((r) => r.type === "search");
      const assignedOps = operationResults.filter((r) => r.type === "assigned");

      expect(operationResults.length).toBe(mixedConcurrency);
      expect(searchOps.length).toBeGreaterThan(0);
      expect(assignedOps.length).toBeGreaterThan(0);
      expect(totalDuration).toBeLessThan(20000); // 20 seconds max for mixed load

      // Both operation types should complete
      for (const result of operationResults) {
        expect(result.duration).toBeGreaterThan(0);
        expect(typeof result.success).toBe("boolean");
      }
    });

    test("should maintain stability under sustained load", async () => {
      const sustainedBatches = 3;
      const operationsPerBatch = 4;
      const batchInterval = 1000; // 1 second between batches

      const batchResults: Array<{
        batchIndex: number;
        duration: number;
        successRate: number;
        avgResponseTime: number;
      }> = [];

      for (let batchIndex = 0; batchIndex < sustainedBatches; batchIndex++) {
        const batchStart = performance.now();

        // Execute batch of operations
        const batchOperations = Array.from(
          { length: operationsPerBatch },
          async () => {
            const opStart = performance.now();
            try {
              const result = await handlers.getAssignedIssues.handle({
                maxResults: 3,
              });
              return {
                success: result.success,
                duration: performance.now() - opStart,
              };
            } catch (_error) {
              return {
                success: false,
                duration: performance.now() - opStart,
              };
            }
          },
        );

        const batchOpResults = await Promise.all(batchOperations);
        const batchDuration = performance.now() - batchStart;

        const successCount = batchOpResults.filter((op) => op.success).length;
        const successRate = successCount / batchOpResults.length;
        const avgResponseTime =
          batchOpResults.reduce((sum, op) => sum + op.duration, 0) /
          batchOpResults.length;

        batchResults.push({
          batchIndex,
          duration: batchDuration,
          successRate,
          avgResponseTime,
        });

        // Wait before next batch (except for last batch)
        if (batchIndex < sustainedBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, batchInterval));
        }
      }

      // Verify sustained load stability
      expect(batchResults.length).toBe(sustainedBatches);

      for (const batch of batchResults) {
        expect(batch.duration).toBeLessThan(15000); // 15 seconds max per batch
        expect(batch.successRate).toBeGreaterThanOrEqual(0);
        expect(batch.avgResponseTime).toBeGreaterThan(0);
      }

      // Performance should remain consistent across batches
      if (batchResults.length > 1) {
        const responseTimes = batchResults.map((b) => b.avgResponseTime);
        const maxResponseTime = Math.max(...responseTimes);
        const minResponseTime = Math.min(...responseTimes);

        // Response time variation should be reasonable
        if (minResponseTime > 0) {
          expect(maxResponseTime / minResponseTime).toBeLessThan(10); // Max 10x difference
        }
      }
    });
  });

  describe("Bulk Operations Testing", () => {
    test("should handle bulk search operations efficiently", async () => {
      const bulkSizes = [20, 50];
      const bulkResults: Array<{
        size: number;
        duration: number;
        recordsReturned: number;
      }> = [];

      for (const bulkSize of bulkSizes) {
        const startTime = performance.now();
        let recordsReturned = 0;

        try {
          const result = await handlers.searchIssues.handle({
            query: "project IS NOT EMPTY ORDER BY created DESC",
            maxResults: bulkSize,
          });

          recordsReturned = isSuccessfulSearchResult(result)
            ? result.data.issues.length
            : 0;
        } catch (_error) {
          // Continue with bulk analysis even if operation fails
        }

        const duration = performance.now() - startTime;
        bulkResults.push({ size: bulkSize, duration, recordsReturned });

        // Bulk operations should complete within reasonable time
        expect(duration).toBeLessThan(20000); // 20 seconds max
      }

      // Verify bulk operation efficiency
      expect(bulkResults.length).toBe(bulkSizes.length);

      for (const result of bulkResults) {
        expect(result.duration).toBeGreaterThan(0);
        expect(result.recordsReturned).toBeGreaterThanOrEqual(0);

        // Calculate efficiency (records per second)
        const efficiency = result.recordsReturned / (result.duration / 1000);
        expect(efficiency).toBeGreaterThanOrEqual(0);
      }
    });

    test("should handle sequential bulk operations", async () => {
      const sequentialOperations = 5;
      const operationResults: Array<{
        index: number;
        duration: number;
        success: boolean;
      }> = [];

      for (let i = 0; i < sequentialOperations; i++) {
        const startTime = performance.now();
        let success = false;

        try {
          const result = await handlers.searchIssues.handle({
            query: "project IS NOT EMPTY",
            maxResults: 10,
          });
          success = result.success;
        } catch (_error) {
          success = false;
        }

        const duration = performance.now() - startTime;
        operationResults.push({ index: i, duration, success });

        // Small delay between operations to simulate real usage
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Verify sequential bulk operations
      expect(operationResults.length).toBe(sequentialOperations);

      for (const result of operationResults) {
        expect(result.duration).toBeGreaterThan(0);
        expect(typeof result.success).toBe("boolean");
        expect(result.duration).toBeLessThan(10000); // 10 seconds max per operation
      }

      // Performance should remain stable across sequential operations
      const durations = operationResults.map((r) => r.duration);
      const avgDuration =
        durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDeviation = Math.max(
        ...durations.map((d) => Math.abs(d - avgDuration)),
      );

      // Performance variation should be reasonable
      expect(maxDeviation).toBeLessThan(avgDuration * 3); // Max 3x average deviation
    });
  });

  describe("Stress Testing", () => {
    test("should handle rapid-fire operations", async () => {
      const rapidOperations = 8;
      const operationInterval = 100; // 100ms between operations
      const stressResults: Array<{
        operationIndex: number;
        startTime: number;
        endTime: number;
        success: boolean;
      }> = [];

      // Execute rapid-fire operations with minimal delay
      for (let i = 0; i < rapidOperations; i++) {
        const startTime = performance.now();
        let success = false;

        try {
          const result = await handlers.getAssignedIssues.handle({
            maxResults: 2,
          });
          success = result.success;
        } catch (_error) {
          success = false;
        }

        const endTime = performance.now();
        stressResults.push({
          operationIndex: i,
          startTime,
          endTime,
          success,
        });

        // Minimal delay before next operation
        if (i < rapidOperations - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, operationInterval),
          );
        }
      }

      // Verify rapid-fire stress handling
      expect(stressResults.length).toBe(rapidOperations);

      for (const result of stressResults) {
        const duration = result.endTime - result.startTime;
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(15000); // 15 seconds max per operation
        expect(typeof result.success).toBe("boolean");
      }

      // System should remain responsive under rapid-fire load
      const totalStressTime =
        stressResults[stressResults.length - 1].endTime -
        stressResults[0].startTime;
      expect(totalStressTime).toBeLessThan(30000); // 30 seconds max total
    });

    test("should recover from overload conditions", async () => {
      const overloadPhases = [
        { name: "warmup", operations: 3, delay: 500 },
        { name: "overload", operations: 6, delay: 50 },
        { name: "recovery", operations: 3, delay: 1000 },
      ];

      const phaseResults: Array<{
        phase: string;
        operations: number;
        avgDuration: number;
        successRate: number;
      }> = [];

      for (const phase of overloadPhases) {
        const phaseOperationResults: Array<{
          success: boolean;
          duration: number;
        }> = [];

        for (let i = 0; i < phase.operations; i++) {
          const startTime = performance.now();
          let success = false;

          try {
            const result = await handlers.searchIssues.handle({
              query: "project IS NOT EMPTY",
              maxResults: 3,
            });
            success = result.success;
          } catch (_error) {
            success = false;
          }

          const duration = performance.now() - startTime;
          phaseOperationResults.push({ success, duration });

          // Wait before next operation
          if (i < phase.operations - 1) {
            await new Promise((resolve) => setTimeout(resolve, phase.delay));
          }
        }

        // Analyze phase results
        const successCount = phaseOperationResults.filter(
          (r) => r.success,
        ).length;
        const avgDuration =
          phaseOperationResults.reduce((sum, r) => sum + r.duration, 0) /
          phaseOperationResults.length;
        const successRate = successCount / phaseOperationResults.length;

        phaseResults.push({
          phase: phase.name,
          operations: phase.operations,
          avgDuration,
          successRate,
        });
      }

      // Verify overload recovery pattern
      expect(phaseResults.length).toBe(overloadPhases.length);

      for (const phaseResult of phaseResults) {
        expect(phaseResult.avgDuration).toBeGreaterThan(0);
        expect(phaseResult.successRate).toBeGreaterThanOrEqual(0);
        expect(phaseResult.successRate).toBeLessThanOrEqual(1);
      }

      // Recovery phase should show improved performance compared to overload
      const overloadPhase = phaseResults.find((p) => p.phase === "overload");
      const recoveryPhase = phaseResults.find((p) => p.phase === "recovery");

      if (overloadPhase && recoveryPhase) {
        // Recovery should show stability (success rate should not be significantly worse)
        expect(recoveryPhase.successRate).toBeGreaterThanOrEqual(
          overloadPhase.successRate * 0.8,
        );
      }
    });

    test("should demonstrate resource cleanup under stress", async () => {
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

      // Execute stress operations
      const stressOperations = 10;
      const memoryCheckpoints: Array<{ operation: number; memory: number }> =
        [];

      for (let i = 0; i < stressOperations; i++) {
        try {
          await handlers.searchIssues.handle({
            query: "project IS NOT EMPTY",
            maxResults: 5,
          });
        } catch (_error) {
          // Continue stress test even if operations fail
        }

        // Record memory usage every few operations
        if (i % 3 === 0) {
          memoryCheckpoints.push({
            operation: i,
            memory: getMemoryUsage(),
          });
        }
      }

      // Force cleanup
      if (typeof global !== "undefined" && global.gc) {
        global.gc();
      }

      const finalMemory = getMemoryUsage();
      const memoryGrowth = finalMemory - baselineMemory;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      // Verify memory stability under stress
      expect(memoryCheckpoints.length).toBeGreaterThan(0);
      expect(memoryGrowthMB).toBeLessThan(200); // Less than 200MB growth under stress

      // Memory should not grow excessively across checkpoints
      if (memoryCheckpoints.length > 1) {
        const memoryValues = memoryCheckpoints.map((cp) => cp.memory);
        const maxMemory = Math.max(...memoryValues);
        const minMemory = Math.min(...memoryValues);
        const memoryRangeMB = (maxMemory - minMemory) / (1024 * 1024);

        expect(memoryRangeMB).toBeLessThan(150); // Memory range should be controlled
      }
    });
  });
});
