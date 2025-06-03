/**
 * Cross-Repository Integration Tests
 *
 * Tests integration between multiple repositories in complex scenarios
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { IntegrationTestEnvironment } from "@test/integration/integration-test-utils";
import { mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Set up test environment
setupTests();

describe("Cross-Repository Integration", () => {
  let env: IntegrationTestEnvironment;

  beforeEach(() => {
    // Create integration test environment with clean mocks for each test
    env = new IntegrationTestEnvironment();
  });

  afterEach(() => {
    // Clean up mocks after each test
    env.reset();
  });

  /**
   * Test that we can handle error cases across different repositories
   */
  it("should propagate errors correctly across repositories", async () => {
    // Setup repositories
    const projectRepository = env.createProjectRepository();
    const issueRepository = env.createIssueRepository();
    const commentRepository = env.createIssueCommentRepository();

    // Mock API errors
    mockHttp.mockJiraApiError(
      "/rest/api/3/project/INVALID",
      404,
      "Project not found",
    );

    mockHttp.mockJiraApiError(
      "/rest/api/3/issue/INVALID-123",
      404,
      "Issue not found",
    );

    mockHttp.mockJiraApiError(
      "/rest/api/3/issue/INVALID-123/comment",
      404,
      "Issue not found",
    );

    // Test error propagation in each repository
    await expect(projectRepository.getProject("INVALID")).rejects.toThrow();
    await expect(issueRepository.getIssue("INVALID-123")).rejects.toThrow();
    await expect(
      commentRepository.getIssueComments("INVALID-123"),
    ).rejects.toThrow();
  });

  /**
   * Test that network errors are handled consistently across repositories
   */
  it("should handle HTTP client errors consistently across repositories", async () => {
    // Setup repositories
    const issueRepository = env.createIssueRepository();
    const commentRepository = env.createIssueCommentRepository();
    const projectRepository = env.createProjectRepository();

    // Mock network errors
    mockHttp.mockNetworkError("/rest/api/3/issue/NETWORK-123");
    mockHttp.mockNetworkError("/rest/api/3/issue/NETWORK-123/comment");
    mockHttp.mockNetworkError("/rest/api/3/project/NETWORK");

    // Test error propagation in each repository
    await expect(issueRepository.getIssue("NETWORK-123")).rejects.toThrow(
      "Network error",
    );
    await expect(
      commentRepository.getIssueComments("NETWORK-123"),
    ).rejects.toThrow("Network error");
    await expect(projectRepository.getProject("NETWORK")).rejects.toThrow(
      "Network error",
    );
  });
});
