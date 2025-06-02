import { logger } from "@core/logging";
/**
 * Server Handlers
 *
 * Error and signal handlers for the MCP server
 */
import { z } from "zod";

/**
 * Server cleanup function schema
 */
export const serverCleanupSchema = z
  .function()
  .args(z.number().optional())
  .returns(z.void());

/**
 * Server cleanup function type
 */
export type ServerCleanup = z.infer<typeof serverCleanupSchema>;

/**
 * Set up handlers for uncaught exceptions and unhandled rejections
 *
 * @param cleanup - Cleanup function to call on error
 */
export function setupErrorHandlers(cleanup: ServerCleanup): void {
  process.on("uncaughtException", (error) => {
    logger.error(`Uncaught exception: ${error.message}`, {
      prefix: "Server",
      stack: error.stack,
    });
    cleanup(1);
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error(`Unhandled rejection: ${error.message}`, {
      prefix: "Server",
      stack: error.stack,
    });
    cleanup(1);
  });

  logger.debug("Error handlers set up", { prefix: "Server" });
}

/**
 * Set up handlers for OS signals like SIGINT and SIGTERM
 *
 * @param cleanup - Cleanup function to call on signal
 */
export function setupSignalHandlers(cleanup: ServerCleanup): void {
  process.on("SIGINT", () => {
    logger.info("Received SIGINT signal", { prefix: "Server" });
    cleanup(0);
  });

  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM signal", { prefix: "Server" });
    cleanup(0);
  });

  // For Windows environments where SIGINT and SIGTERM may not work
  if (process.platform === "win32") {
    process.on("SIGHUP", () => {
      logger.info("Received SIGHUP signal", { prefix: "Server" });
      cleanup(0);
    });
  }

  logger.debug("Signal handlers set up", { prefix: "Server" });
}
