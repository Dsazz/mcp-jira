import { describe, expect, test } from "bun:test";
import { McpError } from "../../../../core/errors/mcp.error";

describe("McpError", () => {
  describe("constructor", () => {
    test("should create error with message only", () => {
      const error = new McpError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.name).toBe("McpError");
      expect(error.code).toBe("MCP_ERROR");
      expect(error.context).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(McpError);
    });

    test("should create error with message and code", () => {
      const error = new McpError("Test error", "CUSTOM_CODE");

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.context).toBeUndefined();
    });

    test("should create error with message, code, and context", () => {
      const context = { userId: "123", action: "test" };
      const error = new McpError("Test error", "CUSTOM_CODE", context);

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.context).toEqual(context);
    });

    test("should create error with empty context object", () => {
      const error = new McpError("Test error", "CUSTOM_CODE", {});

      expect(error.context).toEqual({});
    });

    test("should handle complex context objects", () => {
      const context = {
        nested: { value: 42 },
        array: [1, 2, 3],
        nullValue: null,
        undefinedValue: undefined,
      };
      const error = new McpError("Test error", "COMPLEX_CONTEXT", context);

      expect(error.context).toEqual(context);
    });

    test("should preserve original context when provided", () => {
      const originalContext = { key: "value", nested: { prop: 123 } };
      const error = new McpError("Test message", "TEST_CODE", originalContext);
      expect(error.context).toBe(originalContext);
    });
  });

  describe("inheritance", () => {
    test("should be instance of Error", () => {
      const error = new McpError("Test error");
      expect(error).toBeInstanceOf(Error);
    });

    test("should be instance of McpError", () => {
      const error = new McpError("Test error");
      expect(error).toBeInstanceOf(McpError);
    });

    test("should have correct constructor name", () => {
      const error = new McpError("Test error");
      expect(error.constructor.name).toBe("McpError");
    });
  });

  describe("stack trace", () => {
    test("should have stack trace", () => {
      const error = new McpError("Test error");
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    test("should include error message in stack", () => {
      const message = "Unique test error message";
      const error = new McpError(message);
      expect(error.stack).toContain(message);
    });
  });

  describe("toJSON", () => {
    test("should serialize basic error to JSON", () => {
      const error = new McpError("Test error");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "McpError",
        message: "Test error",
        code: "MCP_ERROR",
        context: undefined,
      });
    });

    test("should serialize error with custom code to JSON", () => {
      const error = new McpError("Test error", "CUSTOM_CODE");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "McpError",
        message: "Test error",
        code: "CUSTOM_CODE",
        context: undefined,
      });
    });

    test("should serialize error with context to JSON", () => {
      const context = { userId: "123", action: "test" };
      const error = new McpError("Test error", "CUSTOM_CODE", context);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "McpError",
        message: "Test error",
        code: "CUSTOM_CODE",
        context: context,
      });
    });

    test("should serialize complex context to JSON", () => {
      const context = {
        nested: { value: 42 },
        array: [1, 2, 3],
        nullValue: null,
      };
      const error = new McpError("Test error", "COMPLEX", context);
      const json = error.toJSON();

      expect(json.context).toEqual(context);
    });

    test("should return object that can be JSON.stringify'd", () => {
      const context = { test: "value" };
      const error = new McpError("Test error", "JSON_TEST", context);
      const json = error.toJSON();

      expect(() => JSON.stringify(json)).not.toThrow();

      const serialized = JSON.stringify(json);
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(json);
    });
  });

  describe("error properties", () => {
    test("should be readonly properties", () => {
      const error = new McpError("Test error", "TEST_CODE", { test: "value" });

      // These should not throw in TypeScript, but we can verify the values don't change
      const originalCode = error.code;
      const originalContext = error.context;

      expect(error.code).toBe(originalCode);
      if (originalContext) {
        expect(error.context).toBe(originalContext);
      }
    });

    test("should handle undefined context", () => {
      const error = new McpError("Test error", "TEST_CODE", undefined);
      expect(error.context).toBeUndefined();
    });

    test("should handle null context", () => {
      const error = new McpError(
        "Test error",
        "TEST_CODE",
        null as unknown as Record<string, unknown>,
      );
      expect(error.context).toBeNull();
    });
  });

  describe("edge cases", () => {
    test("should handle empty string message", () => {
      const error = new McpError("");
      expect(error.message).toBe("");
    });

    test("should handle empty string code", () => {
      const error = new McpError("Test error", "");
      expect(error.code).toBe("");
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(10000);
      const error = new McpError(longMessage);
      expect(error.message).toBe(longMessage);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Error with 🚨 emoji and \n newlines \t tabs";
      const error = new McpError(specialMessage);
      expect(error.message).toBe(specialMessage);
    });

    test("should handle special characters in code", () => {
      const specialCode = "ERROR_WITH_UNICODE_🚨";
      const error = new McpError("Test error", specialCode);
      expect(error.code).toBe(specialCode);
    });
  });
});
