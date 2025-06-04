/**
 * Validation Test Data Factory
 *
 * Provides invalid data scenarios for testing validation logic
 * Focuses on edge cases, boundary conditions, and error scenarios
 */

import type { GetIssueCommentsParams } from "@features/jira/issues/validators/issue-comment.validator";
import type { GetIssueParams } from "@features/jira/issues/validators/issue-params.validator";

/**
 * Invalid issue key scenarios for testing validation
 */
export const InvalidIssueKeys = {
  /**
   * Missing project prefix
   */
  MISSING_PROJECT: "123",

  /**
   * Missing hyphen separator
   */
  MISSING_HYPHEN: "TEST123",

  /**
   * Missing issue number
   */
  MISSING_NUMBER: "TEST-",

  /**
   * Lowercase project key
   */
  LOWERCASE_PROJECT: "test-123",

  /**
   * Special characters in project key
   */
  SPECIAL_CHARS_PROJECT: "TE$T-123",

  /**
   * Non-numeric issue number
   */
  NON_NUMERIC_NUMBER: "TEST-abc",

  /**
   * Empty string
   */
  EMPTY_STRING: "",

  /**
   * Only whitespace
   */
  WHITESPACE_ONLY: "   ",

  /**
   * Multiple hyphens
   */
  MULTIPLE_HYPHENS: "TEST-SUB-123",

  /**
   * Leading/trailing spaces
   */
  WITH_SPACES: " TEST-123 ",

  /**
   * Unicode characters
   */
  UNICODE_CHARS: "TËST-123",

  /**
   * Very long project key
   */
  VERY_LONG_PROJECT: `${"A".repeat(100)}-123`,

  /**
   * Zero issue number
   */
  ZERO_NUMBER: "TEST-0",

  /**
   * Negative issue number
   */
  NEGATIVE_NUMBER: "TEST--123",
} as const;

/**
 * Invalid get issue parameters for testing
 */
export const InvalidGetIssueParams = {
  /**
   * Invalid issue key
   */
  INVALID_ISSUE_KEY: {
    issueKey: InvalidIssueKeys.MISSING_PROJECT,
    fields: ["summary", "status"],
  } as GetIssueParams,

  /**
   * Non-array fields parameter
   */
  NON_ARRAY_FIELDS: {
    issueKey: "TEST-123",
    fields: "summary,status" as unknown as string[],
  } as GetIssueParams,

  /**
   * Empty fields array
   */
  EMPTY_FIELDS_ARRAY: {
    issueKey: "TEST-123",
    fields: [],
  } as GetIssueParams,

  /**
   * Fields with invalid field names
   */
  INVALID_FIELD_NAMES: {
    issueKey: "TEST-123",
    fields: ["", null, undefined] as unknown as string[],
  } as GetIssueParams,

  /**
   * Missing required issueKey
   */
  MISSING_ISSUE_KEY: {
    fields: ["summary"],
  } as unknown as GetIssueParams,

  /**
   * Null issue key
   */
  NULL_ISSUE_KEY: {
    issueKey: null as unknown as string,
    fields: ["summary"],
  } as GetIssueParams,

  /**
   * Undefined issue key
   */
  UNDEFINED_ISSUE_KEY: {
    issueKey: undefined as unknown as string,
    fields: ["summary"],
  } as GetIssueParams,
} as const;

/**
 * Invalid get issue comments parameters for testing
 */
