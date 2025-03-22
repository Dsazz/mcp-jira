# JIRA MCP Server for Cursor

A Model Context Protocol (MCP) server that provides JIRA integration tools for Cursor IDE.

## Features

- **Jira Tools**:
  - Get assigned issues
  - Get specific issue details
  - Create tasks from Jira issues
- **System Time Tools**:
  - Get current system time

## Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/jira-mcp.git
cd jira-mcp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your JIRA credentials
```

### Configuration

Create a `.env` file with the following variables:

```
JIRA_HOST=https://your-instance.atlassian.net
JIRA_USERNAME=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token-here
```

#### Important note about JIRA API tokens

JIRA API tokens can be quite long and may contain special characters, including the `=` sign at the end. Our setup uses `dotenv` to correctly parse the `.env` file and ensures that these tokens are properly passed to both the MCP server and the inspector.

If you're having issues with authentication:

1. Make sure your token is on a single line in the `.env` file
2. Do not add quotes around the token value
3. The token should be pasted exactly as provided by Atlassian

## Using the MCP Inspector

The MCP Inspector is a developer tool for testing and debugging MCP servers. This project includes custom configurations for running the inspector with our JIRA MCP server.

### Using the Custom Inspector Script

We've created a custom inspector script that handles port management and server initialization:

```bash
# Run the inspector (no separate build step needed)
npm run inspect
```

The inspector will:

1. Automatically load all environment variables from your `.env` file
2. Clean up any processes using the required ports (5175 and 3002)
3. Build the project automatically if needed
4. Start the MCP server with the loaded environment variables
5. Start the inspector connected to your server

The inspector will be available at http://localhost:5175?proxyPort=3002

If you encounter port conflicts, you can manually clean up the ports:

```bash
npm run cleanup-ports
```

### Debugging with the Inspector

1. Start the inspector using one of the methods above
2. Open the inspector UI in your browser
3. Use the UI to:
   - View MCP server capabilities
   - Call tools and see their results
   - View the JSON communication between client and server
   - Test different input parameters

For more detailed information, visit the [MCP Inspector GitHub repository](https://github.com/modelcontextprotocol/inspector).

## Integration with Claude Desktop for debugging our MCP

You can use Claude Desktop to debug MCP tool execution by connecting to your local MCP server:

1. First, build and run your MCP server:

   ```bash
   npm run build
   node dist/index.js
   ```

2. Configure Claude Desktop by editing its configuration file directly:

   ```bash
   # Open the configuration file in your editor
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. Add or update the MCP configuration in the file:

   ```json
   {
     "mcpServers": {
       "JIRA Tools": {
         "command": "node",
         "args": ["/absolute/path/to/your/project/dist/index.js"],
         "env": {
           "JIRA_USERNAME": "your-jira-username",
           "JIRA_API_TOKEN": "your-jira-api-token",
           "JIRA_HOST": "your-jira-host.atlassian.net"
         }
       }
     }
   }
   ```

4. Save the file and restart Claude Desktop.

5. Claude will now have access to your MCP tools. Test them with queries like:
   ```
   What time is it right now?
   ```
   or
   ```
   Show me my assigned JIRA issues.
   ```

This configuration allows you to test your MCP functionality directly in Claude Desktop while developing.

## Integration with Cursor IDE

Add this MCP server to your Cursor IDE's MCP configuration:

```json
{
  "mcpServers": {
    "JIRA Tools": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/dist/index.js"],
      "env": {
        "JIRA_USERNAME": "your-jira-username",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "JIRA_HOST": "your-jira-host.atlassian.net"
      }
    }
  }
}
```

## MCP Tools

### Jira Tools

#### Get Assigned Issues

- **Tool Name**: `jira_get_assigned_issues`
- **Parameters**: No params
- **Returns**: Markdown-formatted list of assigned Jira issues

#### Get Issue

- **Tool Name**: `jira_get_issue`
- **Parameters**:
  - `issueKey`: The Jira issue key (e.g., PD-312)
- **Returns**: Markdown-formatted details of the specified issue

#### Create Task from Issue

- **Tool Name**: `jira_create_task`
- **Parameters**:
  - `issueKey`: The Jira issue key (e.g., PD-312)
- **Returns**: Markdown-formatted task created from the issue

### System Time Tools

#### Get System Time

- **Tool Name**: `get_system_time`
- **Parameters**:
  - `format`: (Optional) Date format string following date-fns format
- **Returns**: Current system time formatted according to the specified format

## Development

### Project Structure

```
├── src/
│   ├── features/        # MCP features (JIRA, system time)
│   ├── server/          # MCP server implementation
│   ├── shared/          # Shared utilities
│   └── index.ts         # Main entry point
```

### Scripts

- `npm run build` - Build the project
- `npm run build:prod` - Build the project for production
- `npm run inspect` - Run with MCP inspector for debugging
- `npm run cleanup-ports` - Release ports used by the inspector
- `npm test` - Run tests

## License

MIT

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/specification/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
