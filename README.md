<div align="center">

# 🔗 JIRA MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=Jira&logoColor=white)](https://www.atlassian.com/software/jira)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-blue?style=for-the-badge)](https://modelcontextprotocol.io)

<p align="center">
  <b>A powerful Model Context Protocol (MCP) server that brings JIRA integration directly to any editor or application that supports MCP</b>
</p>

</div>

---

## ✨ Features

- 📋 **Access JIRA Directly From Cursor**
  - View your assigned issues without leaving your IDE
  - Get detailed information on specific issues with one command
  - Convert JIRA issues into local tasks seamlessly

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Dsazz/mcp-jira.git
cd mcp-jira

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your JIRA credentials
```

### Configuration

Create a `.env` file with the following variables:

```ini
JIRA_HOST=https://your-instance.atlassian.net
JIRA_USERNAME=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token-here
```

> **🔑 Important Note About JIRA API Tokens**
>
> - A JIRA API token can be generated at [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
> - Tokens may contain special characters, including the `=` sign
> - Place the token on a single line in the `.env` file
> - Do not add quotes around the token value
> - Paste the token exactly as provided by Atlassian

## 🛠️ Development Tools

### Code Quality Tools

The project uses [Biome](https://biomejs.dev/) for code formatting and linting, replacing the previous ESLint setup. Biome provides:

- Fast, unified formatting and linting
- TypeScript-first tooling
- Zero configuration needed
- Consistent code style enforcement

To format and lint your code:

```bash
# Format code
bun format

# Check code for issues
bun check

# Type check
bun typecheck
```

### MCP Inspector

<details>
<summary>Click to expand MCP Inspector details</summary>

The MCP Inspector is a powerful tool for testing and debugging your MCP server.

```bash
# Run the inspector (no separate build step needed)
bun run inspect
```

The inspector automatically:

- Loads environment variables from `.env`
- Cleans up occupied ports (5175, 3002)
- Builds the project when needed
- Starts the MCP server with your configuration
- Launches the inspector UI

Visit the inspector at http://localhost:5175?proxyPort=3002

If you encounter port conflicts:

```bash
bun run cleanup-ports
```

#### Debugging with the Inspector

The inspector UI allows you to:

- View all available MCP capabilities
- Execute tools and examine responses
- Analyze the JSON communication
- Test with different parameters

For more details, see the [MCP Inspector GitHub repository](https://github.com/modelcontextprotocol/inspector).

</details>

### Integration with Claude Desktop

<details>
<summary>Click to expand Claude Desktop integration</summary>

Test your MCP server directly with Claude:

1. Build:

   ```bash
   bun run build  # You must build the project before running it
   ```

2. Configure Claude Desktop:

   ```bash
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. Add the MCP configuration:

   ```json
   {
     "mcpServers": {
       "JIRA Tools": {
         "command": "node", //or "bun"
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

4. Restart Claude Desktop and test with:
   ```
   What time is it right now?
   ```
   or
   ```
   Show me my assigned JIRA issues.
   ```

</details>

## 🔌 Integration with Cursor IDE

> **⚠️ Important:** You must build the project with `bun run build` before integrating with Cursor IDE or Claude Desktop.

Add this MCP server to your Cursor IDE's MCP configuration:

```json
{
  "mcpServers": {
    "JIRA Tools": {
      "command": "node", // or "bun"
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

## 🧰 Available Tools

### JIRA Tools

| Tool                       | Description                                      | Parameters                           | Returns                           |
| -------------------------- | ------------------------------------------------ | ------------------------------------ | --------------------------------- |
| `jira_get_assigned_issues` | Retrieves all issues assigned to you             | None                                 | Markdown-formatted list of issues |
| `jira_get_issue`           | Gets detailed information about a specific issue | `issueKey`: Issue key (e.g., PD-312) | Markdown-formatted issue details  |
| `jira_create_task`         | Creates a local task from a JIRA issue           | `issueKey`: Issue key (e.g., PD-312) | Markdown-formatted task           |

## 📁 Project Structure

```
 src/
  ├── core/          # Core functionality and configurations
  ├── features/      # Feature implementations
  │   └── jira/      # JIRA API integration
  │       ├── api/         # JIRA API client
  │       ├── formatters/  # Response formatters
  │       └── tools/       # MCP tool implementations
  └── test/          # Test utilities
```

### NPM Scripts

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `bun dev`           | Run the server in development mode with hot reload |
| `bun build`         | Build the project for production                   |
| `bun start`         | Start the production server                        |
| `bun format`        | Format code using Biome                            |
| `bun lint`          | Lint code using Biome                              |
| `bun check`         | Run Biome checks on code                           |
| `bun typecheck`     | Run TypeScript type checking                       |
| `bun test`          | Run tests                                          |
| `bun inspect`       | Start the MCP Inspector for debugging              |
| `bun cleanup-ports` | Clean up ports used by the development server      |

## 📝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development workflow
- Branching strategy
- Commit message format
- Pull request process
- Code style guidelines

## 📘 Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/specification/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 📄 License

[MIT](LICENSE) © Stanislav Stepanenko

---

<div align="center">
  <sub>Built with ❤️ for a better developer experience</sub>
</div>
