/**
 * Issue Params Validator Tests
 * Comprehensive test suite for issue parameter validation using Hybrid Testing Architecture
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { JiraApiError } from "@features/jira/client/errors";
import {
  type GetAssignedIssuesParams,
  type GetIssueParams,
  IssueParamsValidatorImpl,
  type JiraIssue,
  type JiraIssueList,
  getAssignedIssuesParamsSchema,
  getIssueParamsSchema,
  issueFieldsSchema,
  issueKeySchema,
} from "@features/jira/issues/validators/issue-params.validator";

describe("IssueParamsValidator", () => {
  let validator: IssueParamsValidatorImpl;

  beforeEach(() => {
    validator = new IssueParamsValidatorImpl();
  });

  describe("Zod Schema Validation", () => {
    describe("issueKeySchema", () => {
      it("should validate correct issue keys", () => {
        const validKeys = ["PROJ-123", "ABC-456", "TEST-1", "LONG-999999"];

        for (const key of validKeys) {
          const result = issueKeySchema.safeParse(key);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(key);
          }
        }
      });

      it("should reject invalid issue keys", () => {
        const invalidKeys = [
          "proj-123", // lowercase
          "PROJ123", // no hyphen
          "PROJ-", // no number
          "-123", // no project
          "PROJ-abc", // letters in number
          "", // empty
          "PROJ_123", // underscore instead of hyphen
          "123-PROJ", // reversed format
        ];

        for (const key of invalidKeys) {
          const result = issueKeySchema.safeParse(key);
          expect(result.success).toBe(false);
        }
      });
    });

    describe("getIssueParamsSchema", () => {
      it("should validate correct get issue parameters", () => {
        const validParams = {
          issueKey: "PROJ-123",
          fields: ["summary", "status"],
        };

        const result = getIssueParamsSchema.safeParse(validParams);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.issueKey).toBe("PROJ-123");
          expect(result.data.fields).toEqual(["summary", "status"]);
        }
      });

      it("should validate minimal get issue parameters", () => {
        const minimalParams = {
          issueKey: "TEST-456",
        };

        const result = getIssueParamsSchema.safeParse(minimalParams);
        expect(result.success).toBe(true);
      });

      it("should reject invalid issue key format", () => {
        const invalidParams = {
          issueKey: "invalid-key",
        };

        const result = getIssueParamsSchema.safeParse(invalidParams);
        expect(result.success).toBe(false);
      });

      it("should reject missing issue key", () => {
        const invalidParams = {
          fields: ["summary"],
        };

        const result = getIssueParamsSchema.safeParse(invalidParams);
        expect(result.success).toBe(false);
      });

      it("should validate fields array", () => {
        const validParams = {
          issueKey: "PROJ-123",
          fields: ["summary", "description", "status", "priority"],
        };

        const result = getIssueParamsSchema.safeParse(validParams);
        expect(result.success).toBe(true);
      });

      it("should allow empty fields array", () => {
        const validParams = {
          issueKey: "PROJ-123",
          fields: [],
        };

        const result = getIssueParamsSchema.safeParse(validParams);
        expect(result.success).toBe(true);
      });
    });

    describe("getAssignedIssuesParamsSchema", () => {
      it("should validate empty object", () => {
        const emptyParams = {};
        const result = getAssignedIssuesParamsSchema.safeParse(emptyParams);
        expect(result.success).toBe(true);
      });

      it("should reject non-object input", () => {
        const invalidInputs = ["string", 123, [], null, undefined];

        for (const input of invalidInputs) {
          const result = getAssignedIssuesParamsSchema.safeParse(input);
          expect(result.success).toBe(false);
        }
      });

      it("should allow additional properties", () => {
        const paramsWithExtra = {
          extraProperty: "value",
        };

        const result = getAssignedIssuesParamsSchema.safeParse(paramsWithExtra);
        expect(result.success).toBe(true);
      });
    });

    describe("issueFieldsSchema", () => {
      it("should validate complete issue structure", () => {
        const validIssue = {
          id: "123456",
          key: "PROJ-123",
          fields: {
            summary: "Test Issue",
            description: "Test description",
            status: {
              name: "Open",
            },
            priority: {
              name: "High",
            },
            updated: "2023-01-01T00:00:00.000Z",
          },
        };

        const result = issueFieldsSchema.safeParse(validIssue);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe("123456");
          expect(result.data.key).toBe("PROJ-123");
          expect(result.data.fields.summary).toBe("Test Issue");
        }
      });

      it("should validate minimal issue structure", () => {
        const minimalIssue = {
          id: "123456",
          key: "PROJ-123",
          fields: {},
        };

        const result = issueFieldsSchema.safeParse(minimalIssue);
        expect(result.success).toBe(true);
      });

      it("should validate issue with null description", () => {
        const issueWithNullDesc = {
          id: "123456",
          key: "PROJ-123",
          fields: {
            summary: "Test Issue",
            description: null,
          },
        };

        const result = issueFieldsSchema.safeParse(issueWithNullDesc);
        expect(result.success).toBe(true);
      });

      it("should reject invalid issue key in fields", () => {
        const invalidIssue = {
          id: "123456",
          key: "invalid-key",
          fields: {},
        };

        const result = issueFieldsSchema.safeParse(invalidIssue);
        expect(result.success).toBe(false);
      });

      it("should reject missing required fields", () => {
        const incompleteIssues = [
          { key: "PROJ-123", fields: {} }, // missing id
          { id: "123456", fields: {} }, // missing key
          { id: "123456", key: "PROJ-123" }, // missing fields
        ];

        for (const issue of incompleteIssues) {
          const result = issueFieldsSchema.safeParse(issue);
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe("Type Definitions", () => {
    it("should properly type GetIssueParams", () => {
      const params: GetIssueParams = {
        issueKey: "PROJ-123",
        fields: ["summary", "status"],
      };

      expect(params.issueKey).toBe("PROJ-123");
      expect(params.fields).toEqual(["summary", "status"]);
    });

    it("should properly type GetAssignedIssuesParams", () => {
      const params: GetAssignedIssuesParams = {};
      expect(typeof params).toBe("object");
    });

    it("should properly type JiraIssue", () => {
      const issue: JiraIssue = {
        id: "123456",
        key: "PROJ-123",
        fields: {
          summary: "Test Issue",
          description: "Test description",
          status: {
            name: "Open",
          },
          priority: {
            name: "High",
          },
          updated: "2023-01-01T00:00:00.000Z",
        },
      };

      expect(issue.id).toBe("123456");
      expect(issue.key).toBe("PROJ-123");
      expect(issue.fields.summary).toBe("Test Issue");
    });

    it("should properly type JiraIssueList", () => {
      const issues: JiraIssueList = [
        {
          id: "123456",
          key: "PROJ-123",
          fields: {},
        },
        {
          id: "789012",
          key: "PROJ-456",
          fields: {
            summary: "Another Issue",
          },
        },
      ];

      expect(issues).toHaveLength(2);
      expect(issues[0].id).toBe("123456");
      expect(issues[1].key).toBe("PROJ-456");
    });
  });

  describe("IssueParamsValidatorImpl Class Methods", () => {
    describe("validateGetIssueParams", () => {
      it("should validate correct get issue parameters", () => {
        const validParams: GetIssueParams = {
          issueKey: "PROJ-123",
          fields: ["summary", "status"],
        };

        const result = validator.validateGetIssueParams(validParams);
        expect(result.issueKey).toBe("PROJ-123");
        expect(result.fields).toEqual(["summary", "status"]);
      });

      it("should validate minimal parameters", () => {
        const minimalParams: GetIssueParams = {
          issueKey: "TEST-456",
        };

        const result = validator.validateGetIssueParams(minimalParams);
        expect(result.issueKey).toBe("TEST-456");
        expect(result.fields).toBeUndefined();
      });

      it("should throw JiraApiError for invalid issue key", () => {
        const invalidParams = {
          issueKey: "invalid-key",
        } as GetIssueParams;

        expect(() => validator.validateGetIssueParams(invalidParams)).toThrow(
          JiraApiError,
        );
      });

      it("should throw JiraApiError for non-array fields", () => {
        const invalidParams = {
          issueKey: "PROJ-123",
          fields: "not-an-array",
        } as unknown as GetIssueParams;

        expect(() => validator.validateGetIssueParams(invalidParams)).toThrow(
          JiraApiError,
        );
      });

      it("should validate empty fields array", () => {
        const validParams: GetIssueParams = {
          issueKey: "PROJ-123",
          fields: [],
        };

        const result = validator.validateGetIssueParams(validParams);
        expect(result.issueKey).toBe("PROJ-123");
        expect(result.fields).toEqual([]);
      });

      it("should validate various field names", () => {
        const validParams: GetIssueParams = {
          issueKey: "PROJ-123",
          fields: [
            "summary",
            "description",
            "status",
            "priority",
            "assignee",
            "reporter",
            "created",
            "updated",
            "labels",
            "components",
            "customfield_10001",
          ],
        };

        const result = validator.validateGetIssueParams(validParams);
        expect(result.fields).toHaveLength(11);
        expect(result.fields).toContain("customfield_10001");
      });
    });
  });

  describe("Error Handling", () => {
    it("should provide meaningful error messages for invalid issue keys", () => {
      const invalidParams = {
        issueKey: "invalid",
      } as GetIssueParams;

      try {
        validator.validateGetIssueParams(invalidParams);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(JiraApiError);
        expect((error as JiraApiError).message).toContain("Invalid issue key");
      }
    });

    it("should provide meaningful error messages for invalid fields", () => {
      const invalidParams = {
        issueKey: "PROJ-123",
        fields: "not-an-array",
      } as unknown as GetIssueParams;

      try {
        validator.validateGetIssueParams(invalidParams);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(JiraApiError);
        expect((error as JiraApiError).message).toContain(
          "Fields must be an array",
        );
      }
    });

    it("should set correct status codes for validation errors", () => {
      const invalidParams = {
        issueKey: "invalid",
      } as GetIssueParams;

      try {
        validator.validateGetIssueParams(invalidParams);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(JiraApiError);
        expect((error as JiraApiError).statusCode).toBe(400);
      }
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle malformed input gracefully", () => {
      const malformedInputs = [null, undefined, "string", 123, [], true];

      for (const input of malformedInputs) {
        expect(() => issueKeySchema.safeParse(input)).not.toThrow();
        expect(() => getIssueParamsSchema.safeParse(input)).not.toThrow();
        expect(() => issueFieldsSchema.safeParse(input)).not.toThrow();
      }
    });

    it("should handle very long issue keys", () => {
      const longKey = `${"A".repeat(100)}-123`;
      const result = issueKeySchema.safeParse(longKey);
      expect(result.success).toBe(true);
    });

    it("should handle very large field arrays", () => {
      const largeFieldArray = Array.from(
        { length: 1000 },
        (_, i) => `field${i}`,
      );
      const params = {
        issueKey: "PROJ-123",
        fields: largeFieldArray,
      };

      const result = getIssueParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in field names", () => {
      const specialFields = [
        "customfield_10001",
        "field-with-dashes",
        "field_with_underscores",
        "field.with.dots",
        "field with spaces",
        "field@with@symbols",
      ];

      const params = {
        issueKey: "PROJ-123",
        fields: specialFields,
      };

      const result = getIssueParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it("should handle circular references in validation", () => {
      const circularObject: Record<string, unknown> = {
        issueKey: "PROJ-123",
      };
      circularObject.circular = circularObject;

      expect(() =>
        getIssueParamsSchema.safeParse(circularObject),
      ).not.toThrow();
    });
  });
});
