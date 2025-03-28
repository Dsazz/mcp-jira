# Logging Module

This module provides a simple, flexible logging system for MCP applications.

## Basic Usage

```typescript
import { logger } from "@core/logging";

// Different log levels
logger.debug("Debug information");
logger.info("Informational message");
logger.warn("Warning message");
logger.error("Error message");

// With metadata
logger.info("User logged in", {
  prefix: "Auth", // Adds a prefix to the log: [Auth] User logged in
  userId: "123", // Additional metadata displayed in JSON format
  browser: "Chrome",
});
```

## Named Loggers

Create named loggers for different components:

```typescript
import { getLogger } from "@core/logging";

// Create a logger for a specific component
const dbLogger = getLogger("Database");
dbLogger.info("Connected to database"); // Output: [INFO][Database] Connected to database
```

## Log Levels

The module supports four log levels:

- `debug`: Detailed information for debugging
- `info`: General information about application progress
- `warn`: Warnings that don't prevent the application from working
- `error`: Error conditions that need attention

You can control which logs are displayed by setting the `LOG_LEVEL` environment variable:

```bash
# Only show warnings and errors
LOG_LEVEL=warn node app.js
```

By default, log level is `debug` in development and `info` in production.

## Architecture

The logging module is organized into these key components:

- **log.types.ts**: Core type definitions
- **logger.factory.ts**: Functions to create logger instances
- **simple-logger.ts**: Console logger implementation
- **log-level.util.ts**: Utilities for log level management
- **log-format.util.ts**: Message formatting utilities

This separation allows for potential future extensions such as adding different logger implementations (file logger, remote logger) while maintaining the same interface.
