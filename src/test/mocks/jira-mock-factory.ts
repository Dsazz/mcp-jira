/**
 * JIRA Mock Data Factory
 *
 * Centralized factory for creating mock JIRA data for testing
 * Provides consistent test data across all test suites
 */

import type { ADFNode } from "@features/jira/shared/parsers/adf.parser";
import type { Board } from "@features/jira/boards/models/board.models";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { IssueSearchResult } from "@features/jira/issues/models/issue-search.models";
import type { Sprint } from "@features/jira/sprints/models/sprint.models";
import type { User } from "@features/jira/users/models/user.models";

export interface ADFDocument extends ADFNode {
  version: number;
  type: "doc";
}

export interface MockProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  description?: string;
  lead?: User;
  projectCategory?: {
    id: string;
    name: string;
    description: string;
  };
  components?: Array<{
    id: string;
    name: string;
  }>;
  versions?: Array<{
    id: string;
    name: string;
    released: boolean;
    archived: boolean;
  }>;
  issueTypes?: Array<{
    id: string;
    name: string;
    subtask: boolean;
  }>;
}

export interface MockScenario {
  name: string;
  description: string;
  data: {
    issues?: Issue[];
    projects?: MockProject[];
    users?: User[];
    searchResults?: IssueSearchResult;
  };
}

export class JiraMockFactory {
  private static instance: JiraMockFactory;

  static getInstance(): JiraMockFactory {
    if (!JiraMockFactory.instance) {
      JiraMockFactory.instance = new JiraMockFactory();
    }
    return JiraMockFactory.instance;
  }

