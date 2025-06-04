/**
 * Issue Test Data Factory
 *
 * Implements the Hybrid Builder-Template System from creative phase design:
 * - Templates for common cases (80% use cases) - O(1) access time
 * - Builders for complex scenarios (20% use cases) - O(k) build time
 * - Full TypeScript inference and compile-time checking
 * - Performance target: <0.5ms per mock generation
 */

import type { Comment } from "@features/jira/issues/models/comment.models";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { ADFDocument } from "@features/jira/shared/parsers/adf.parser";
import type { User } from "@features/jira/users/models/user.models";

/**
 * Template-based mock data for common scenarios (80% use cases)
 * O(1) access time for fast test execution
 */
export const IssueTestTemplates = {
  /**
   * Valid issue template - most common test scenario
   */
  VALID_ISSUE: {
    id: "10001",
    key: "TEST-123",
    self: "https://test.atlassian.net/rest/api/3/issue/10001",
    fields: {
      summary: "Test Issue Summary",
      description: "Test issue description for validation testing",
      issuetype: {
        name: "Task",
        iconUrl:
          "https://test.atlassian.net/secure/viewavatar?size=medium&avatarId=10318&avatarType=issuetype",
      },
      status: {
        name: "To Do",
        statusCategory: {
          name: "To Do",
          colorName: "blue-gray",
        },
      },
      priority: {
        name: "Medium",
        iconUrl:
          "https://test.atlassian.net/images/icons/priorities/medium.svg",
      },
      assignee: {
        accountId: "123456:abcdef-test-user",
        displayName: "Test Assignee",
        emailAddress: "assignee@test.com",
        avatarUrls: {
          "16x16": "https://avatar.atlassian.com/16x16.png",
          "24x24": "https://avatar.atlassian.com/24x24.png",
          "32x32": "https://avatar.atlassian.com/32x32.png",
          "48x48": "https://avatar.atlassian.com/48x48.png",
        },
      },
      reporter: {
        accountId: "123456:abcdef-reporter",
        displayName: "Test Reporter",
        emailAddress: "reporter@test.com",
        avatarUrls: {
          "16x16": "https://avatar.atlassian.com/16x16.png",
          "24x24": "https://avatar.atlassian.com/24x24.png",
          "32x32": "https://avatar.atlassian.com/32x32.png",
          "48x48": "https://avatar.atlassian.com/48x48.png",
        },
      },
      created: "2023-01-01T10:00:00.000Z",
      updated: "2023-01-02T15:30:00.000Z",
      labels: ["testing", "validation"],
    },
  } as Issue,

  /**
   * Issue with null/undefined fields - common validation test scenario
   */
  ISSUE_WITH_NULL_FIELDS: {
    id: "10002",
    key: "TEST-124",
    self: "https://test.atlassian.net/rest/api/3/issue/10002",
    fields: {
      summary: null,
      description: null,
      issuetype: null,
      status: null,
      priority: null,
      assignee: null,
      reporter: null,
      created: null,
      updated: null,
      labels: null,
    },
  } as Issue,

  /**
   * Issue with missing fields - validation edge case
   */
  ISSUE_WITH_MISSING_FIELDS: {
    id: "10003",
    key: "TEST-125",
    self: "https://test.atlassian.net/rest/api/3/issue/10003",
    fields: null,
  } as Issue,

  /**
   * Issue with ADF description - complex content testing
   */
  get ISSUE_WITH_ADF_DESCRIPTION(): Issue {
    return {
      ...this.VALID_ISSUE,
      id: "10004",
      key: "TEST-126",
      fields: {
        ...this.VALID_ISSUE.fields,
        description: {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This is a test issue with ADF description content.",
                },
              ],
            },
            {
              type: "codeBlock",
              attrs: {
                language: "javascript",
              },
              content: [
                {
                  type: "text",
                  text: "console.log('Test code block');",
                },
              ],
            },
          ],
        } as ADFDocument,
      },
    };
  },

  /**
   * Issue with invalid key format - validation error testing
   */
  get ISSUE_WITH_INVALID_KEY(): Partial<Issue> {
    return {
      id: "10005",
      key: "invalid-key-format",
      self: "https://test.atlassian.net/rest/api/3/issue/10005",
      fields: this.VALID_ISSUE.fields,
    };
  },

  /**
   * Minimal valid issue - boundary testing
   */
  MINIMAL_VALID_ISSUE: {
    id: "10006",
    key: "TEST-127",
    self: "https://test.atlassian.net/rest/api/3/issue/10006",
    fields: {
      summary: "Minimal Issue",
    },
  } as Issue,

  /**
   * Valid comment template
   */
  VALID_COMMENT: {
    id: "10001",
    body: "This is a test comment for validation testing",
    author: {
      accountId: "123456:comment-author",
      displayName: "Comment Author",
      avatarUrls: {
        "16x16": "https://avatar.atlassian.com/16x16.png",
        "24x24": "https://avatar.atlassian.com/24x24.png",
        "32x32": "https://avatar.atlassian.com/32x32.png",
        "48x48": "https://avatar.atlassian.com/48x48.png",
      },
    },
    created: "2023-01-01T12:00:00.000Z",
    updated: "2023-01-01T12:00:00.000Z",
  } as Comment,

  /**
   * Valid user template
   */
  VALID_USER: {
    accountId: "123456:valid-user",
    displayName: "Valid Test User",
    emailAddress: "valid.user@test.com",
    avatarUrls: {
      "16x16": "https://avatar.atlassian.com/16x16.png",
      "24x24": "https://avatar.atlassian.com/24x24.png",
      "32x32": "https://avatar.atlassian.com/32x32.png",
      "48x48": "https://avatar.atlassian.com/48x48.png",
    },
  } as User,
} as const;

