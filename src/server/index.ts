import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig } from './config';
import { registerFeatures } from './features/register';
import { setupErrorHandlers } from './utils/error-handler';
import { setupSignalHandlers } from './utils/signal-handler';
import { ServerCleanup } from './types';
import { logger } from '../shared';

interface ServerContext {
  server: McpServer;
  transport: StdioServerTransport;
  cleanup: ServerCleanup;
}

/**
 * Creates and initializes the MCP server and transport
 */
async function createServer(): Promise<ServerContext> {
  const server = new McpServer(serverConfig);
  const transport = new StdioServerTransport();

  // Create cleanup function
  const cleanup: ServerCleanup = (exitCode = 0) => {
    logger.info(`Shutting down MCP server (exit code: ${exitCode})...`, { prefix: 'Server', isMcp: true });
    try {
      transport.close();
      server.close();
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), { 
        prefix: 'Server', 
        isMcp: true 
      });
    }
    process.exit(exitCode);
  };

  return { server, transport, cleanup };
}

/**
 * Sets up transport event handlers
 */
function setupTransportEvents(context: ServerContext): void {
  const { transport, cleanup } = context;

  transport.onclose = () => {
    logger.info('Transport closed', { prefix: 'Server', isMcp: true });
    cleanup(0);
  };

  transport.onerror = (error: Error) => {
    logger.error(error, { prefix: 'Server', isMcp: true });
    cleanup(1);
  };
}

/**
 * Logs server configuration in development mode
 */
function logServerConfig(): void {
  if (process.env.NODE_ENV === 'development') {
    logger.debug({
      ...serverConfig,
      JIRA_HOST: process.env.JIRA_HOST,
      JIRA_USERNAME: process.env.JIRA_USERNAME ? '(set)' : '(not set)',
      JIRA_API_TOKEN: process.env.JIRA_API_TOKEN ? '(set)' : '(not set)',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }, { prefix: 'Server Config', isMcp: true });
  }
}

/**
 * Initializes the server with all required setup
 */
async function initializeServer(): Promise<void> {
  logger.info('Starting MCP server initialization...', { prefix: 'Server', isMcp: true });

  // Create server and transport
  const context = await createServer();
  const { server, cleanup } = context;

  // Log server configuration
  logServerConfig();

  // Set up handlers
  setupErrorHandlers(cleanup);
  setupSignalHandlers(cleanup);
  setupTransportEvents(context);

  // Register features
  await registerFeatures(server);

  // Connect server with transport
  await server.connect(context.transport);
  logger.info('MCP Server connected successfully', { prefix: 'Server', isMcp: true });

  // Keep the process running
  process.stdin.resume();
}

/**
 * Starts the MCP server
 */
export async function startServer(): Promise<void> {
  try {
    await initializeServer();
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), { 
      prefix: 'Server', 
      isMcp: true 
    });
    throw error;
  }
} 