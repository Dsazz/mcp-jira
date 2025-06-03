import { describe, expect, test } from "bun:test";
import { McpError } from "../../../../core/errors/mcp.error";
import { ValidationError } from "../../../../core/errors/validation.error";

describe("ValidationError", () => {
  describe("constructor", () => {
    test("should create error with message only", () => {
      const error = new ValidationError("Validation failed");

      expect(error.message).toBe("Validation failed");
      expect(error.name).toBe("ValidationError");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.context).toBeUndefined();
    });

    test("should create error with message and context", () => {
      const context = { field: "email", value: "invalid-email" };
      const error = new ValidationError("Invalid email format", context);

      expect(error.message).toBe("Invalid email format");
      expect(error.name).toBe("ValidationError");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.context).toEqual(context);
    });

    test("should create error with empty context", () => {
      const error = new ValidationError("Validation failed", {});

      expect(error.context).toEqual({});
    });

    test("should create error with complex context", () => {
      const context = {
        field: "user",
        errors: ["required", "minLength"],
        value: "",
        constraints: { minLength: 3, required: true },
      };
      const error = new ValidationError("User validation failed", context);

      expect(error.context).toEqual(context);
    });
  });

  describe("inheritance", () => {
    test("should be instance of Error", () => {
      const error = new ValidationError("Test error");
      expect(error).toBeInstanceOf(Error);
    });

    test("should be instance of McpError", () => {
      const error = new ValidationError("Test error");
      expect(error).toBeInstanceOf(McpError);
    });

    test("should be instance of ValidationError", () => {
      const error = new ValidationError("Test error");
      expect(error).toBeInstanceOf(ValidationError);
    });

    test("should have correct constructor name", () => {
      const error = new ValidationError("Test error");
      expect(error.constructor.name).toBe("ValidationError");
    });
  });

  describe("error properties", () => {
    test("should have correct error code", () => {
      const error = new ValidationError("Test error");
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    test("should have correct error name", () => {
      const error = new ValidationError("Test error");
      expect(error.name).toBe("ValidationError");
    });

    test("should have stack trace", () => {
      const error = new ValidationError("Test error");
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });

  describe("toJSON", () => {
    test("should serialize basic error to JSON", () => {
      const error = new ValidationError("Validation failed");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ValidationError",
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        context: undefined,
      });
    });

    test("should serialize error with context to JSON", () => {
      const context = { field: "email", value: "invalid" };
      const error = new ValidationError("Invalid email", context);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ValidationError",
        message: "Invalid email",
        code: "VALIDATION_ERROR",
        context: context,
      });
    });

    test("should be JSON.stringify compatible", () => {
      const context = { field: "password", errors: ["minLength", "required"] };
      const error = new ValidationError("Password validation failed", context);

      expect(() => JSON.stringify(error.toJSON())).not.toThrow();

      const serialized = JSON.stringify(error.toJSON());
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe("ValidationError");
      expect(parsed.code).toBe("VALIDATION_ERROR");
      expect(parsed.context).toEqual(context);
    });
  });

  describe("validation scenarios", () => {
    test("should handle field validation errors", () => {
      const context = {
        field: "username",
        value: "ab",
        constraint: "minLength",
        expected: 3,
        actual: 2,
      };
      const error = new ValidationError("Username too short", context);

      expect(error.message).toBe("Username too short");
      expect(error.context?.field).toBe("username");
      expect(error.context?.constraint).toBe("minLength");
    });

    test("should handle schema validation errors", () => {
      const context = {
        schema: "UserSchema",
        errors: [
          { field: "email", message: "Invalid format" },
          { field: "age", message: "Must be positive" },
        ],
      };
      const error = new ValidationError("Schema validation failed", context);

      expect(error.message).toBe("Schema validation failed");
      expect(error.context?.schema).toBe("UserSchema");
      expect(Array.isArray(error.context?.errors)).toBe(true);
    });

    test("should handle API parameter validation", () => {
      const context = {
        parameter: "pageSize",
        value: -1,
        constraint: "positive",
        location: "query",
      };
      const error = new ValidationError("Invalid page size", context);

      expect(error.context?.parameter).toBe("pageSize");
      expect(error.context?.location).toBe("query");
    });
  });

  describe("edge cases", () => {
    test("should handle empty message", () => {
      const error = new ValidationError("");
      expect(error.message).toBe("");
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    test("should handle very long messages", () => {
      const longMessage = `Validation error: ${"A".repeat(1000)}`;
      const error = new ValidationError(longMessage);
      expect(error.message).toBe(longMessage);
    });

    test("should handle special characters in message", () => {
      const specialMessage =
        "Validation failed: 🚨 Invalid data with\nnewlines";
      const error = new ValidationError(specialMessage);
      expect(error.message).toBe(specialMessage);
    });

    test("should handle null values in context", () => {
      const context = { field: "optional", value: null };
      const error = new ValidationError("Null value validation", context);
      expect(error.context?.value).toBeNull();
    });
  });
});