/**
 * Builder-based mock data for complex scenarios (20% use cases)
 * O(k) build time for flexible test construction
 */
export class IssueTestBuilder {
  private issue: Partial<Issue>;

  constructor(template?: Issue) {
    this.issue = template
      ? { ...template }
      : { ...IssueTestTemplates.VALID_ISSUE };
  }

  /**
   * Set issue ID
   */
  withId(id: string): IssueTestBuilder {
    this.issue.id = id;
    return this;
  }

  /**
   * Set issue key
   */
  withKey(key: string): IssueTestBuilder {
    this.issue.key = key;
    return this;
  }

  /**
   * Set issue summary
   */
  withSummary(summary: string | null): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.summary = summary;
    return this;
  }

  /**
   * Set issue description
   */
  withDescription(description: string | ADFDocument | null): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.description = description;
    return this;
  }

  /**
   * Set issue status
   */
  withStatus(statusName: string, colorName?: string): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.status = {
      name: statusName,
      statusCategory: {
        name: statusName,
        colorName: colorName || "blue-gray",
      },
    };
    return this;
  }

  /**
   * Set issue priority
   */
  withPriority(priorityName: string): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.priority = {
      name: priorityName,
      iconUrl: `https://test.atlassian.net/images/icons/priorities/${priorityName.toLowerCase()}.svg`,
    };
    return this;
  }

  /**
   * Set issue assignee
   */
  withAssignee(user: User | null): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.assignee = user;
    return this;
  }

  /**
   * Set issue reporter
   */
  withReporter(user: User): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.reporter = user;
    return this;
  }

  /**
   * Set issue labels
   */
  withLabels(labels: string[] | null): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.labels = labels;
    return this;
  }

  /**
   * Set issue dates
   */
  withDates(created: string, updated?: string): IssueTestBuilder {
    if (!this.issue.fields) {
      this.issue.fields = {};
    }
    this.issue.fields.created = created;
    this.issue.fields.updated = updated || created;
    return this;
  }

  /**
   * Set null fields for validation testing
   */
  withNullFields(): IssueTestBuilder {
    this.issue.fields = {
      summary: null,
      description: null,
      issuetype: null,
      status: null,
      priority: null,
      assignee: null,
      reporter: null,
      created: null,
      updated: null,
      labels: null,
    };
    return this;
  }

  /**
   * Remove fields entirely for validation testing
   */
  withoutFields(): IssueTestBuilder {
    this.issue.fields = null;
    return this;
  }

  /**
   * Set invalid key format for validation testing
   */
  withInvalidKey(invalidKey: string): IssueTestBuilder {
    this.issue.key = invalidKey;
    return this;
  }

  /**
   * Build the final issue object
   */
  build(): Issue {
    return this.issue as Issue;
  }
}

