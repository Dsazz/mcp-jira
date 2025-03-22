import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig } from './config';
import { registerFeatures } from './register';
import { setupErrorHandlers, setupSignalHandlers } from './handlers';
import { ServerCleanup } from './types';
import { logger } from '../shared/logging';
import { normalizeError } from '../shared/errors';

/**
 * Server context containing MCP server instance and related components
 */
export interface ServerContext {
  server: McpServer;
  transport: StdioServerTransport;
  cleanup: ServerCleanup;
}

/**
 * Creates an MCP server and transport with associated cleanup function
 */
export async function createServer(): Promise<ServerContext> {
  const server = new McpServer(serverConfig);
  const transport = new StdioServerTransport();
  let isCleaningUp = false;

  // Create cleanup function
  const cleanup: ServerCleanup = (exitCode = 0) => {
    // Prevent multiple cleanup calls
    if (isCleaningUp) {
      logger.debug('Cleanup already in progress, ignoring duplicate call', { prefix: 'Server' });
      return;
    }
    
    isCleaningUp = true;
    logger.info(`Shutting down MCP server (exit code: ${exitCode})...`, { prefix: 'Server' });
    
    try {
      // Close transport first
      if (transport) {
        logger.debug('Closing transport...', { prefix: 'Server' });
        transport.close();
        logger.debug('Transport closed successfully', { prefix: 'Server' });
      }
      
      // Then close server
      if (server) {
        logger.debug('Closing server...', { prefix: 'Server' });
        server.close();
        logger.debug('Server closed successfully', { prefix: 'Server' });
      }
      
      // Give a small delay to allow for resource cleanup
      setTimeout(() => {
        logger.info('Cleanup completed, exiting process', { prefix: 'Server' });
        process.exit(exitCode);
      }, 500);
    } catch (error) {
      logger.error(normalizeError(error), { 
        prefix: 'Server'
      });
      process.exit(exitCode);
    }
  };

  return { server, transport, cleanup };
}

/**
 * Initializes the MCP server with all required setup
 */
export async function initializeServer(): Promise<void> {
  logger.info('Starting MCP server initialization...', { prefix: 'Server' });

  // Create server and transport
  const context = await createServer();
  const { server, transport, cleanup } = context;

  // Log server configuration
  if (process.env.NODE_ENV === 'development') {
    logger.debug({
      ...serverConfig,
      JIRA_HOST: process.env.JIRA_HOST,
      JIRA_USERNAME: process.env.JIRA_USERNAME ? '(set)' : '(not set)',
      JIRA_API_TOKEN: process.env.JIRA_API_TOKEN ? '(set)' : '(not set)',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }, { prefix: 'Server Config' });
  }

  // Set up event handlers
  setupErrorHandlers(cleanup);
  setupSignalHandlers(cleanup);
  
  // Register features
  await registerFeatures(server);

  // Set up transport event handlers
  transport.onclose = () => {
    logger.info('Transport closed', { prefix: 'Server' });
    cleanup(0);
  };

  transport.onerror = (error: Error) => {
    logger.error(error, { prefix: 'Server' });
    cleanup(1);
  };

  // Connect server with transport
  await server.connect(transport);
  logger.info('MCP Server connected successfully', { prefix: 'Server' });

  // Keep the process running
  process.stdin.resume();
} 