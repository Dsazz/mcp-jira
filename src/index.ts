#!/usr/bin/env node
/**
 * MCP Server Entry Point
 *
 * Main entry point for the MCP server application
 */
import { config } from "dotenv";
import { normalizeError } from "@core/errors";
import { logger } from "@core/logging";
import { startServer } from "@core/server";
import { registerFeatures } from "@features/index";

/**
 * Bootstrap the application
 * Configure environment and start the server
 */
async function bootstrap(): Promise<void> {
  try {
    // Load environment variables
    config();
    logger.info("Environment configured", { prefix: "Bootstrap" });

    // Start the MCP server with feature registration
    await startServer(registerFeatures);
  } catch (error) {
    // Basic error handling for bootstrap process
    logger.error(normalizeError(error), {
      prefix: "Bootstrap",
    });
    process.exit(1);
  }
}

// Start the application
bootstrap();
