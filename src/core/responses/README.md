# Response Module

This module provides standardized response handling throughout the application. It has two main components:

## 1. MCP Response System

The MCP response system provides a consistent structure for all MCP responses in the application.

### Key components:

- **McpResponse\<T\>**: Core response type with success/error status and optional data payload
- **createSuccessResponse()**: Creates a standardized success response
- **createErrorResponse()**: Creates a standardized error response

### Usage:

```typescript
import {
  type McpResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@core/responses";

// Creating a success response
function getData(): McpResponse<string> {
  try {
    // Implementation
    return createSuccessResponse("Success data");
  } catch (error) {
    return createErrorResponse(`Error: ${error.message}`);
  }
}
```

## 2. MCP Content System

The MCP content system handles the specific response format required by the Model Context Protocol.

### Key components:

- **McpContentResponse**: Response format expected by MCP Server
- **Content Types**: TextContent, ImageContent, ResourceContent
- **adaptToMcpContent()**: Converts McpResponse to content format
- **adaptHandler()**: Wraps handler functions to return MCP-compatible responses

### Usage:

```typescript
import { adaptHandler } from "@core/responses";
import { MyTool } from "./my-tool";

// Registering a tool with the MCP server
server.tool(
  "my_tool",
  "Tool description",
  {
    /* parameters */
  },
  adaptHandler(myTool.handler.bind(myTool))
);
```

## Architecture

- **mcp-response.types.ts**: Core MCP response types
- **mcp-response.util.ts**: Utilities for creating MCP responses
- **mcp-content.types.ts**: MCP-specific content types
- **mcp-adapter.util.ts**: Adapters for MCP protocol compatibility

This separation allows for clear distinction between general-purpose MCP responses and MCP-specific content handling.
