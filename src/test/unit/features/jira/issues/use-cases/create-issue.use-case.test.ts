/**
 * Create Issue Use Case Tests
 * Comprehensive test suite for CreateIssueUseCase including ADF conversion and validation
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { IssueRepository } from "@features/jira/issues/repositories/issue.repository";
import {
  type CreateIssueParams,
  CreateIssueUseCaseImpl,
  type CreateIssueUseCaseRequest,
  transformToCreateRequest,
} from "@features/jira/issues/use-cases/create-issue.use-case";
import type { ProjectPermissionRepository } from "@features/jira/projects/repositories";
import type { ProjectValidator } from "@features/jira/projects/validators/project.validator";
import { ensureADFFormat } from "@features/jira/shared/parsers/adf.parser";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("CreateIssueUseCase", () => {
  let useCase: CreateIssueUseCaseImpl;
  let mockIssueRepository: {
    createIssue: ReturnType<typeof mock>;
  };
  let mockProjectValidator: {
    validateProject: ReturnType<typeof mock>;
    validateIssueType: ReturnType<typeof mock>;
  };
  let mockPermissionChecker: {
    hasCreateIssuePermission: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    // Create mock dependencies
    mockIssueRepository = {
      createIssue: mock(() => {}),
    };

    mockProjectValidator = {
      validateProject: mock(() => {}),
      validateIssueType: mock(() => {}),
    };

    mockPermissionChecker = {
      hasCreateIssuePermission: mock(() => {}),
    };

    // Create use case with mocks
    useCase = new CreateIssueUseCaseImpl(
      mockIssueRepository as unknown as IssueRepository,
      mockProjectValidator as unknown as ProjectValidator,
      mockPermissionChecker as unknown as ProjectPermissionRepository,
    );
  });

  afterEach(() => {
    // Clear all mocks
    mockIssueRepository.createIssue.mockClear();
    mockProjectValidator.validateProject.mockClear();
    mockProjectValidator.validateIssueType.mockClear();
    mockPermissionChecker.hasCreateIssuePermission.mockClear();
  });

  describe("execute()", () => {
    it("should create issue with minimal required fields", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "TEST",
        summary: "Test issue summary",
        issueType: "Task",
      };

      const mockIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        fields: {
          summary: "Test issue summary",
          project: { key: "TEST" },
          issuetype: { name: "Task" },
        },
      });

      // Setup mocks
      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockProjectValidator.validateIssueType.mockResolvedValue(undefined);
      mockIssueRepository.createIssue.mockResolvedValue(mockIssue);

      const result = await useCase.execute(request);

      expect(result).toBe(mockIssue);
      expect(mockProjectValidator.validateProject).toHaveBeenCalledWith("TEST");
      expect(
        mockPermissionChecker.hasCreateIssuePermission,
      ).toHaveBeenCalledWith("TEST");
      expect(mockProjectValidator.validateIssueType).toHaveBeenCalledWith(
        "TEST",
        "Task",
      );
      expect(mockIssueRepository.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.objectContaining({
            project: { key: "TEST" },
            summary: "Test issue summary",
            issuetype: { name: "Task" },
          }),
        }),
      );
    });

    it("should create issue with description and convert to ADF", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "TEST",
        summary: "Test issue with description",
        issueType: "Bug",
        description:
          "This is a plain text description\n\nWith multiple paragraphs",
      };

      const mockIssue = mockFactory.createMockIssue({
        key: "TEST-124",
        fields: {
          summary: "Test issue with description",
          description: "ADF description",
        },
      });

      // Setup mocks
      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockProjectValidator.validateIssueType.mockResolvedValue(undefined);
      mockIssueRepository.createIssue.mockResolvedValue(mockIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.objectContaining({
            description: expect.objectContaining({
              type: "doc",
              version: 1,
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: "paragraph",
                  content: expect.arrayContaining([
                    expect.objectContaining({
                      type: "text",
                      text: "This is a plain text description",
                    }),
                  ]),
                }),
                expect.objectContaining({
                  type: "paragraph",
                  content: expect.arrayContaining([
                    expect.objectContaining({
                      type: "text",
                      text: "With multiple paragraphs",
                    }),
                  ]),
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it("should create issue with custom fields", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "CUSTOM",
        summary: "Issue with custom fields",
        issueType: "Story",
        customFields: {
          customfield_10001: "Epic Link",
          customfield_10002: 5, // Story points
          customfield_10003: ["label1", "label2"],
        },
      };

      const mockIssue = mockFactory.createMockIssue({ key: "CUSTOM-456" });

      // Setup mocks
      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockProjectValidator.validateIssueType.mockResolvedValue(undefined);
      mockIssueRepository.createIssue.mockResolvedValue(mockIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.objectContaining({
            customfield_10001: "Epic Link",
            customfield_10002: 5,
            customfield_10003: ["label1", "label2"],
          }),
        }),
      );
    });

    it("should handle empty description gracefully", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "TEST",
        summary: "Issue without description",
        issueType: "Task",
        description: "",
      };

      const mockIssue = mockFactory.createMockIssue({ key: "TEST-125" });

      // Setup mocks
      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockIssueRepository.createIssue.mockResolvedValue(mockIssue);

      await useCase.execute(request);

      const createCall = mockIssueRepository.createIssue.mock.calls[0][0];
      expect(createCall.fields.description).toBeUndefined();
    });

    it("should default to Task issue type when not provided", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "TEST",
        summary: "Issue without explicit type",
      };

      const mockIssue = mockFactory.createMockIssue({ key: "TEST-126" });

      // Setup mocks
      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockIssueRepository.createIssue.mockResolvedValue(mockIssue);

      await useCase.execute(request);

      expect(mockIssueRepository.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.objectContaining({
            issuetype: { name: "Task" },
          }),
        }),
      );
    });

    it("should throw error when project validation fails", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "INVALID",
        summary: "Test issue",
        issueType: "Task",
      };

      mockProjectValidator.validateProject.mockRejectedValue(
        new Error("Project not found"),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        "Project not found",
      );
      expect(
        mockPermissionChecker.hasCreateIssuePermission,
      ).not.toHaveBeenCalled();
      expect(mockIssueRepository.createIssue).not.toHaveBeenCalled();
    });

    it("should throw error when permission check fails", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "RESTRICTED",
        summary: "Test issue",
        issueType: "Task",
      };

      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(false);

      await expect(useCase.execute(request)).rejects.toThrow(
        "User does not have CREATE_ISSUES permission",
      );
      expect(mockIssueRepository.createIssue).not.toHaveBeenCalled();
    });

    it("should throw error when issue type validation fails", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "InvalidType",
      };

      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockProjectValidator.validateIssueType.mockRejectedValue(
        new Error("Invalid issue type"),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        "Invalid issue type",
      );
      expect(mockIssueRepository.createIssue).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      const request: CreateIssueUseCaseRequest = {
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      };

      // Setup mocks
      mockProjectValidator.validateProject.mockResolvedValue(undefined);
      mockPermissionChecker.hasCreateIssuePermission.mockResolvedValue(true);
      mockIssueRepository.createIssue.mockRejectedValue(
        new Error("Repository error"),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        "Repository error",
      );
    });
  });
});

describe("transformToCreateRequest()", () => {
  it("should transform minimal params to API request", () => {
    const params: CreateIssueParams = {
      projectKey: "TEST",
      summary: "Test summary",
      issueType: "Task",
    };

    const result = transformToCreateRequest(params);

    expect(result).toEqual({
      fields: {
        project: { key: "TEST" },
        summary: "Test summary",
        issuetype: { name: "Task" },
      },
    });
  });

  it("should transform description to ADF format", () => {
    const params: CreateIssueParams = {
      projectKey: "TEST",
      summary: "Test summary",
      issueType: "Task",
      description: "Plain text description",
    };

    const result = transformToCreateRequest(params);

    expect(result.fields.description).toEqual({
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Plain text description",
            },
          ],
        },
      ],
    });
  });

  it("should transform all optional fields", () => {
    const params: CreateIssueParams = {
      projectKey: "TEST",
      summary: "Complete issue",
      issueType: "Bug",
      description: "Bug description",
      priority: "High",
      assignee: "user123",
      labels: ["urgent", "frontend"],
      components: ["UI", "Backend"],
      fixVersions: ["v1.0", "v1.1"],
      parentIssueKey: "EPIC-456",
      timeEstimate: "2d",
      environment: "Production environment",
      storyPoints: 8,
    };

    const result = transformToCreateRequest(params);

    expect(result.fields).toEqual({
      project: { key: "TEST" },
      summary: "Complete issue",
      issuetype: { name: "Bug" },
      description: expect.objectContaining({ type: "doc" }),
      priority: { name: "High" },
      assignee: { accountId: "user123" },
      labels: ["urgent", "frontend"],
      components: [{ name: "UI" }, { name: "Backend" }],
      fixVersions: [{ name: "v1.0" }, { name: "v1.1" }],
      parent: { key: "EPIC-456" },
      timetracking: { originalEstimate: "2d" },
      environment: expect.objectContaining({ type: "doc" }),
      customfield_10016: 8,
    });
  });

  it("should handle undefined optional fields gracefully", () => {
    const params: CreateIssueParams = {
      projectKey: "TEST",
      summary: "Minimal issue",
      issueType: "Task",
      description: undefined,
      priority: undefined,
      assignee: undefined,
    };

    const result = transformToCreateRequest(params);

    expect(result.fields).toEqual({
      project: { key: "TEST" },
      summary: "Minimal issue",
      issuetype: { name: "Task" },
      description: undefined,
      priority: undefined,
      assignee: undefined,
      labels: undefined,
      components: undefined,
      fixVersions: undefined,
      parent: undefined,
      timetracking: undefined,
      environment: undefined,
      customfield_10016: undefined,
    });
  });

  it("should handle custom fields", () => {
    const params: CreateIssueParams = {
      projectKey: "TEST",
      summary: "Issue with custom fields",
      issueType: "Story",
      customFields: {
        customfield_10001: "Epic Link",
        customfield_10002: 3,
        customfield_10003: { complex: "object" },
      },
    };

    const result = transformToCreateRequest(params);

    expect(result.fields).toEqual({
      project: { key: "TEST" },
      summary: "Issue with custom fields",
      issuetype: { name: "Story" },
    });
  });
});

describe("ADF Integration Tests", () => {
  it("should convert various text formats to proper ADF", () => {
    const testCases = [
      {
        input: "Simple single line",
        expectedParagraphs: 1,
        expectedText: "Simple single line",
      },
      {
        input: "Line 1\nLine 2",
        expectedParagraphs: 1,
        expectedText: "Line 1\nLine 2",
      },
      {
        input: "Paragraph 1\n\nParagraph 2",
        expectedParagraphs: 2,
        expectedText: ["Paragraph 1", "Paragraph 2"],
      },
      {
        input: "Para 1\n\nPara 2\n\nPara 3",
        expectedParagraphs: 3,
        expectedText: ["Para 1", "Para 2", "Para 3"],
      },
    ];

    for (const { input, expectedParagraphs, expectedText } of testCases) {
      const adf = ensureADFFormat(input);

      expect(adf).toBeDefined();
      expect(adf?.type).toBe("doc");
      expect(adf?.content).toHaveLength(expectedParagraphs);

      if (Array.isArray(expectedText)) {
        for (const [index, text] of expectedText.entries()) {
          expect(adf?.content[index].content?.[0].text).toBe(text);
        }
      } else {
        expect(adf?.content[0].content?.[0].text).toBe(expectedText);
      }
    }
  });

  it("should handle edge cases in text conversion", () => {
    const edgeCases = [
      { input: "", expected: null },
      { input: "   ", expected: null },
      { input: "\n\n\n", expected: null },
      { input: "   text   ", expected: "text" },
      { input: "\n\nvalid text\n\n", expected: "valid text" },
    ];

    for (const { input, expected } of edgeCases) {
      const adf = ensureADFFormat(input);

      if (expected === null) {
        expect(adf).toBeNull();
      } else {
        expect(adf?.content[0].content?.[0].text).toBe(expected);
      }
    }
  });
});
