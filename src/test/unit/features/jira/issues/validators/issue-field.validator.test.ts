/**
 * Issue Field Validator Tests
 * Comprehensive test suite for issue field validation using Hybrid Testing Architecture
 */

import { beforeEach, describe, expect, it } from "bun:test";
import type { Issue } from "@features/jira/issues/models/issue.models";
import {
  IssueFieldValidator,
  hasDateInfo,
  hasLabels,
  hasValidDescription,
  hasValidSelfUrl,
  isValidIssue,
  isValidIssueFields,
  issueDescriptionSchema,
  issueFieldsSchema,
  issueKeySchema,
  issueSchema,
  issueStatusSchema,
  issueTypeSchema,
  safeFieldValuesSchema,
  userSchema,
  validateIssue,
  validateIssueFields,
  validateSafeFieldValues,
} from "@features/jira/issues/validators/issue-field.validator";

describe("IssueFieldValidator", () => {
  let validator: IssueFieldValidator;

  beforeEach(() => {
    validator = new IssueFieldValidator();
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
        ];

        for (const key of invalidKeys) {
          const result = issueKeySchema.safeParse(key);
          expect(result.success).toBe(false);
        }
      });
    });

    describe("userSchema", () => {
      it("should validate complete user objects", () => {
        const validUser = {
          accountId: "user123",
          displayName: "John Doe",
          emailAddress: "john@example.com",
          avatarUrls: { "48x48": "https://example.com/avatar.png" },
        };

        const result = userSchema.safeParse(validUser);
        expect(result.success).toBe(true);
      });

      it("should validate partial user objects with only displayName", () => {
        const partialUser = {
          displayName: "Jane Doe",
        };

        const result = userSchema.safeParse(partialUser);
        expect(result.success).toBe(true);
      });

      it("should validate null and undefined users", () => {
        expect(userSchema.safeParse(null).success).toBe(true);
        expect(userSchema.safeParse(undefined).success).toBe(true);
      });

      it("should reject invalid email addresses", () => {
        const invalidUser = {
          emailAddress: "invalid-email",
        };

        const result = userSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });
    });

    describe("issueTypeSchema", () => {
      it("should validate complete issue type", () => {
        const validType = {
          name: "Bug",
          iconUrl: "https://example.com/bug.png",
        };

        const result = issueTypeSchema.safeParse(validType);
        expect(result.success).toBe(true);
      });

      it("should validate issue type with null name", () => {
        const typeWithNullName = {
          name: null,
          iconUrl: "https://example.com/icon.png",
        };

        const result = issueTypeSchema.safeParse(typeWithNullName);
        expect(result.success).toBe(true);
      });

      it("should validate null and undefined issue types", () => {
        expect(issueTypeSchema.safeParse(null).success).toBe(true);
        expect(issueTypeSchema.safeParse(undefined).success).toBe(true);
      });
    });

    describe("issueStatusSchema", () => {
      it("should validate complete status with category", () => {
        const validStatus = {
          name: "In Progress",
          statusCategory: {
            name: "In Progress",
            colorName: "yellow",
          },
        };

        const result = issueStatusSchema.safeParse(validStatus);
        expect(result.success).toBe(true);
      });

      it("should validate status without category", () => {
        const statusWithoutCategory = {
          name: "Done",
        };

        const result = issueStatusSchema.safeParse(statusWithoutCategory);
        expect(result.success).toBe(true);
      });

      it("should validate null status", () => {
        expect(issueStatusSchema.safeParse(null).success).toBe(true);
      });
    });

    describe("issueDescriptionSchema", () => {
      it("should validate ADF document description", () => {
        const adfDescription = {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Description" }],
            },
          ],
        };

        const result = issueDescriptionSchema.safeParse(adfDescription);
        expect(result.success).toBe(true);
      });

      it("should validate string description", () => {
        const stringDescription = "Simple text description";
        const result = issueDescriptionSchema.safeParse(stringDescription);
        expect(result.success).toBe(true);
      });

      it("should validate null description", () => {
        const result = issueDescriptionSchema.safeParse(null);
        expect(result.success).toBe(true);
      });
    });

    describe("issueFieldsSchema", () => {
      it("should validate complete issue fields", () => {
        const validFields = {
          summary: "Test issue",
          description: "Test description",
          issuetype: { name: "Bug" },
          status: { name: "Open" },
          priority: { name: "High" },
          assignee: { displayName: "John Doe" },
          reporter: { displayName: "Jane Doe" },
          created: "2023-01-01T00:00:00.000Z",
          updated: "2023-01-02T00:00:00.000Z",
          labels: ["urgent", "frontend"],
        };

        const result = issueFieldsSchema.safeParse(validFields);
        expect(result.success).toBe(true);
      });

      it("should validate minimal issue fields", () => {
        const minimalFields = {};
        const result = issueFieldsSchema.safeParse(minimalFields);
        expect(result.success).toBe(true);
      });

      it("should allow additional fields (passthrough)", () => {
        const fieldsWithExtra = {
          summary: "Test",
          customField: "custom value",
          anotherField: { nested: "object" },
        };

        const result = issueFieldsSchema.safeParse(fieldsWithExtra);
        expect(result.success).toBe(true);
      });
    });

    describe("issueSchema", () => {
      it("should validate complete issue", () => {
        const validIssue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com/issue/123",
          fields: {
            summary: "Test issue",
            issuetype: { name: "Bug" },
          },
        };

        const result = issueSchema.safeParse(validIssue);
        expect(result.success).toBe(true);
      });

      it("should validate issue without fields", () => {
        const issueWithoutFields = {
          id: "123",
          key: "PROJ-123",
          self: null,
        };

        const result = issueSchema.safeParse(issueWithoutFields);
        expect(result.success).toBe(true);
      });

      it("should reject issue with invalid key", () => {
        const invalidIssue = {
          id: "123",
          key: "invalid-key",
          self: "https://example.com",
        };

        const result = issueSchema.safeParse(invalidIssue);
        expect(result.success).toBe(false);
      });
    });

    describe("safeFieldValuesSchema", () => {
      it("should validate safe field values", () => {
        const safeValues = {
          key: "PROJ-123",
          summary: "Test summary",
          status: "Open",
          priority: "High",
          assignee: "John Doe",
        };

        const result = safeFieldValuesSchema.safeParse(safeValues);
        expect(result.success).toBe(true);
      });

      it("should reject incomplete safe field values", () => {
        const incompleteValues = {
          key: "PROJ-123",
          summary: "Test",
          // missing required fields
        };

        const result = safeFieldValuesSchema.safeParse(incompleteValues);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Validation Helper Functions", () => {
    describe("validateIssue", () => {
      it("should return success for valid issue", () => {
        const validIssue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
        };

        const result = validateIssue(validIssue);
        expect(result.success).toBe(true);
      });

      it("should return error for invalid issue", () => {
        const invalidIssue = {
          id: "123",
          // missing key
        };

        const result = validateIssue(invalidIssue);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe("validateIssueFields", () => {
      it("should validate issue fields", () => {
        const fields = { summary: "Test" };
        const result = validateIssueFields(fields);
        expect(result.success).toBe(true);
      });
    });

    describe("validateSafeFieldValues", () => {
      it("should validate complete safe values", () => {
        const safeValues = {
          key: "PROJ-123",
          summary: "Test",
          status: "Open",
          priority: "High",
          assignee: "John",
        };

        const result = validateSafeFieldValues(safeValues);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Type Guards", () => {
    describe("isValidIssue", () => {
      it("should return true for valid issue", () => {
        const validIssue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
        };

        expect(isValidIssue(validIssue)).toBe(true);
      });

      it("should return false for invalid issue", () => {
        const invalidIssue = { id: "123" };
        expect(isValidIssue(invalidIssue)).toBe(false);
      });
    });

    describe("isValidIssueFields", () => {
      it("should return true for valid fields", () => {
        const validFields = { summary: "Test" };
        expect(isValidIssueFields(validFields)).toBe(true);
      });

      it("should return false for invalid fields", () => {
        const invalidFields = "not an object";
        expect(isValidIssueFields(invalidFields)).toBe(false);
      });
    });
  });

  describe("IssueFieldValidator Class Methods", () => {
    describe("isValidIssue", () => {
      it("should validate correct issue structure", () => {
        const validIssue: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            summary: "Test issue",
          },
        };

        expect(validator.isValidIssue(validIssue)).toBe(true);
      });

      it("should reject invalid issue structure", () => {
        const invalidIssue = {
          id: "123",
          key: "invalid-key",
        } as Issue;

        expect(validator.isValidIssue(invalidIssue)).toBe(false);
      });
    });

    describe("hasEmptyFields", () => {
      it("should return false for issue with fields", () => {
        const issueWithFields: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: { summary: "Test" },
        };

        expect(validator.hasEmptyFields(issueWithFields)).toBe(false);
      });

      it("should return true for issue without fields", () => {
        const issueWithoutFields: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
        };

        expect(validator.hasEmptyFields(issueWithoutFields)).toBe(true);
      });

      it("should return true for invalid issue structure", () => {
        const invalidIssue = {
          id: "123",
          key: "invalid-key",
        } as Issue;

        expect(validator.hasEmptyFields(invalidIssue)).toBe(true);
      });
    });

    describe("hasValidDescription", () => {
      it("should return true for issue with ADF description", () => {
        const issueWithAdf: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            description: {
              version: 1,
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Description" }],
                },
              ],
            },
          },
        };

        expect(validator.hasValidDescription(issueWithAdf)).toBe(true);
      });

      it("should return true for issue with string description", () => {
        const issueWithString: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            description: "Simple description",
          },
        };

        expect(validator.hasValidDescription(issueWithString)).toBe(true);
      });

      it("should return false for issue without description", () => {
        const issueWithoutDesc: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {},
        };

        expect(validator.hasValidDescription(issueWithoutDesc)).toBe(false);
      });
    });

    describe("getSafeFieldValues", () => {
      it("should extract safe field values from valid issue", () => {
        const issue: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            summary: "Test Summary",
            status: { name: "Open" },
            priority: { name: "High" },
            assignee: { accountId: "123", displayName: "John Doe" },
          },
        };

        const safeValues = validator.getSafeFieldValues(issue);
        expect(safeValues.key).toBe("PROJ-123");
        expect(safeValues.summary).toBe("Test Summary");
        expect(safeValues.status).toBe("Open");
        expect(safeValues.priority).toBe("High");
        expect(safeValues.assignee).toBe("John Doe");
      });

      it("should provide fallback values for missing fields", () => {
        const issueWithMissingFields: Issue = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {},
        };

        const safeValues = validator.getSafeFieldValues(issueWithMissingFields);
        expect(safeValues.key).toBe("PROJ-123");
        expect(safeValues.summary).toBe("No Summary");
        expect(safeValues.status).toBe("Unknown");
        expect(safeValues.priority).toBe("None");
        expect(safeValues.assignee).toBe("Unassigned");
      });
    });
  });

  describe("Standalone Helper Functions", () => {
    describe("hasValidDescription", () => {
      it("should validate ADF description", () => {
        const issueWithAdf = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            description: {
              version: 1,
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Description" }],
                },
              ],
            },
          },
        };

        expect(hasValidDescription(issueWithAdf)).toBe(true);
      });

      it("should validate string description", () => {
        const issueWithString = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            description: "Text description",
          },
        };

        expect(hasValidDescription(issueWithString)).toBe(true);
      });

      it("should return false for empty description", () => {
        const issueWithoutDesc = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {},
        };

        expect(hasValidDescription(issueWithoutDesc)).toBe(false);
      });
    });

    describe("hasLabels", () => {
      it("should return true for issue with labels", () => {
        const issueWithLabels = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            labels: ["urgent", "frontend"],
          },
        };

        expect(hasLabels(issueWithLabels)).toBe(true);
      });

      it("should return false for issue without labels", () => {
        const issueWithoutLabels = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {},
        };

        expect(hasLabels(issueWithoutLabels)).toBe(false);
      });

      it("should return false for issue with empty labels array", () => {
        const issueWithEmptyLabels = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            labels: [],
          },
        };

        expect(hasLabels(issueWithEmptyLabels)).toBe(false);
      });
    });

    describe("hasDateInfo", () => {
      it("should return true for issue with date info", () => {
        const issueWithDates = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {
            created: "2023-01-01T00:00:00.000Z",
            updated: "2023-01-02T00:00:00.000Z",
          },
        };

        expect(hasDateInfo(issueWithDates)).toBe(true);
      });

      it("should return false for issue without date info", () => {
        const issueWithoutDates = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.com",
          fields: {},
        };

        expect(hasDateInfo(issueWithoutDates)).toBe(false);
      });
    });

    describe("hasValidSelfUrl", () => {
      it("should return true for issue with valid self URL", () => {
        const issueWithSelf = {
          id: "123",
          key: "PROJ-123",
          self: "https://example.atlassian.net/rest/api/3/issue/123",
        };

        expect(hasValidSelfUrl(issueWithSelf)).toBe(true);
      });

      it("should return false for issue without self URL", () => {
        const issueWithoutSelf = {
          id: "123",
          key: "PROJ-123",
        };
        expect(hasValidSelfUrl(issueWithoutSelf)).toBe(false);
      });

      it("should return false for issue with null self URL", () => {
        const issueWithNullSelf = {
          id: "123",
          key: "PROJ-123",
          self: null,
        };

        expect(hasValidSelfUrl(issueWithNullSelf)).toBe(false);
      });
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle malformed data gracefully", () => {
      const malformedData = {
        id: 123, // should be string
        key: null, // should be string
        fields: "not an object", // should be object
      };

      expect(isValidIssue(malformedData)).toBe(false);
      expect(validator.isValidIssue(malformedData as unknown as Issue)).toBe(
        false,
      );
    });

    it("should handle circular references", () => {
      const circularIssue: Record<string, unknown> = {
        id: "123",
        key: "PROJ-123",
        self: "https://example.com",
      };
      circularIssue.circular = circularIssue;

      // Should not throw error, just return false
      expect(() => isValidIssue(circularIssue)).not.toThrow();
    });

    it("should handle very large objects", () => {
      const largeIssue = {
        id: "123",
        key: "PROJ-123",
        self: "https://example.com",
        fields: {
          summary: "Test",
          // Add many custom fields
          ...Object.fromEntries(
            Array.from({ length: 1000 }, (_, i) => [
              `customField${i}`,
              `value${i}`,
            ]),
          ),
        },
      };

      expect(() => isValidIssue(largeIssue)).not.toThrow();
    });
  });
});
