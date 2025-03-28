#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
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
    build: "bun run build",
  },
  timeouts: {
    serverInitialize: 2000,
  },
};

/**
 * Simple logger
 */
const logger = {
  info: (message) => console.log(message),
  debug: (message, data = null) => {
    if (process.env.DEBUG) {
      console.log(message);
      if (data) console.log(data);
    }
  },
  error: (message, error = null) => {
    console.error(message);
    if (error?.stack) console.error(error.stack);
  },
  serverOutput: (data) => console.log(`[SERVER] ${data.toString().trim()}`),
};

/**
 * Load environment variables from .env file
 * @returns {Object} Environment variables
 */
function loadEnvVars() {
  if (!fs.existsSync(CONFIG.paths.envFile)) {
    logger.info("No .env file found, using current environment variables.");
    return {};
  }

  logger.info("Loading environment variables from .env file...");
  const result = dotenv.config();
  return result.error ? {} : { ...result.parsed };
}

/**
 * Kill any processes using our ports
 * @returns {Promise<void>}
 */
async function killPortProcesses() {
  const { client: clientPort, server: serverPort } = CONFIG.ports;
  const killCommand =
    process.platform === "win32"
      ? `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${clientPort}') do taskkill /F /PID %a`
      : `lsof -ti:${clientPort},${serverPort} | xargs kill -9 2>/dev/null || true`;

  const shell = process.platform === "win32" ? "cmd" : "sh";
  const shellFlag = process.platform === "win32" ? "/c" : "-c";

  return new Promise((resolve) => {
    const killProcess = spawn(shell, [shellFlag, killCommand]);
    killProcess.on("close", () => {
      logger.info(`Cleaned up ports ${clientPort} and ${serverPort}`);
      resolve();
    });
  });
}

/**
 * Ensure the dist directory exists, build if necessary
 * @returns {Promise<void>}
 */
async function ensureBuild() {
  const { dist, distIndex } = CONFIG.paths;

  if (!fs.existsSync(dist) || !fs.existsSync(distIndex)) {
    logger.info("Building project...");

    return new Promise((resolve, reject) => {
      const buildProcess = spawn("npm", ["run", "build"]);

      buildProcess.stdout.on("data", (data) =>
        logger.info(data.toString().trim())
      );
      buildProcess.stderr.on("data", (data) =>
        logger.error(data.toString().trim())
      );

      buildProcess.on("close", (code) => {
        if (code === 0) {
          logger.info("Build completed successfully");
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }
}

/**
 * Log JIRA configuration safely
 * @param {Object} env The environment object
 * @param {string} context Context for the log (server or inspector)
 */
function logJiraConfig(env, context = "environment") {
  const items = [
    `- JIRA_HOST: ${env.JIRA_HOST || "Not set"}`,
    `- JIRA_URL: ${env.JIRA_URL || "Not set"}`,
    `- JIRA_USERNAME: ${env.JIRA_USERNAME ? "(set)" : "Not set"}`,
    `- JIRA_API_TOKEN: ${env.JIRA_API_TOKEN ? "(set)" : "Not set"}`,
    `- JIRA_PROJECT_KEY: ${env.JIRA_PROJECT_KEY || "Not set"}`,
  ];

  logger.info(`${context} environment variables:`);
  for (const item of items) {
    logger.info(item);
  }
}

/**
 * Start the MCP server
 * @param {Object} envVars Environment variables
 * @returns {ChildProcess} Server process
 */
function startServer(envVars) {
  logger.info("Starting MCP server...");

  const serverEnv = {
    ...process.env,
    ...envVars,
    MCP_TRANSPORT: "stdio",
  };

  logJiraConfig(serverEnv, "Server");

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
}

/**
 * Start the inspector
 * @param {Object} envVars Environment variables
 * @returns {ChildProcess} Inspector process
 */
function startInspector(envVars) {
  logger.info("Starting MCP inspector...");

  const inspectorEnv = {
    ...process.env,
    ...envVars,
    NODE_OPTIONS: "--no-warnings",
    CLIENT_PORT: CONFIG.ports.client.toString(),
    SERVER_PORT: CONFIG.ports.server.toString(),
  };

  logJiraConfig(envVars, "Inspector");

  const inspectorPath = path.resolve(CONFIG.paths.inspectorBin);
  if (!fs.existsSync(inspectorPath)) {
    throw new Error(`Inspector binary not found at ${inspectorPath}`);
  }

  const inspectorArgs = ["--", "node", CONFIG.paths.distIndex];
  return spawn(inspectorPath, inspectorArgs, {
    env: inspectorEnv,
    stdio: "inherit",
  });
}

/**
 * Set up graceful process termination
 * @param {ChildProcess} server Server process
 * @param {ChildProcess} inspector Inspector process
 */
function setupCleanup(server, inspector) {
  const cleanup = () => {
    logger.info("Shutting down...");

    if (inspector)
      try {
        inspector.kill();
      } catch (_) {}
    if (server)
      try {
        server.kill();
      } catch (_) {}

    process.exit(0);
  };

  // Handle shutdown signals
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Handle process exits
  inspector.on("close", (code) => {
    logger.info(`Inspector exited with code ${code}`);
    if (server)
      try {
        server.kill();
      } catch (_) {}
    process.exit(code || 0);
  });

  server.on("close", (code) => {
    logger.info(`Server exited with code ${code}`);
    if (inspector)
      try {
        inspector.kill();
      } catch (_) {}
    process.exit(code || 0);
  });
}

/**
 * Main function
 */
async function main() {
  try {
    await killPortProcesses();
    await ensureBuild();

    const envVars = loadEnvVars();
    const server = startServer(envVars);

    // Give the server time to initialize
    logger.info("Waiting for server to initialize...");
    setTimeout(() => {
      try {
        const inspector = startInspector(envVars);
        setupCleanup(server, inspector);
      } catch (error) {
        logger.error(`Failed to start inspector: ${error.message}`, error);
        if (server) server.kill();
        process.exit(1);
      }
    }, CONFIG.timeouts.serverInitialize);
  } catch (error) {
    logger.error(`Error: ${error.message}`, error);
    process.exit(1);
  }
}

main();
