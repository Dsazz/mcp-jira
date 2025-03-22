#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

/**
 * Configuration
 */
const CONFIG = {
  ports: {
    client: process.env.CLIENT_PORT || 5175,
    server: process.env.SERVER_PORT || 3002,
  },
  paths: {
    dist: "./dist",
    distIndex: "./dist/index.js",
    envFile: ".env",
    inspectorBin: "./node_modules/.bin/mcp-inspector",
  },
  commands: {
    build: "npm run build",
  },
  timeouts: {
    serverInitialize: 2000,
  },
};

/**
 * Logger with optional verbosity levels
 */
const logger = {
  info: (message) => console.log(message),
  debug: (message, data = null) => {
    // Only log if DEBUG env var is set
    if (process.env.DEBUG) {
      console.log(message);
      if (data) console.log(data);
    }
  },
  error: (message, error = null) => {
    console.error(message);
    if (error && error.stack) console.error(error.stack);
  },
  envVarStatus: (name, value) => {
    return `- ${name}: ${value ? "(set)" : "Not set"}`;
  },
  maskedValue: (name, value) => {
    if (!value) return `- ${name}: Not set`;
    return `- ${name}: ${"*".repeat(10)}`;
  },
  serverOutput: (data) => console.log(`[SERVER] ${data.toString().trim()}`),
};

/**
 * Load environment variables from .env file
 * @returns {Object} Environment variables
 */
const loadEnvVars = () => {
  if (!fs.existsSync(CONFIG.paths.envFile)) {
    logger.info("No .env file found, using current environment variables.");
    return {};
  }

  logger.info("Loading environment variables from .env file using dotenv...");
  const result = dotenv.config();

  if (result.error) {
    logger.error(`Error loading .env file: ${result.error.message}`);
    return {};
  }

  // Log sensitive data safely
  if (process.env.JIRA_API_TOKEN) {
    logger.debug(
      `Found API token with length: ${process.env.JIRA_API_TOKEN.length}`
    );
  }

  return { ...result.parsed };
};

/**
 * Kill any processes using our ports
 * @returns {Promise<void>}
 */
const killPortProcesses = () => {
  return new Promise((resolve) => {
    const { client: clientPort, server: serverPort } = CONFIG.ports;

    const killCommand =
      process.platform === "win32"
        ? `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${clientPort}') do taskkill /F /PID %a`
        : `lsof -ti:${clientPort},${serverPort} | xargs kill -9 2>/dev/null || true`;

    const shell = process.platform === "win32" ? "cmd" : "sh";
    const shellFlag = process.platform === "win32" ? "/c" : "-c";

    const killProcess = spawn(shell, [shellFlag, killCommand]);

    killProcess.on("close", () => {
      logger.info(`Cleaned up ports ${clientPort} and ${serverPort}`);
      resolve();
    });
  });
};

/**
 * Ensure the dist directory exists, build if necessary
 * @returns {Promise<void>}
 */