/**
 * Comment builder for complex comment scenarios
 */
export class CommentTestBuilder {
  private comment: Partial<Comment>;

  constructor(template?: Comment) {
    this.comment = template
      ? { ...template }
      : { ...IssueTestTemplates.VALID_COMMENT };
  }

  withId(id: string): CommentTestBuilder {
    this.comment.id = id;
    return this;
  }

  withBody(body: string): CommentTestBuilder {
    this.comment.body = body;
    return this;
  }

  withAuthor(author: User): CommentTestBuilder {
    this.comment.author = author;
    return this;
  }

  withDates(created: string, updated?: string): CommentTestBuilder {
    this.comment.created = created;
    this.comment.updated = updated || created;
    return this;
  }

  build(): Comment {
    return this.comment as Comment;
  }
}

/**
 * User builder for complex user scenarios
 */
export class UserTestBuilder {
  private user: Partial<User>;

  constructor(template?: User) {
    this.user = template
      ? { ...template }
      : { ...IssueTestTemplates.VALID_USER };
  }

  withAccountId(accountId: string): UserTestBuilder {
    this.user.accountId = accountId;
    return this;
  }

  withDisplayName(displayName: string): UserTestBuilder {
    this.user.displayName = displayName;
    return this;
  }

  withEmail(email: string): UserTestBuilder {
    this.user.emailAddress = email;
    return this;
  }

  withoutEmail(): UserTestBuilder {
    this.user.emailAddress = undefined;
    return this;
  }

  build(): User {
    return this.user as User;
  }
}

/**
 * Main factory implementing the hybrid system
 * Provides both template-based (fast) and builder-based (flexible) access
 */
export const IssueTestDataFactory = {
  /**
   * Template access for common scenarios (O(1) performance)
   */
  templates: IssueTestTemplates,

  /**
   * Create a new issue builder for complex scenarios
   */
  createIssueBuilder(template?: Issue): IssueTestBuilder {
    return new IssueTestBuilder(template);
  },

  /**
   * Create a new comment builder for complex scenarios
   */
  createCommentBuilder(template?: Comment): CommentTestBuilder {
    return new CommentTestBuilder(template);
  },

  /**
   * Create a new user builder for complex scenarios
   */
  createUserBuilder(template?: User): UserTestBuilder {
    return new UserTestBuilder(template);
  },

  /**
   * Quick access methods for common templates
   */
  validIssue(): Issue {
    return { ...IssueTestTemplates.VALID_ISSUE };
  },

  issueWithNullFields(): Issue {
    return { ...IssueTestTemplates.ISSUE_WITH_NULL_FIELDS };
  },

  issueWithMissingFields(): Issue {
    return { ...IssueTestTemplates.ISSUE_WITH_MISSING_FIELDS };
  },

  issueWithAdfDescription(): Issue {
    return { ...IssueTestTemplates.ISSUE_WITH_ADF_DESCRIPTION };
  },

  minimalValidIssue(): Issue {
    return { ...IssueTestTemplates.MINIMAL_VALID_ISSUE };
  },

  validComment(): Comment {
    return { ...IssueTestTemplates.VALID_COMMENT };
  },

  validUser(): User {
    return { ...IssueTestTemplates.VALID_USER };
  },

  /**
   * Generate multiple issues for list testing
   */
  generateIssueList(count: number, baseTemplate?: Issue): Issue[] {
    const template = baseTemplate || IssueTestTemplates.VALID_ISSUE;
    return Array.from({ length: count }, (_, index) => ({
      ...template,
      id: `${Number.parseInt(template.id) + index}`,
      key: `TEST-${123 + index}`,
    }));
  },

  /**
   * Generate multiple comments for list testing
   */
  generateCommentList(count: number, baseTemplate?: Comment): Comment[] {
    const template = baseTemplate || IssueTestTemplates.VALID_COMMENT;
    return Array.from({ length: count }, (_, index) => ({
      ...template,
      id: `${Number.parseInt(template.id) + index}`,
      body: `${template.body} - Comment ${index + 1}`,
    }));
  },
} as const;