export const InvalidGetIssueCommentsParams = {
  /**
   * Invalid issue key
   */
  INVALID_ISSUE_KEY: {
    issueKey: InvalidIssueKeys.EMPTY_STRING,
    maxComments: 10,
  } as GetIssueCommentsParams,

  /**
   * Negative maxComments
   */
  NEGATIVE_MAX_COMMENTS: {
    issueKey: "TEST-123",
    maxComments: -5,
  } as GetIssueCommentsParams,

  /**
   * Zero maxComments
   */
  ZERO_MAX_COMMENTS: {
    issueKey: "TEST-123",
    maxComments: 0,
  } as GetIssueCommentsParams,

  /**
   * maxComments exceeds limit
   */
  EXCEEDS_MAX_COMMENTS: {
    issueKey: "TEST-123",
    maxComments: 150,
  } as GetIssueCommentsParams,

  /**
   * Non-integer maxComments
   */
  NON_INTEGER_MAX_COMMENTS: {
    issueKey: "TEST-123",
    maxComments: 10.5 as unknown as number,
  } as GetIssueCommentsParams,

  /**
   * Invalid orderBy value
   */
  INVALID_ORDER_BY: {
    issueKey: "TEST-123",
    orderBy: "invalid" as unknown as "created" | "updated",
  } as GetIssueCommentsParams,

  /**
   * Empty authorFilter
   */
  EMPTY_AUTHOR_FILTER: {
    issueKey: "TEST-123",
    authorFilter: "",
  } as GetIssueCommentsParams,

  /**
   * Invalid date format in dateRange
   */
  INVALID_DATE_FORMAT: {
    issueKey: "TEST-123",
    dateRange: {
      from: "invalid-date",
      to: "2023-12-31T23:59:59.000Z",
    },
  } as GetIssueCommentsParams,

  /**
   * Date range with 'from' after 'to'
   */
  INVALID_DATE_RANGE: {
    issueKey: "TEST-123",
    dateRange: {
      from: "2023-12-31T23:59:59.000Z",
      to: "2023-01-01T00:00:00.000Z",
    },
  } as GetIssueCommentsParams,

  /**
   * Missing required issueKey
   */
  MISSING_ISSUE_KEY: {
    maxComments: 10,
  } as unknown as GetIssueCommentsParams,
} as const;

/**
 * Invalid issue field data for testing field validation
 */
