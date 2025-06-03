import { describe, expect, test } from "bun:test";
import { normalizeError, toMcpError } from "../../../../core/errors/error.util";
import { McpError } from "../../../../core/errors/mcp.error";

describe("error.util", () => {
  describe("normalizeError", () => {
    test("should return message from Error instance", () => {
      const error = new Error("Test error message");
      const result = normalizeError(error);
      expect(result).toBe("Test error message");
    });

    test("should return message from custom Error subclass", () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      const error = new CustomError("Custom error message");
      const result = normalizeError(error);
      expect(result).toBe("Custom error message");
    });

    test("should return message from McpError instance", () => {
      const error = new McpError("MCP error message", "TEST_CODE");
      const result = normalizeError(error);
      expect(result).toBe("MCP error message");
    });

    test("should return string as-is", () => {
      const errorString = "Simple error string";
      const result = normalizeError(errorString);
      expect(result).toBe(errorString);
    });

    test("should return empty string as-is", () => {
      const result = normalizeError("");
      expect(result).toBe("");
    });

    test("should stringify simple object", () => {
      const errorObj = { message: "Error occurred", code: 500 };
      const result = normalizeError(errorObj);
      expect(result).toBe('{"message":"Error occurred","code":500}');
    });

    test("should stringify complex object", () => {
      const errorObj = {
        error: "Complex error",
        details: {
          nested: true,
          array: [1, 2, 3],
        },
        timestamp: "2023-01-01T00:00:00Z",
      };
      const result = normalizeError(errorObj);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(errorObj);
    });

    test("should handle object with null values", () => {
      const errorObj = { message: "Error", value: null };
      const result = normalizeError(errorObj);
      expect(result).toBe('{"message":"Error","value":null}');
    });

    test("should handle object with undefined values", () => {
      const errorObj = { message: "Error", value: undefined };
      const result = normalizeError(errorObj);
      expect(result).toBe('{"message":"Error"}');
    });

    test("should handle circular reference in object", () => {
      const errorObj: Record<string, unknown> = { message: "Error" };
      errorObj.self = errorObj; // Create circular reference

      const result = normalizeError(errorObj);
      expect(result).toBe("Unknown error object");
    });

    test("should handle object that throws during JSON.stringify", () => {
      const errorObj = {
        get message() {
          throw new Error("Cannot access message");
        },
      };

      const result = normalizeError(errorObj);
      expect(result).toBe("Unknown error object");
    });

    test("should convert number to string", () => {
      const result = normalizeError(42);
      expect(result).toBe("42");
    });

    test("should convert boolean to string", () => {
      expect(normalizeError(true)).toBe("true");
      expect(normalizeError(false)).toBe("false");
    });

    test("should handle null", () => {
      const result = normalizeError(null);
      expect(result).toBe("null");
    });

    test("should handle undefined", () => {
      const result = normalizeError(undefined);
      expect(result).toBe("undefined");
    });

    test("should handle symbol", () => {
      const sym = Symbol("test");
      const result = normalizeError(sym);
      expect(result).toBe("Symbol(test)");
    });

    test("should handle function", () => {
      const fn = function testFunction() {
        return "test";
      };
      const result = normalizeError(fn);
      expect(result).toContain("function testFunction");
    });

    test("should handle array", () => {
      const arr = [1, "two", { three: 3 }];
      const result = normalizeError(arr);
      expect(result).toBe('[1,"two",{"three":3}]');
    });

    test("should handle Date object", () => {
      const date = new Date("2023-01-01T00:00:00Z");
      const result = normalizeError(date);
      expect(result).toBe('"2023-01-01T00:00:00.000Z"');
    });

    test("should handle BigInt", () => {
      const bigInt = BigInt(123456789012345678901234567890n);
      const result = normalizeError(bigInt);
      expect(result).toBe("123456789012345678901234567890");
    });
  });

  describe("toMcpError", () => {
    test("should return McpError instance as-is", () => {
      const originalError = new McpError("Original message", "ORIGINAL_CODE", {
        test: "context",
      });
      const result = toMcpError(originalError);

      expect(result).toBe(originalError); // Same instance
      expect(result.message).toBe("Original message");
      expect(result.code).toBe("ORIGINAL_CODE");
      expect(result.context).toEqual({ test: "context" });
    });

    test("should convert Error instance to McpError", () => {
      const originalError = new Error("Standard error message");
      const result = toMcpError(originalError);

      expect(result).toBeInstanceOf(McpError);
      expect(result).not.toBe(originalError);
      expect(result.message).toBe("Standard error message");
      expect(result.code).toBe("MCP_ERROR");
      expect(result.context).toBeUndefined();
    });

    test("should convert custom Error subclass to McpError", () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      const originalError = new CustomError("Custom error message");
      const result = toMcpError(originalError);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("Custom error message");
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should convert string to McpError", () => {
      const errorString = "Simple error string";
      const result = toMcpError(errorString);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("Simple error string");
      expect(result.code).toBe("MCP_ERROR");
      expect(result.context).toBeUndefined();
    });

    test("should convert object to McpError", () => {
      const errorObj = { message: "Error occurred", code: 500 };
      const result = toMcpError(errorObj);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe('{"message":"Error occurred","code":500}');
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should convert null to McpError", () => {
      const result = toMcpError(null);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("null");
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should convert undefined to McpError", () => {
      const result = toMcpError(undefined);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("undefined");
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should convert number to McpError", () => {
      const result = toMcpError(42);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("42");
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should convert boolean to McpError", () => {
      const result = toMcpError(true);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("true");
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should handle circular reference objects", () => {
      const errorObj: Record<string, unknown> = { message: "Error" };
      errorObj.self = errorObj;

      const result = toMcpError(errorObj);

      expect(result).toBeInstanceOf(McpError);
      expect(result.message).toBe("Unknown error object");
      expect(result.code).toBe("MCP_ERROR");
    });

    test("should preserve stack trace from original Error", () => {
      const originalError = new Error("Original error");
      const result = toMcpError(originalError);

      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe("string");
    });

    test("should create new stack trace for non-Error inputs", () => {
      const result = toMcpError("String error");

      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe("string");
      expect(result.stack).toContain("String error");
    });
  });

  describe("integration tests", () => {
    test("should work together for error normalization pipeline", () => {
      const inputs = [
        new Error("Standard error"),
        new McpError("MCP error", "TEST_CODE"),
        "String error",
        { error: "Object error" },
        42,
        null,
        undefined,
      ];

      for (const input of inputs) {
        const normalized = normalizeError(input);
        const mcpError = toMcpError(input);

        expect(typeof normalized).toBe("string");
        expect(mcpError).toBeInstanceOf(McpError);
        expect(mcpError.message).toBe(normalized);
      }
    });

    test("should handle deeply nested error conversion", () => {
      const originalError = new Error("Deep error");
      const mcpError1 = toMcpError(originalError);
      const mcpError2 = toMcpError(mcpError1);

      expect(mcpError1).toBe(mcpError2); // Should return same instance
      expect(mcpError2.message).toBe("Deep error");
    });

    test("should handle error normalization edge cases", () => {
      const edgeCases: unknown[] = [
        "",
        "   ",
        "\n\t",
        "🚨 Unicode error",
        "Error with\nnewlines\tand\ttabs",
      ];

      for (const edgeCase of edgeCases) {
        const normalized = normalizeError(edgeCase);
        expect(typeof normalized).toBe("string");

        const mcpError = toMcpError(edgeCase);
        expect(mcpError).toBeInstanceOf(McpError);
        expect(mcpError.message).toBe(normalized);
      }
    });
  });
});
