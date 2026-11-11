# Folly MCP Server

Official Model Context Protocol (MCP) server for [Folly.so](https://folly.so). Allows AI agents (Claude Desktop, Cursor, Antigravity, Windsurf) to programmatically create, manage, and inspect forms on your Folly instance.

## Features

- **Form Management**: `create_form`, `get_form`, `list_forms`, `delete_form`, and `update_form_settings`.
- **One-Shot Generation**: `generate_form` lets AI agents construct complete multi-question forms from a single prompt.
- **Granular Editing**: `add_blocks` appends inputs, choices, scales (NPS/ratings), dates, page breaks, and headings.
- **Submissions Telemetry**: `list_submissions` lets AI analyze respondent feedback in real time.
- **MCP Resources**: Read-only `folly://forms` and `folly://submissions/{id}` data sources.

---

## Configuration

### 1. Claude Desktop

Add to your `claude_desktop_config.json` (Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`, Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "folly": {
      "command": "node",
      "args": ["/absolute/path/to/folly.so/mcp/index.mjs"],
      "env": {
        "FOLLY_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

### 2. Cursor / Windsurf

Add to your MCP settings:

- **Name**: `folly`
- **Command**: `node`
- **Args**: `/absolute/path/to/folly.so/mcp/index.mjs`
- **Env**: `FOLLY_API_URL=http://localhost:3001`

---

## Supported Tools

| Tool | Description |
| :--- | :--- |
| `list_forms` | Lists all forms with title, ID, URL slug, and submission count |
| `get_form` | Fetches the full JSON tree (blocks, settings, theme, logic) |
| `create_form` | Creates a new blank form canvas |
| `add_blocks` | Adds questions, choice options, ratings, or page breaks |
| `generate_form` | High-level agent tool to build an entire form in one command |
| `update_form_settings` | Configures vanity slug, custom CSS, password gate, or response limits |
| `list_submissions` | Retrieves all submissions and answers for a form |
| `delete_form` | Deletes a form and its submissions |

---

## Direct Database Access

If the Folly HTTP server is not running, the MCP server automatically falls back to direct PostgreSQL queries using `DATABASE_URL` (defaults to `postgres://folly:folly@localhost:5440/folly`).