export const InvalidIssueFieldData = {
  /**
   * Issue with circular reference
   */
  CIRCULAR_REFERENCE: (() => {
    const obj: Record<string, unknown> = { id: "123", key: "TEST-123" };
    obj.self = obj; // Create circular reference
    return obj;
  })(),

  /**
   * Issue with extremely deep nesting
   */
  DEEP_NESTING: {
    id: "123",
    key: "TEST-123",
    fields: {
      customField: {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    level7: {
                      level8: {
                        level9: {
                          level10: "too deep",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  /**
   * Issue with invalid data types
   */
  INVALID_DATA_TYPES: {
    id: 123 as unknown as string, // Should be string
    key: ["TEST-123"] as unknown as string, // Should be string
    self: { url: "test" } as unknown as string, // Should be string
    fields: "invalid" as unknown as object, // Should be object
  },

  /**
   * Issue with extremely large strings
   */
  LARGE_STRINGS: {
    id: "123",
    key: "TEST-123",
    fields: {
      summary: "A".repeat(10000), // Extremely long summary
      description: "B".repeat(50000), // Extremely long description
    },
  },

  /**
   * Issue with special characters and encoding issues
   */
  SPECIAL_CHARACTERS: {
    id: "123",
    key: "TEST-123",
    fields: {
      summary: "Test with 🚀 emojis and \u0000 null chars",
      description: "Description with \x00\x01\x02 control chars",
    },
  },

  /**
   * Issue with malformed ADF content
   */
  MALFORMED_ADF: {
    id: "123",
    key: "TEST-123",
    fields: {
      description: {
        version: "invalid" as unknown as number, // Should be number
        type: "invalid-type", // Should be "doc"
        content: "not-an-array" as unknown as unknown[], // Should be array
      },
    },
  },

  /**
   * Issue with invalid user objects
   */
  INVALID_USER_OBJECTS: {
    id: "123",
    key: "TEST-123",
    fields: {
      assignee: {
        accountId: 123 as unknown as string, // Should be string
        displayName: null,
        emailAddress: "invalid-email", // Invalid email format
        avatarUrls: "not-an-object" as unknown as object, // Should be object
      },
      reporter: null, // Valid but edge case
    },
  },

  /**
   * Issue with invalid date formats
   */
  INVALID_DATES: {
    id: "123",
    key: "TEST-123",
    fields: {
      created: "not-a-date",
      updated: 1234567890 as unknown as string, // Should be string
    },
  },

  /**
   * Issue with invalid status/priority objects
   */
  INVALID_STATUS_PRIORITY: {
    id: "123",
    key: "TEST-123",
    fields: {
      status: {
        name: 123 as unknown as string, // Should be string
        statusCategory: "invalid" as unknown as object, // Should be object
      },
      priority: {
        name: null,
        iconUrl: ["not", "a", "string"] as unknown as string, // Should be string
      },
    },
  },
} as const;

/**
 * Factory for creating various invalid data scenarios
 */
export const ValidationTestDataFactory = {
  /**
   * Get all invalid issue key scenarios
   */
  getAllInvalidIssueKeys(): string[] {
    return Object.values(InvalidIssueKeys);
  },

  /**
   * Get all invalid get issue params scenarios
   */
  getAllInvalidGetIssueParams(): GetIssueParams[] {
    return Object.values(InvalidGetIssueParams);
  },

  /**
   * Get all invalid get issue comments params scenarios
   */
  getAllInvalidGetIssueCommentsParams(): GetIssueCommentsParams[] {
    return Object.values(InvalidGetIssueCommentsParams);
  },

  /**
   * Get all invalid issue field data scenarios
   */
  getAllInvalidIssueFieldData(): Record<string, unknown>[] {
    return Object.values(InvalidIssueFieldData);
  },

  /**
   * Create a custom invalid issue key
   */
  createInvalidIssueKey(pattern: string): string {
    return pattern;
  },

  /**
   * Create invalid params with specific field
   */
  createInvalidGetIssueParams(
    overrides: Partial<GetIssueParams>,
  ): GetIssueParams {
    return {
      issueKey: InvalidIssueKeys.MISSING_PROJECT,
      ...overrides,
    };
  },

  /**
   * Create invalid comment params with specific field
   */
  createInvalidGetIssueCommentsParams(
    overrides: Partial<GetIssueCommentsParams>,
  ): GetIssueCommentsParams {
    return {
      issueKey: InvalidIssueKeys.EMPTY_STRING,
      maxComments: -1,
      includeInternal: false,
      orderBy: "created" as const,
      ...overrides,
    };
  },

  /**
   * Generate boundary value test cases for numeric fields
   */
  getBoundaryValueTestCases() {
    return {
      maxComments: [
        -1, // Below minimum
        0, // At minimum boundary
        1, // Valid minimum
        100, // Valid maximum
        101, // Above maximum
        Number.MAX_SAFE_INTEGER, // Extreme value
        Number.MIN_SAFE_INTEGER, // Extreme negative
        Number.POSITIVE_INFINITY, // Infinity
        Number.NEGATIVE_INFINITY, // Negative infinity
        Number.NaN, // Not a number
      ],
    };
  },

  /**
   * Generate string length test cases
   */
  getStringLengthTestCases() {
    return {
      empty: "",
      single: "a",
      normal: "TEST-123",
      long: "A".repeat(1000),
      veryLong: "B".repeat(10000),
      extremelyLong: "C".repeat(100000),
    };
  },

  /**
   * Generate special character test cases
   */
  getSpecialCharacterTestCases() {
    return {
      nullChar: "\u0000",
      controlChars: "\x00\x01\x02\x03",
      unicode: "🚀🎉💻",
      emojis: "😀😃😄😁",
      rtlText: "مرحبا بالعالم",
      mixedScript: "Hello世界🌍",
      sqlInjection: "'; DROP TABLE issues; --",
      xssAttempt: "<script>alert('xss')</script>",
      pathTraversal: "../../../etc/passwd",
    };
  },
} as const;
