/**
 * Server Configuration
 *
 * MCP Server configuration settings
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { logger } from "../logging";

/**
 * Zod schema for server configuration
 */
export const serverConfigSchema = z
  .object({
    /**
     * Server name
     */
    name: z.string(),

    /**
     * Server version
     */
    version: z.string(),

    /**
     * Server description
     */
    description: z.string(),

    /**
     * Whether to use stdio transport
     */
    stdio: z.boolean(),

    /**
     * Additional properties that may be needed
     */
  })
  .catchall(z.unknown());

/**
 * Type for server configuration
 */
export type ServerConfig = z.infer<typeof serverConfigSchema>;

// Read package.json for metadata with proper path resolution
let packageJson = {
  name: "MCP Server",
  version: "1.0.0",
  description: "MCP Server",
};
try {
  // When bundled as a single file, use the current working directory
  const packagePath = join(process.cwd(), "package.json");

  try {
    const content = readFileSync(packagePath, "utf8");
    packageJson = JSON.parse(content);
    logger.debug(`Found package.json at: ${packagePath}`, { prefix: "Config" });
  } catch (readError) {
    logger.warn(`Could not read package.json at ${packagePath}: ${readError}`, {
      prefix: "Config",
    });
  }
} catch (error) {
  logger.error(`Failed to process package.json: ${error}`, {
    prefix: "Config",
  });
  // Continue with defaults
}

/**
 * MCP Server configuration
 */
export const serverConfig: ServerConfig = {
  name: process.env.SERVER_NAME || packageJson.name,
  version: process.env.SERVER_VERSION || packageJson.version,
  description: process.env.SERVER_DESCRIPTION || packageJson.description,
  stdio: process.env.MCP_TRANSPORT !== "http",
};
