/**
 * Update Issue Use Case Tests
 * Comprehensive test suite for UpdateIssueUseCase including ADF conversion and validation
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { IssueTransitionRepository } from "@features/jira/issues/repositories/issue-transition.repository";
import type { IssueRepository } from "@features/jira/issues/repositories/issue.repository";
import type { WorklogRepository } from "@features/jira/issues/repositories/worklog.repository";
import {
  UpdateIssueUseCaseImpl,
  type UpdateIssueUseCaseRequest,
} from "@features/jira/issues/use-cases/update-issue.use-case";
import type { ProjectPermissionRepository } from "@features/jira/projects/repositories";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("UpdateIssueUseCase", () => {
  let useCase: UpdateIssueUseCaseImpl;
  let mockIssueRepository: {
    updateIssue: ReturnType<typeof mock>;
    getIssue: ReturnType<typeof mock>;
  };
  let mockTransitionRepository: {
    transitionIssue: ReturnType<typeof mock>;
  };
  let mockWorklogRepository: {
    addWorklog: ReturnType<typeof mock>;
  };
  let mockPermissionChecker: {
    hasEditIssuePermission: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    // Create mock dependencies
    mockIssueRepository = {
      updateIssue: mock(() => {}),
      getIssue: mock(() => {}),
    };

    mockTransitionRepository = {
      transitionIssue: mock(() => {}),
    };

    mockWorklogRepository = {
      addWorklog: mock(() => {}),
    };

    mockPermissionChecker = {
      hasEditIssuePermission: mock(() => {}),
    };

    // Create use case with mocks
    useCase = new UpdateIssueUseCaseImpl(
      mockIssueRepository as unknown as IssueRepository,
      mockTransitionRepository as unknown as IssueTransitionRepository,
      mockWorklogRepository as unknown as WorklogRepository,
      mockPermissionChecker as unknown as ProjectPermissionRepository,
    );
  });

  afterEach(() => {
    // Clear all mocks
    mockIssueRepository.updateIssue.mockClear();
    mockIssueRepository.getIssue.mockClear();
    mockTransitionRepository.transitionIssue.mockClear();
    mockWorklogRepository.addWorklog.mockClear();
    mockPermissionChecker.hasEditIssuePermission.mockClear();
  });

  describe("execute()", () => {
    it("should update issue with basic fields", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-123",
        fields: {
          summary: "Updated summary",
          priority: { name: "High" },
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        fields: {
          project: { key: "TEST" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        fields: {
          summary: "Updated summary",
          priority: { name: "High" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      const result = await useCase.execute(request);

      expect(result).toBe(updatedIssue);
      expect(mockIssueRepository.getIssue).toHaveBeenCalledTimes(2);
      expect(mockPermissionChecker.hasEditIssuePermission).toHaveBeenCalledWith(
        "TEST",
      );
      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith("TEST-123", {
        fields: {
          summary: "Updated summary",
          priority: { name: "High" },
        },
        notifyUsers: true,
      });
    });

    it("should update issue with ADF description", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-124",
        fields: {
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Updated description with ADF format",
                  },
                ],
              },
            ],
          },
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-124",
        fields: {
          project: { key: "TEST" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TEST-124",
        fields: {
          description: "Updated description",
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      const result = await useCase.execute(request);

      expect(result).toBe(updatedIssue);
      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith("TEST-124", {
        fields: {
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Updated description with ADF format",
                  },
                ],
              },
            ],
          },
        },
        notifyUsers: true,
      });
    });

    it("should update issue with status transition", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-125",
        transition: {
          id: "31",
          fields: {
            resolution: { name: "Done" },
          },
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-125",
        fields: {
          project: { key: "TEST" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TEST-125",
        fields: {
          status: { name: "Done" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockTransitionRepository.transitionIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      const result = await useCase.execute(request);

      expect(result).toBe(updatedIssue);
      expect(mockTransitionRepository.transitionIssue).toHaveBeenCalledWith(
        "TEST-125",
        "31",
        {
          resolution: { name: "Done" },
        },
      );
    });

    it("should update issue with both fields and transition", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-126",
        fields: {
          assignee: { accountId: "user123", displayName: "Test User" },
        },
        transition: {
          id: "21",
        },
        notifyUsers: false,
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-126",
        fields: {
          project: { key: "TEST" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TEST-126",
        fields: {
          assignee: { accountId: "user123", displayName: "Test User" },
          status: { name: "In Progress" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockTransitionRepository.transitionIssue.mockResolvedValue(undefined);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      const result = await useCase.execute(request);

      expect(result).toBe(updatedIssue);
      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith("TEST-126", {
        fields: {
          assignee: { accountId: "user123", displayName: "Test User" },
        },
        notifyUsers: false,
      });
      expect(mockTransitionRepository.transitionIssue).toHaveBeenCalledWith(
        "TEST-126",
        "21",
        undefined,
      );
    });

    it("should update issue with array fields", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-127",
        fields: {
          labels: ["bug", "urgent", "frontend"],
          components: [{ name: "UI" }, { name: "API" }],
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-127",
        fields: {
          project: { key: "TEST" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TEST-127",
        fields: {
          labels: ["bug", "urgent", "frontend"],
          components: [{ name: "UI" }, { name: "API" }],
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith("TEST-127", {
        fields: {
          labels: ["bug", "urgent", "frontend"],
          components: [{ name: "UI" }, { name: "API" }],
        },
        notifyUsers: true,
      });
    });

    it("should handle minimal update with only issueKey", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-128",
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-128",
        fields: {
          project: { key: "TEST" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({ key: "TEST-128" });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      const result = await useCase.execute(request);

      expect(result).toBe(updatedIssue);
      // Should not call updateIssue when no fields provided
      expect(mockIssueRepository.updateIssue).not.toHaveBeenCalled();
    });

    it("should throw error when permission check fails", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "RESTRICTED-123",
        fields: {
          summary: "Updated summary",
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "RESTRICTED-123",
        fields: {
          project: { key: "RESTRICTED" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValue(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(false);

      await expect(useCase.execute(request)).rejects.toThrow(
        "User does not have EDIT_ISSUES permission",
      );
      expect(mockIssueRepository.updateIssue).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TEST-129",
        fields: {
          summary: "Updated summary",
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TEST-129",
        fields: {
          project: { key: "TEST" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockRejectedValue(
        new Error("Repository error"),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        "Repository error",
      );
    });

    it("should extract project key correctly from various issue key formats", async () => {
      const testCases = [
        { issueKey: "TEST-123", expectedProject: "TEST" },
        { issueKey: "MYPROJECT-456", expectedProject: "MYPROJECT" },
        { issueKey: "ABC-1", expectedProject: "ABC" },
        { issueKey: "PROJECT_NAME-999", expectedProject: "PROJECT_NAME" },
      ];

      for (const { issueKey, expectedProject } of testCases) {
        const request: UpdateIssueUseCaseRequest = {
          issueKey,
          fields: { summary: "Test" },
        };

        const currentIssue = mockFactory.createMockIssue({
          key: issueKey,
          fields: {
            project: { key: expectedProject },
          },
        });

        const updatedIssue = mockFactory.createMockIssue({ key: issueKey });

        // Reset mocks
        mockIssueRepository.getIssue.mockClear();
        mockPermissionChecker.hasEditIssuePermission.mockClear();
        mockIssueRepository.updateIssue.mockClear();

        // Setup mocks
        mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
        mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
        mockIssueRepository.updateIssue.mockResolvedValue(undefined);
        mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

        await useCase.execute(request);

        expect(
          mockPermissionChecker.hasEditIssuePermission,
        ).toHaveBeenCalledWith(expectedProject);
      }
    });
  });

  describe("field update scenarios", () => {
    it("should handle complex field combinations", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "COMPLEX-123",
        fields: {
          summary: "Complex update",
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Updated " },
                  {
                    type: "text",
                    text: "description",
                    marks: [{ type: "strong" }],
                  },
                ],
              },
            ],
          },
          priority: { name: "Critical" },
          assignee: { accountId: "dev123", displayName: "Developer" },
          labels: ["hotfix", "urgent"],
          components: [{ name: "Backend" }],
          customfield_10016: 8, // Story points
        },
        notifyUsers: false,
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "COMPLEX-123",
        fields: {
          project: { key: "COMPLEX" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({ key: "COMPLEX-123" });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith(
        "COMPLEX-123",
        {
          fields: {
            summary: "Complex update",
            description: expect.objectContaining({
              type: "doc",
              version: 1,
            }),
            priority: { name: "Critical" },
            assignee: { accountId: "dev123", displayName: "Developer" },
            labels: ["hotfix", "urgent"],
            components: [{ name: "Backend" }],
            customfield_10016: 8,
          },
          notifyUsers: false,
        },
      );
    });

    it("should handle null/undefined field values", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "NULL-123",
        fields: {
          assignee: null, // Unassign
          priority: undefined, // No change
          labels: [], // Clear labels
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "NULL-123",
        fields: {
          project: { key: "NULL" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({ key: "NULL-123" });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith("NULL-123", {
        fields: {
          assignee: null,
          priority: undefined,
          labels: [],
        },
        notifyUsers: true,
      });
    });
  });

  describe("transition scenarios", () => {
    it("should handle transition with required fields", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TRANS-123",
        transition: {
          id: "5",
          fields: {
            resolution: { name: "Fixed" },
            fixVersions: [{ name: "v1.0" }],
          },
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TRANS-123",
        fields: {
          project: { key: "TRANS" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TRANS-123",
        fields: {
          status: { name: "Resolved" },
          resolution: { name: "Fixed" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockTransitionRepository.transitionIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockTransitionRepository.transitionIssue).toHaveBeenCalledWith(
        "TRANS-123",
        "5",
        {
          resolution: { name: "Fixed" },
          fixVersions: [{ name: "v1.0" }],
        },
      );
    });

    it("should handle transition without additional fields", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "TRANS-124",
        transition: {
          id: "11", // Start Progress
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "TRANS-124",
        fields: {
          project: { key: "TRANS" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({
        key: "TRANS-124",
        fields: {
          status: { name: "In Progress" },
        },
      });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockTransitionRepository.transitionIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockTransitionRepository.transitionIssue).toHaveBeenCalledWith(
        "TRANS-124",
        "11",
        undefined,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty fields object", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "EMPTY-123",
        fields: {},
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "EMPTY-123",
        fields: {
          project: { key: "EMPTY" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({ key: "EMPTY-123" });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith(
        "EMPTY-123",
        {
          fields: {},
          notifyUsers: true,
        },
      );
    });

    it("should handle invalid issue key format gracefully", async () => {
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "invalid-key-format",
        fields: { summary: "Test" },
      };

      // When getIssue fails, it should throw the proper error
      mockIssueRepository.getIssue.mockRejectedValue(
        new Error("Issue not found"),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        "Issue 'invalid-key-format' not found or inaccessible",
      );
    });

    it("should handle very long field values", async () => {
      const longText = "a".repeat(32767); // Max description length
      const request: UpdateIssueUseCaseRequest = {
        issueKey: "LONG-123",
        fields: {
          summary: "Long content test",
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: longText }],
              },
            ],
          },
        },
      };

      const currentIssue = mockFactory.createMockIssue({
        key: "LONG-123",
        fields: {
          project: { key: "LONG" },
        },
      });

      const updatedIssue = mockFactory.createMockIssue({ key: "LONG-123" });

      // Setup mocks
      mockIssueRepository.getIssue.mockResolvedValueOnce(currentIssue);
      mockPermissionChecker.hasEditIssuePermission.mockResolvedValue(true);
      mockIssueRepository.updateIssue.mockResolvedValue(undefined);
      mockIssueRepository.getIssue.mockResolvedValueOnce(updatedIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith("LONG-123", {
        fields: {
          summary: "Long content test",
          description: expect.objectContaining({
            content: expect.arrayContaining([
              expect.objectContaining({
                content: expect.arrayContaining([
                  expect.objectContaining({
                    text: longText,
                  }),
                ]),
              }),
            ]),
          }),
        },
        notifyUsers: true,
      });
    });
  });
});
