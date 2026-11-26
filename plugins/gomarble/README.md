# GoMarble plugin

The GoMarble plugin for Claude and Codex: the AI agent for paid media teams. Install steps, what it does, and data and privacy details are in the [repository README](https://github.com/gomarble-ai/marketing-agent#readme).

This folder is the plugin itself. It holds markdown skills and one remote connector setting, and runs nothing locally.

```text
plugins/gomarble/
├── .claude-plugin/plugin.json   # Claude manifest
├── .codex-plugin/plugin.json    # Codex manifest
├── .mcp.json                    # GoMarble connector: https://apps.gomarble.ai/mcp-api/mcp (OAuth)
├── skills/                      # skills, read by Claude, ChatGPT and Codex
└── assets/icon.png
```