  // ADF Content Generation Utilities
  createADFParagraph(text: string): ADFNode {
    return {
      type: "paragraph",
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }

  createADFCodeBlock(language: string, code: string): ADFNode {
    return {
      type: "codeBlock",
      attrs: {
        language,
      },
      content: [
        {
          type: "text",
          text: code,
        },
      ],
    };
  }

  createADFList(items: string[], ordered = false): ADFNode {
    return {
      type: ordered ? "orderedList" : "bulletList",
      content: items.map((item) => ({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: item,
              },
            ],
          },
        ],
      })),
    };
  }

  createComplexADFDescription(): ADFDocument {
    return {
      version: 1,
      type: "doc",
      content: [
        this.createADFParagraph(
          "This is a comprehensive bug report with multiple formatting elements.",
        ),
        this.createADFCodeBlock(
          "javascript",
          `
function buggyFunction() {
  // This function has a memory leak
  let data = [];
  setInterval(() => {
    data.push(new Array(1000).fill('memory'));
  }, 100);
}
        `.trim(),
        ),
        this.createADFParagraph("Steps to reproduce:"),
        this.createADFList(
          [
            "Navigate to the dashboard",
            'Click on the "Generate Report" button',
            "Wait for 30 seconds",
            "Observe memory usage spike",
          ],
          true,
        ),
        this.createADFParagraph("Expected: Memory usage should remain stable"),
        this.createADFParagraph("Actual: Memory usage increases continuously"),
      ],
    };
  }

  // Mock Data Generators
  createMockUser(overrides: Partial<User> = {}): User {
    const defaults: User = {
      accountId: `user-${Math.random().toString(36).substr(2, 9)}`,
      displayName: "John Developer",
      emailAddress: "john.developer@company.com",
      avatarUrls: {
        "16x16": "https://avatar.atlassian.com/16x16.png",
        "24x24": "https://avatar.atlassian.com/24x24.png",
        "32x32": "https://avatar.atlassian.com/32x32.png",
        "48x48": "https://avatar.atlassian.com/48x48.png",
      },
    };
    return { ...defaults, ...overrides };
  }

  createMockProject(overrides: Partial<MockProject> = {}): MockProject {
    return {
      id: "10001",
      key: "TEST",
      name: "Test Project",
      projectTypeKey: "software",
      simplified: false,
      style: "classic",
      isPrivate: false,
      description: "A test project for development",
      lead: this.createMockUser({
        accountId: "lead-123",
        displayName: "Project Lead",
        emailAddress: "lead@company.com",
      }),
      projectCategory: {
        id: "10001",
        name: "Development",
        description: "Software development projects",
      },
      components: [
        { id: "10001", name: "Frontend" },
        { id: "10002", name: "Backend" },
      ],
      versions: [
        { id: "10001", name: "v1.0.0", released: true, archived: false },
        { id: "10002", name: "v1.1.0", released: false, archived: false },
      ],
      issueTypes: [
        { id: "10001", name: "Task", subtask: false },
        { id: "10002", name: "Bug", subtask: false },
        { id: "10003", name: "Sub-task", subtask: true },
      ],
      ...overrides,
    };
  }

  createMockBoard(overrides: Partial<Board> = {}): Board {
    const boardId = Math.floor(Math.random() * 1000) + 1;
    const defaults: Board = {
      id: boardId.toString(),
      self: `https://company.atlassian.net/rest/agile/1.0/board/${boardId}`,
      name: "Test Board",
      type: "scrum",
      location: {
        projectId: "10001",
        projectKey: "TEST",
        projectName: "Test Project",
        projectTypeKey: "software",
        displayName: "Test Project (TEST)",
      },
      canEdit: true,
      isPrivate: false,
      favourite: false,
    };
    return { ...defaults, ...overrides };
  }

  createMockSprint(overrides: Partial<Sprint> = {}): Sprint {
    const sprintId = Math.floor(Math.random() * 1000) + 1;
    const now = new Date();
    const startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 2 weeks ago
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

    const defaults: Sprint = {
      id: sprintId,
      self: `https://company.atlassian.net/rest/agile/1.0/sprint/${sprintId}`,
      state: "active",
      name: `Sprint ${sprintId}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdDate: new Date(
        startDate.getTime() - 24 * 60 * 60 * 1000,
      ).toISOString(), // 1 day before start
      originBoardId: 1,
      goal: "Complete user story implementation and bug fixes",
    };
    return { ...defaults, ...overrides };
  }

  createMockIssue(overrides: Partial<Issue> = {}): Issue {
    const issueId = `issue-${Math.random().toString(36).substr(2, 9)}`;
    const defaults: Issue = {
      id: issueId,
      key: `TEST-${Math.floor(Math.random() * 1000)}`,
      self: `https://company.atlassian.net/rest/api/3/issue/${issueId}`,
      fields: {
        summary: "Sample issue for testing",
        description: this.createComplexADFDescription(),
        status: {
          name: "To Do",
          statusCategory: {
            name: "To Do",
            colorName: "blue-gray",
          },
        },
        priority: {
          name: "Medium",
        },
        assignee: this.createMockUser({
          displayName: "Jane Assignee",
          emailAddress: "jane.assignee@company.com",
        }),
        reporter: this.createMockUser({
          displayName: "Bob Reporter",
          emailAddress: "bob.reporter@company.com",
        }),
        created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        labels: ["testing", "mock-data"],
      },
    };
    return { ...defaults, ...overrides };
  }

  createMockSearchResult(overrides: Partial<IssueSearchResult> = {}): IssueSearchResult {
    const issues = Array.from({ length: 5 }, () => this.createMockIssue());
    const defaults: IssueSearchResult = {
      startAt: 0,
      maxResults: 50,
      total: issues.length,
      issues,
    };
    return { ...defaults, ...overrides };
  }

  // Pre-configured Scenarios
  getScenario(name: string): MockScenario | undefined {
    const scenarios = this.getAllScenarios();
    return scenarios.find((scenario) => scenario.name === name);
  }

  getAllScenarios(): MockScenario[] {
    return [
      {
        name: "empty-project",
        description: "Empty project with no issues",
        data: {
          projects: [
            this.createMockProject({ name: "Empty Project", key: "EMPTY" }),
          ],
          issues: [],
          searchResults: this.createMockSearchResult({ issues: [], total: 0 }),
        },
      },
      {
        name: "single-bug",
        description: "Single critical bug issue",
        data: {
          issues: [
            this.createMockIssue({
              fields: {
                ...this.createMockIssue().fields,
                summary: "Critical memory leak in dashboard",
                priority: { name: "Critical" },
                status: {
                  name: "In Progress",
                  statusCategory: { name: "In Progress", colorName: "yellow" },
                },
              },
            }),
          ],
        },
      },
      {
        name: "mixed-issues",
        description: "Mix of different issue types and statuses",
        data: {
          issues: [
            this.createMockIssue({
              fields: {
                ...this.createMockIssue().fields,
                summary: "Add dark mode support",
                priority: { name: "Medium" },
              },
            }),
            this.createMockIssue({
              fields: {
                ...this.createMockIssue().fields,
                summary: "Fix login validation bug",
                priority: { name: "High" },
                status: {
                  name: "Done",
                  statusCategory: { name: "Done", colorName: "green" },
                },
              },
            }),
            this.createMockIssue({
              fields: {
                ...this.createMockIssue().fields,
                summary: "Research new authentication methods",
                priority: { name: "Low" },
              },
            }),
          ],
        },
      },
      {
        name: "large-result-set",
        description: "Large search result set for pagination testing",
        data: {
          searchResults: this.createMockSearchResult({
            startAt: 0,
            maxResults: 25,
            total: 150,
            issues: Array.from({ length: 25 }, (_, i) =>
              this.createMockIssue({
                key: `LARGE-${i + 1}`,
                fields: {
                  ...this.createMockIssue().fields,
                  summary: `Issue ${i + 1} - Testing pagination`,
                },
              }),
            ),
          }),
        },
      },
      {
        name: "complex-adf-content",
        description: "Issues with complex ADF descriptions for parser testing",
        data: {
          issues: [
            this.createMockIssue({
              fields: {
                ...this.createMockIssue().fields,
                summary: "Complex formatting issue",
                description: {
                  version: 1,
                  type: "doc",
                  content: [
                    this.createADFParagraph(
                      "This issue demonstrates complex ADF formatting.",
                    ),
                    this.createADFCodeBlock(
                      "typescript",
                      `
interface ComplexType {
  id: string;
  data: {
    nested: {
      values: Array<string | number>;
    };
  };
}
                    `.trim(),
                    ),
                    this.createADFList([
                      "First nested item",
                      "Second nested item with more detail",
                      "Third item with special characters: !@#$%^&*()",
                    ]),
                    this.createADFParagraph(
                      "Final paragraph with **bold** and *italic* text.",
                    ),
                  ],
                } as ADFDocument,
              },
            }),
          ],
        },
      },
    ];
  }

  // Quick access methods for common test patterns
  createEmptyResponse() {
    return this.getScenario("empty-project");
  }

  createSingleIssueResponse() {
    return this.getScenario("single-bug");
  }

  createMultipleIssuesResponse() {
    return this.getScenario("mixed-issues");
  }

  createLargeDatasetResponse() {
    return this.getScenario("large-result-set");
  }

  createComplexADFResponse() {
    return this.getScenario("complex-adf-content");
  }
}

export const mockFactory = JiraMockFactory.getInstance();
