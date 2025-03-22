<div align="center">

# 🔗 JIRA MCP Server for Cursor

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=Jira&logoColor=white)](https://www.atlassian.com/software/jira)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>A powerful Model Context Protocol (MCP) server that brings JIRA integration directly to your Cursor IDE</b>
</p>

<p align="center">
  <span style="background: white; display: inline-block; padding: 10px; border-radius: 10px;">
    <img src="https://raw.githubusercontent.com/modelcontextprotocol/docs/main/logo/light.svg" alt="MCP Logo" width="200" />
  </span>
</p>

</div>

---

## ✨ Features

- 📋 **Access JIRA Directly From Cursor**
  - View your assigned issues without leaving your IDE
  - Get detailed information on specific issues with one command
  - Convert JIRA issues into local tasks seamlessly
- ⏰ **System Time Integration**
  - Customizable date and time formatting
  - Locale support via date-fns

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Dsazz/mcp-jira.git
cd mcp-jira

# Install dependencies
npm install

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
> - Tokens may contain special characters, including the `=` sign
> - Place the token on a single line in the `.env` file
> - Do not add quotes around the token value
> - Paste the token exactly as provided by Atlassian

## 🛠️ Development Tools

### MCP Inspector

<details>
<summary>Click to expand MCP Inspector details</summary>

The MCP Inspector is a powerful tool for testing and debugging your MCP server.

```bash
# Run the inspector (no separate build step needed)
npm run inspect
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
npm run cleanup-ports
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

1. Build and run your server:

   ```bash
   npm run build
   node dist/index.js
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