const ensureBuild = () => {
  return new Promise((resolve, reject) => {
    const { dist, distIndex } = CONFIG.paths;

    if (!fs.existsSync(dist) || !fs.existsSync(distIndex)) {
      logger.info("Building project...");
      const buildProcess = spawn("npm", ["run", "build"]);

      buildProcess.stdout.on("data", (data) => {
        logger.info(data.toString().trim());
      });

      buildProcess.stderr.on("data", (data) => {
        logger.error(data.toString().trim());
      });

      buildProcess.on("close", (code) => {
        if (code === 0) {
          logger.info("Build completed successfully");
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    } else {
      resolve();
    }
  });
};

/**
 * Log JIRA environment variables safely
 * @param {Object} env The environment object
 * @param {string} context Context for the log (server or inspector)
 */
const logJiraConfig = (env, context = "environment") => {
  logger.info(`${context} environment variables:`);
  logger.info(`- JIRA_HOST: ${env.JIRA_HOST || "Not set"}`);
  logger.info(`- JIRA_URL: ${env.JIRA_URL || "Not set"}`);
  logger.info(logger.envVarStatus("JIRA_USERNAME", env.JIRA_USERNAME));
  logger.info(logger.envVarStatus("JIRA_API_TOKEN", env.JIRA_API_TOKEN));
  logger.info(`- JIRA_PROJECT_KEY: ${env.JIRA_PROJECT_KEY || "Not set"}`);

  // Only log sensitive configuration in a safer format
  if (context === "Using JIRA") {
    if (env.JIRA_HOST) logger.info(`- JIRA_HOST: ${env.JIRA_HOST}`);
    if (env.JIRA_USERNAME) logger.info(`- JIRA_USERNAME: ${env.JIRA_USERNAME}`);
    if (env.JIRA_API_TOKEN)
      logger.info(logger.maskedValue("JIRA_API_TOKEN", env.JIRA_API_TOKEN));
  }
};

/**
 * Start the MCP server
 * @param {Object} envVars Environment variables
 * @returns {ChildProcess} Server process
 */
const startServer = (envVars) => {
  logger.info("Starting MCP server...");

  // Create server environment by combining process.env with .env variables
  const serverEnv = {
    ...process.env,
    ...envVars,
    // Ensure the server uses stdio transport
    MCP_TRANSPORT: "stdio",
  };

  // Log JIRA config for debugging
  logJiraConfig(serverEnv, "Server");
  logJiraConfig(serverEnv, "Using JIRA");

  const server = spawn(
    "node",
    ["--enable-source-maps", CONFIG.paths.distIndex],
    {
      stdio: ["pipe", "pipe", "pipe"],
      env: serverEnv,
    }
  );

  server.stdout.on("data", logger.serverOutput);
  server.stderr.on("data", logger.serverOutput);

  return server;
};

/**
 * Start the inspector
 * @param {Object} envVars Environment variables
 * @returns {ChildProcess} Inspector process
 */
const startInspector = (envVars) => {
  logger.info("Starting MCP inspector...");

  // Configure the inspector environment
  const inspectorEnv = {
    ...process.env,
    ...envVars,
    NODE_OPTIONS: "--no-warnings",
    CLIENT_PORT: CONFIG.ports.client.toString(),
    SERVER_PORT: CONFIG.ports.server.toString(),
  };

  // Log JIRA config for debugging
  logJiraConfig(envVars, "Inspector");
  logger.info("Inspector environment configured");

  // Look for the inspector binary
  const inspectorPath = path.resolve(CONFIG.paths.inspectorBin);

  if (!fs.existsSync(inspectorPath)) {
    throw new Error(`Inspector binary not found at ${inspectorPath}`);
  }

  logger.info("Running inspector with inherited environment variables");

  // Simply run the inspector with the environment passed directly
  // The -- separator ensures arguments are passed to the server
  const inspectorArgs = ["--", "node", CONFIG.paths.distIndex];

  const inspector = spawn(inspectorPath, inspectorArgs, {
    env: inspectorEnv,
    stdio: "inherit",
  });

  return inspector;
};

/**
 * Set up graceful process termination
 * @param {ChildProcess} server Server process
 * @param {ChildProcess} inspector Inspector process
 */
const setupCleanup = (server, inspector) => {
  const cleanup = () => {
    logger.info("Shutting down...");

    const safeKill = (process) => {
      try {
        if (process) process.kill();
      } catch (e) {
        logger.debug("Error during process termination", e);
      }
    };

    safeKill(inspector);
    safeKill(server);
    process.exit(0);
  };

  // Handle graceful shutdown
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Handle process exits
  inspector.on("close", (code) => {
    logger.info(`Inspector exited with code ${code}`);
    safeKill(server);
    process.exit(code || 0);
  });

  server.on("close", (code) => {
    logger.info(`Server exited with code ${code}`);
    safeKill(inspector);
    process.exit(code || 0);
  });
};

/**
 * Main function
 */
async function main() {
  try {
    // Clean up ports
    await killPortProcesses();

    // Ensure build exists
    await ensureBuild();

    // Load environment variables from .env once
    const envVars = loadEnvVars();

    // Start server with environment variables
    const server = startServer(envVars);

    // Give the server some time to initialize
    logger.info("Waiting for server to initialize...");
    setTimeout(() => {
      try {
        const inspector = startInspector(envVars);

        // Set up proper cleanup on exit
        setupCleanup(server, inspector);
      } catch (error) {
        logger.error(`Failed to start inspector: ${error.message}`, error);
        server.kill();
        process.exit(1);
      }
    }, CONFIG.timeouts.serverInitialize);
  } catch (error) {
    logger.error(`Error: ${error.message}`, error);
    process.exit(1);
  }
}

main();
