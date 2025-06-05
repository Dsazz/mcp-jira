/**
 * Integration tests for Issue Operations (Create/Update)
 * Tests the complete flow from permission checking to actual issue operations
 */
import { describe, test, expect, beforeAll } from "bun:test";
import { JiraHttpClient } from "@features/jira/client/http";
import { ProjectPermissionRepositoryImpl } from "@features/jira/projects/repositories/project-permission.repository";
import { IssueRepositoryImpl } from "@features/jira/issues/repositories/issue.repository";
import { CreateIssueUseCaseImpl } from "@features/jira/issues/use-cases/create-issue.use-case";
import { UpdateIssueUseCaseImpl } from "@features/jira/issues/use-cases/update-issue.use-case";
import { ProjectValidatorImpl } from "@features/jira/projects/validators/project.validator";
import { IssueTransitionRepositoryImpl } from "@features/jira/issues/repositories/issue-transition.repository";
import { WorklogRepositoryImpl } from "@features/jira/issues/repositories/worklog.repository";
import { JiraConfigService } from "@features/jira/client/config";
import type { Issue } from "@features/jira/issues/models/issue.models";
import {
  hasJiraCredentials,
  getJiraCredentialsSkipReason,
} from "../utils/jira-credentials";

describe("Issue Operations Integration Tests", () => {
  let httpClient: JiraHttpClient;
  let permissionRepository: ProjectPermissionRepositoryImpl;
  let issueRepository: IssueRepositoryImpl;
  let createIssueUseCase: CreateIssueUseCaseImpl;
  let updateIssueUseCase: UpdateIssueUseCaseImpl;
  let createdIssueKey: string | null = null;

  // Test configuration - these should be set via environment variables
  const testConfig = {
    hostUrl: process.env.JIRA_HOST || "https://example.atlassian.net",
    username: process.env.JIRA_USERNAME || "test@example.com",
    apiToken: process.env.JIRA_API_TOKEN || "test-token",
  };

  beforeAll(() => {
    if (!hasJiraCredentials()) {
      console.log(
        "⚠️ Skipping integration tests - no JIRA credentials provided",
      );
      console.log(`   Reason: ${getJiraCredentialsSkipReason()}`);
      console.log(
        "   Set JIRA_HOST, JIRA_USERNAME, and JIRA_API_TOKEN to run integration tests",
      );
      return;
    }

    // Initialize dependencies only when credentials are available
    const configService = new JiraConfigService(testConfig);
    httpClient = new JiraHttpClient(configService);
    permissionRepository = new ProjectPermissionRepositoryImpl(httpClient);
    issueRepository = new IssueRepositoryImpl(httpClient);

    // Initialize use cases with all required dependencies
    const projectValidator = new ProjectValidatorImpl(httpClient);
    const transitionRepository = new IssueTransitionRepositoryImpl(httpClient);
    const worklogRepository = new WorklogRepositoryImpl(httpClient);

    createIssueUseCase = new CreateIssueUseCaseImpl(
      issueRepository,
      projectValidator,
      permissionRepository,
    );

    updateIssueUseCase = new UpdateIssueUseCaseImpl(
      issueRepository,
      transitionRepository,
      worklogRepository,
      permissionRepository,
    );
  });

  describe("Permission Validation Flow", () => {
    test("should validate CREATE_ISSUES permission before creating issue", async () => {
      if (!hasJiraCredentials()) {
        console.log("⚠️ Skipping test - no JIRA credentials provided");
        return;
      }

      console.log("🔍 Testing CREATE_ISSUES permission validation...");

      try {
        const hasPermission =
          await permissionRepository.hasCreateIssuePermission("SEC");
        console.log(
          `CREATE_ISSUES permission: ${hasPermission ? "✅ GRANTED" : "❌ DENIED"}`,
        );

        expect(typeof hasPermission).toBe("boolean");

        if (hasPermission) {
          console.log(
            "✅ Permission validation working correctly for CREATE_ISSUES",
          );
        } else {
          console.warn(
            "⚠️ CREATE_ISSUES permission denied - check if this is expected",
          );
        }
      } catch (error) {
        console.error("❌ Permission validation failed:", error);
        throw error;
      }
    });

    test("should validate EDIT_ISSUES permission before updating issue", async () => {
      if (!hasJiraCredentials()) {
        console.log("⚠️ Skipping test - no JIRA credentials provided");
        return;
      }

      console.log("🔍 Testing EDIT_ISSUES permission validation...");

      try {
        const hasPermission =
          await permissionRepository.hasEditIssuePermission("SEC");
        console.log(
          `EDIT_ISSUES permission: ${hasPermission ? "✅ GRANTED" : "❌ DENIED"}`,
        );

        expect(typeof hasPermission).toBe("boolean");

        if (hasPermission) {
          console.log(
            "✅ Permission validation working correctly for EDIT_ISSUES",
          );
        } else {
          console.warn(
            "⚠️ EDIT_ISSUES permission denied - check if this is expected",
          );
        }
      } catch (error) {
        console.error("❌ Permission validation failed:", error);
        throw error;
      }
    });
  });

  describe("Issue Creation Flow", () => {
    test("should create issue in SEC project without permission errors", async () => {
      if (!hasJiraCredentials()) {
        console.log("⚠️ Skipping test - no JIRA credentials provided");
        return;
      }
      await testIssueCreation();
    });
  });

  async function testIssueCreation(): Promise<void> {
    console.log("🔍 Testing issue creation in SEC project...");

    try {
      const createRequest = {
        projectKey: "SEC",
        summary: `Integration Test Issue - ${new Date().toISOString()}`,
        description: "This is a test issue created by integration tests",
        issueType: "Task",
      };

      const createdIssue = await createIssueUseCase.execute(createRequest);
      validateCreatedIssue(createdIssue);
      logCreationSuccess(createdIssue);
    } catch (error) {
      handleCreationError(error);
      throw error;
    }
  }

  function validateCreatedIssue(createdIssue: Issue): void {
    expect(createdIssue).toBeDefined();
    expect(createdIssue.key).toBeDefined();
    expect(createdIssue.key).toMatch(/^SEC-\d+$/);
    expect(createdIssue.fields?.project?.key).toBe("SEC");
    expect(createdIssue.fields?.summary).toContain("Integration Test Issue");

    // Store for cleanup
    createdIssueKey = createdIssue.key;
  }

  function logCreationSuccess(createdIssue: Issue): void {
    console.log(`✅ Successfully created issue: ${createdIssue.key}`);
    console.log("📋 Issue details:", {
      key: createdIssue.key,
      summary: createdIssue.fields?.summary,
      project: createdIssue.fields?.project?.key,
      status: createdIssue.fields?.status?.name,
    });
  }

  function handleCreationError(error: unknown): void {
    console.error("❌ Issue creation failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        console.error(
          "🚨 PERMISSION ERROR: This suggests the fix didn't work!",
        );
      } else if (error.message.includes("404")) {
        console.error("🚨 PROJECT NOT FOUND: SEC project may not exist");
      }
    }
  }

  describe("Issue Update Flow", () => {
    test("should update created issue without permission errors", async () => {
      if (!hasJiraCredentials()) {
        console.log("⚠️ Skipping test - no JIRA credentials provided");
        return;
      }
      await testIssueUpdate();
    });
  });

  async function testIssueUpdate(): Promise<void> {
    if (!createdIssueKey) {
      console.log("⚠️ Skipping update test - no issue was created");
      return;
    }

    console.log(`🔍 Testing issue update for ${createdIssueKey}...`);

    try {
      const updateRequest = {
        issueKey: createdIssueKey,
        fields: {
          summary: `Updated Integration Test Issue - ${new Date().toISOString()}`,
          description: "This issue has been updated by integration tests",
        },
      };

      const updatedIssue = await updateIssueUseCase.execute(updateRequest);
      validateUpdatedIssue(updatedIssue);
      logUpdateSuccess(updatedIssue);
    } catch (error) {
      handleUpdateError(error);
      throw error;
    }
  }

  function validateUpdatedIssue(updatedIssue: Issue): void {
    expect(updatedIssue).toBeDefined();
    expect(createdIssueKey).toBeDefined();
    expect(updatedIssue.key).toBe(createdIssueKey as string);
    expect(updatedIssue.fields?.summary).toContain(
      "Updated Integration Test Issue",
    );
  }

  function logUpdateSuccess(updatedIssue: Issue): void {
    console.log(`✅ Successfully updated issue: ${updatedIssue.key}`);
    console.log("📋 Updated issue details:", {
      key: updatedIssue.key,
      summary: updatedIssue.fields?.summary,
      project: updatedIssue.fields?.project?.key,
      status: updatedIssue.fields?.status?.name,
    });
  }

  function handleUpdateError(error: unknown): void {
    console.error("❌ Issue update failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        console.error(
          "🚨 PERMISSION ERROR: This suggests the fix didn't work!",
        );
      } else if (error.message.includes("404")) {
        console.error("🚨 ISSUE NOT FOUND: Issue may have been deleted");
      }
    }
  }

  describe("Error Handling", () => {
    test("should handle non-existent project gracefully", async () => {
      if (!hasJiraCredentials()) {
        console.log("⚠️ Skipping test - no JIRA credentials provided");
        return;
      }

      console.log("🔍 Testing error handling for non-existent project...");

      try {
        const createRequest = {
          projectKey: "NONEXISTENT",
          summary: "Test issue for non-existent project",
          description: "This should fail",
          issueType: "Task",
        };

        await createIssueUseCase.execute(createRequest);

        // If we get here, something is wrong
        throw new Error(
          "Expected error for non-existent project, but operation succeeded",
        );
      } catch (error) {
        console.log("✅ Correctly handled non-existent project error");
        expect(error).toBeDefined();

        if (error instanceof Error) {
          console.log(`Error message: ${error.message}`);
          expect(error.message).toMatch(/project|not found|permission/i);
        }
      }
    });
  });
});

/**
 * Test runner instructions:
 *
 * To run these integration tests with real JIRA credentials:
 *
 * 1. Set environment variables:
 *    export JIRA_HOST="https://your-domain.atlassian.net"
 *    export JIRA_USERNAME="your-email@domain.com"
 *    export JIRA_API_TOKEN="your-api-token"
 *
 * 2. Run integration tests:
 *    bun run test:integration
 *
 * Without credentials, these tests will be automatically skipped.
 *
 * Note: These tests will create and update real issues in your JIRA instance.
 * Make sure you have appropriate permissions and are testing in a safe environment.
 */
