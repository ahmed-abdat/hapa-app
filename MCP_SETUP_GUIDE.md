# Claude Code MCP Server Setup Guide

This guide provides step-by-step instructions to configure MCP (Model Context Protocol) servers in Claude Code for enhanced search and context management capabilities.

## Overview

MCP servers extend Claude Code's capabilities by providing access to external tools and data sources. This setup includes:

- **context7**: Context management and memory capabilities
- **exa-search**: Advanced search functionality
- **brave-search**: Brave search engine integration

## Prerequisites

- Claude Code installed and configured
- Node.js and npm/npx available
- API keys for search services (if using remote servers)

## Method 1: Command Line Setup (Quick)

### 1. Add MCP Servers via CLI

```bash
# Add context7 MCP server (HTTP transport)
claude mcp add --transport http context7 https://mcp.context7.com/mcp

# Add Exa search MCP server
claude mcp add --transport http exa-search "https://server.smithery.ai/exa/mcp?api_key=YOUR_API_KEY&profile=YOUR_PROFILE"

# Add Brave search MCP server
claude mcp add --transport http brave-search "https://server.smithery.ai/@smithery-ai/brave-search/mcp?api_key=YOUR_API_KEY&profile=YOUR_PROFILE"
```

### 2. Verify Installation

```bash
# List configured MCP servers
claude mcp list
```

## Method 2: Configuration Files (Recommended)

### 1. Create Project MCP Configuration

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "exa-search": {
      "url": "https://server.smithery.ai/exa/mcp",
      "transport": "http",
      "env": {
        "API_KEY": "${EXA_API_KEY}",
        "PROFILE": "${EXA_PROFILE}"
      }
    },
    "brave-search": {
      "url": "https://server.smithery.ai/@smithery-ai/brave-search/mcp",
      "transport": "http",
      "env": {
        "API_KEY": "${BRAVE_API_KEY}",
        "PROFILE": "${BRAVE_PROFILE}"
      }
    }
  }
}
```

### 2. Create Claude Settings Configuration

Create `.claude/settings.json`:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "context7",
    "exa-search",
    "brave-search"
  ]
}
```

### 3. Add Environment Variables

Add to your `.env` file:

```env
# MCP Server Configuration
EXA_API_KEY=your_exa_api_key_here
EXA_PROFILE=your_exa_profile_here
BRAVE_API_KEY=your_brave_api_key_here
BRAVE_PROFILE=your_brave_profile_here
```

## Setup Instructions for New Worktree

### 1. Create Required Directories

```bash
mkdir -p .claude
```

### 2. Copy Configuration Files

Copy these files to your new worktree:

- `.mcp.json` (project root)
- `.claude/settings.json`
- Environment variables in `.env`

### 3. Install Dependencies (if using local servers)

```bash
# For context7 local server
npx -y @upstash/context7-mcp --version
```

### 4. Verify Setup

```bash
# Check MCP servers
claude mcp list

# Start Claude Code
claude code
```

## Using MCP Servers in Claude Code

### 1. Resource References

Use `@` mentions to reference MCP server resources:

```
@context7 - Access context management
@exa-search - Use advanced search
@brave-search - Search with Brave
```

### 2. Slash Commands

MCP servers may provide slash commands:

```
/mcp__context7__search
/mcp__exa-search__query
/mcp__brave-search__web
```

### 3. Session Management

- Use `/mcp` command within Claude Code for server management
- Check server status and authentication
- Manage connections and permissions

## Configuration Options

### Claude Settings (`.claude/settings.json`)

```json
{
  "enableAllProjectMcpServers": true,           // Auto-approve all project MCP servers
  "enabledMcpjsonServers": ["server1", "server2"], // Specific servers to enable
  "disabledMcpjsonServers": ["server3"]         // Specific servers to disable
}
```

### MCP Server Types

1. **Stdio Server**: Local executable
   ```json
   {
     "command": "/path/to/server",
     "args": ["arg1", "arg2"],
     "env": {"VAR": "value"}
   }
   ```

2. **HTTP Server**: Remote HTTP endpoint
   ```json
   {
     "url": "https://example.com/mcp",
     "transport": "http",
     "env": {"API_KEY": "${API_KEY}"}
   }
   ```

3. **SSE Server**: Server-Sent Events
   ```json
   {
     "url": "https://example.com/sse",
     "transport": "sse",
     "env": {"TOKEN": "${TOKEN}"}
   }
   ```

## Environment Variable Expansion

MCP configuration supports `${VAR}` syntax for dynamic values:

- `${API_KEY}` - Expands to environment variable
- `${HOME}` - System environment variables
- `${PROJECT_ROOT}` - Project-specific variables

## Security Best Practices

1. **Environment Variables**: Store sensitive data in `.env` files
2. **Version Control**: 
   - Commit `.mcp.json` and `.claude/settings.json`
   - Add `.env` to `.gitignore`
3. **API Keys**: Use environment variables, never hardcode
4. **Permissions**: Review MCP server permissions carefully

## Troubleshooting

### Common Issues

1. **MCP Server Not Loading**
   - Restart Claude Code
   - Check server configuration syntax
   - Verify environment variables

2. **Authentication Errors**
   - Verify API keys in `.env`
   - Check server permissions
   - Use `/mcp` command to manage auth

3. **Connection Issues**
   - Check internet connectivity
   - Verify server URLs
   - Review transport settings

### Debug Commands

```bash
# List all MCP servers
claude mcp list

# Check Claude Code version
claude --version

# View logs (if available)
claude logs
```

## File Structure

After setup, your project should have:

```
your-project/
├── .mcp.json                 # MCP server definitions
├── .claude/
│   └── settings.json         # Claude Code settings
├── .env                      # Environment variables (gitignored)
└── MCP_SETUP_GUIDE.md       # This guide
```

## Advanced Configuration

### Custom MCP Server

Create your own MCP server by implementing the MCP protocol:

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "node",
      "args": ["./custom-mcp-server.js"],
      "env": {
        "SERVER_PORT": "8080"
      }
    }
  }
}
```

### Team Collaboration

Share MCP configuration with your team:

1. Commit `.mcp.json` and `.claude/settings.json`
2. Document required environment variables
3. Provide setup instructions in README
4. Use consistent API key management

## Resources

- [Claude Code MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Claude Code Settings](https://docs.anthropic.com/en/docs/claude-code/settings)

## Support

For issues with:
- **Claude Code**: Check [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)
- **MCP Servers**: Refer to individual server documentation
- **Configuration**: Review this guide and Claude Code settings docs

---

**Note**: Replace `YOUR_API_KEY` and `YOUR_PROFILE` with your actual API credentials when setting up the servers.