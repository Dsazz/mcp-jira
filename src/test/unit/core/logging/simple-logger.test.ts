import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { LogMetadata } from "../../../../core/logging/log.types";
import { SimpleLogger } from "../../../../core/logging/simple-logger";

describe("SimpleLogger", () => {
  let logger: SimpleLogger;
  let consoleErrorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    logger = new SimpleLogger();
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("constructor", () => {
    test("should create logger with default name", () => {
      const defaultLogger = new SimpleLogger();
      defaultLogger.info("test message");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO][MCP]"),
      );
    });

    test("should create logger with custom name", () => {
      const customLogger = new SimpleLogger("CustomLogger");
      customLogger.info("test message");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO][CustomLogger]"),
      );
    });

    test("should handle empty string name", () => {
      const emptyNameLogger = new SimpleLogger("");
      emptyNameLogger.info("test message");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO][]"),
      );
    });
  });

  describe("debug logging", () => {
    test("should log debug message with correct format", () => {
      logger.debug("Debug message");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[DEBUG][MCP] Debug message",
      );
    });

    test("should log debug message with metadata", () => {
      const metadata: LogMetadata = { userId: "123", action: "test" };
      logger.debug("Debug with metadata", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG][MCP]"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Debug with metadata"),
      );
    });

    test("should handle non-string debug messages", () => {
      logger.debug(42);
      logger.debug({ key: "value" });
      logger.debug(null);
      logger.debug(undefined);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("info logging", () => {
    test("should log info message with correct format", () => {
      logger.info("Info message");

      expect(consoleErrorSpy).toHaveBeenCalledWith("[INFO][MCP] Info message");
    });

    test("should log info message with metadata", () => {
      const metadata: LogMetadata = { component: "test", version: "1.0" };
      logger.info("Info with metadata", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO][MCP]"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Info with metadata"),
      );
    });

    test("should handle complex info messages", () => {
      const complexMessage = {
        event: "user_login",
        timestamp: "2023-01-01T00:00:00Z",
        details: { userId: "123", ip: "192.168.1.1" },
      };
      logger.info(complexMessage);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("warn logging", () => {
    test("should log warn message with correct format", () => {
      logger.warn("Warning message");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[WARN][MCP] Warning message",
      );
    });

    test("should log warn message with metadata", () => {
      const metadata: LogMetadata = {
        prefix: "DEPRECATED",
        feature: "oldAPI",
        replacement: "newAPI",
      };
      logger.warn("Feature deprecated", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN][MCP]"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Feature deprecated"),
      );
    });

    test("should handle error objects in warn", () => {
      const error = new Error("Test error");
      logger.warn(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("error logging", () => {
    test("should log error message with correct format", () => {
      logger.error("Error message");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ERROR][MCP] Error message",
      );
    });

    test("should log error message with metadata", () => {
      const metadata: LogMetadata = {
        errorCode: "E001",
        stack: "Error stack trace",
        context: { operation: "database_query" },
      };
      logger.error("Database error occurred", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][MCP]"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Database error occurred"),
      );
    });

    test("should handle Error instances", () => {
      const error = new Error("Test error");
      logger.error(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("metadata handling", () => {
    test("should handle empty metadata", () => {
      logger.info("Message", {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO][MCP]"),
      );
    });

    test("should handle metadata with prefix", () => {
      const metadata: LogMetadata = { prefix: "API" };
      logger.info("Request processed", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO][MCP]"),
      );
    });

    test("should handle metadata with complex data", () => {
      const metadata: LogMetadata = {
        requestId: "req-123",
        duration: 150,
        success: true,
        data: {
          nested: { value: 42 },
          array: [1, 2, 3],
        },
      };
      logger.info("Complex metadata", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    test("should handle metadata with null and undefined values", () => {
      const metadata: LogMetadata = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
        zeroValue: 0,
      };
      logger.info("Null/undefined metadata", metadata);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("console output behavior", () => {
    test("should use console.error for all log levels", () => {
      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, "[DEBUG][MCP] debug");
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, "[INFO][MCP] info");
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, "[WARN][MCP] warn");
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(4, "[ERROR][MCP] error");
    });

    test("should format log messages consistently", () => {
      const testCases = [
        { level: "debug", message: "Debug test" },
        { level: "info", message: "Info test" },
        { level: "warn", message: "Warn test" },
        { level: "error", message: "Error test" },
      ];

      for (const testCase of testCases) {
        const method = testCase.level as keyof SimpleLogger;
        (logger[method] as (message: unknown) => void)(testCase.message);
      }

      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);

      for (let i = 0; i < testCases.length; i++) {
        const expectedFormat = `[${testCases[i].level.toUpperCase()}][MCP] ${testCases[i].message}`;
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(i + 1, expectedFormat);
      }
    });
  });

  describe("edge cases", () => {
    test("should handle very long messages", () => {
      const longMessage = "A".repeat(10000);
      logger.info(longMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(longMessage),
      );
    });

    test("should handle special characters in messages", () => {
      const specialMessage = "Message with 🚨 emoji and\nnewlines\ttabs";
      logger.info(specialMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(specialMessage),
      );
    });

    test("should handle functions in messages", () => {
      const functionMessage = () => "Function message";
      logger.info(functionMessage);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    test("should handle symbols in messages", () => {
      const symbolMessage = Symbol("test");
      logger.info(symbolMessage);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
