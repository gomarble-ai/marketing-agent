<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/gomarble-ai/marketing-agent/main/assets/logo-dark.png">
    <img alt="Marketing Agent — by GoMarble" src="https://raw.githubusercontent.com/gomarble-ai/marketing-agent/main/assets/logo-light.png" width="320">
  </picture>
</p>

<h1 align="center">Marketing Agent</h1>

<p align="center">
  <i>AI marketing automation in your terminal.</i><br/>
  Built by <a href="https://gomarble.ai"><b>GoMarble</b></a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/marketing-agent"><img src="https://img.shields.io/npm/v/marketing-agent?color=1F3A8A&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/marketing-agent"><img src="https://img.shields.io/npm/dm/marketing-agent?color=1F3A8A&label=downloads" alt="npm downloads"></a>
  <img src="https://img.shields.io/npm/l/marketing-agent?color=1F3A8A&label=license" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-supported-1F3A8A" alt="Claude Code">
  <img src="https://img.shields.io/badge/Codex_CLI-supported-1F3A8A" alt="Codex CLI">
</p>

---

> **Marketing Agent** is the brand entry-point for [**AI Ads OS**](https://github.com/gomarble-ai/ai-ads-os) — a senior AI marketing agent for Claude Code & Codex CLI. Audit, optimize, and launch campaigns across every major ad platform from natural-language briefs.

This package wraps and installs [`ai-ads-os`](https://www.npmjs.com/package/ai-ads-os), the canonical AI ads OS by GoMarble. Use whichever name reads natural to you — `marketing-agent`, `ai-ads-os`, or any of the other [aliases](#aliases-same-product).

- 🔌 **Live ad-platform data** via the GoMarble MCP server — OAuth, one-click sign-in
- 🧠 **36 expert-authored marketing playbooks** — Google Ads, Meta (Facebook/Instagram), GA4, Shopify, Search Console, Klaviyo, TikTok, LinkedIn, Bing Ads, document generation
- ⚡ **8 morning-workflow slash commands** — daily audits and decision matrices for Meta + Google
- 🛡️ **Built-in guardrails** — no synthetic data, no fabricated keywords, proper attribution discipline

---

## Install

### One command (npm)

```bash
npx marketing-agent
```

This delegates to `npx ai-ads-os` and handles Claude Code + Codex install in one shot.

### Or use the native Claude Code commands

In a Claude Code session:

```text
/plugin marketplace add https://github.com/gomarble-ai/ai-ads-os.git
/plugin install ai-ads-os@ai-ads-os
/reload-plugins
```

Then `/mcp` → authenticate `gomarble` → done.

### Or Codex CLI

```bash
codex plugin marketplace add https://github.com/gomarble-ai/ai-ads-os.git
codex mcp login gomarble
```

For the full install guide, slash-command reference, and skill list, see the canonical project: **[github.com/gomarble-ai/ai-ads-os](https://github.com/gomarble-ai/ai-ads-os)**.

---

## 🗣️ What you can ask the agent

The skills auto-invoke based on what you ask — you don't have to remember anything. Some examples:

| Ask | What happens |
|---|---|
| _"Audit my Meta account act_12345 for the last 30 days."_ | Loads performance + creative + depth-of-analysis skills, pulls 30d data, runs Pareto analysis, flags fatiguing creatives, surfaces ROAS outliers, produces a report. |
| _"How did my Google Ads Search campaigns do this week?"_ | Loads search-analysis skill, classifies queries Q1–Q5, diagnoses CPC inflation or rank pressure, returns a decision matrix. |
| _"Create a Meta ad set for this creative targeting US iOS users."_ | Loads create/master + adset skills, verifies parent campaign, detects pixel, builds the propose payload, asks you to confirm before posting. |
| _"Pull a 7d Shopify sales report and compare to GA4 conversions."_ | Loads Shopify order-discipline + GA4 source-of-truth skills, queries both, reconciles the difference. |
| _"Generate a PPTX summarizing all my paid-media performance."_ | Loads pptx skill + the relevant analytics skills, produces a deck. |

### ⚡ Slash commands (Claude Code only)

8 read-only morning-workflow commands. Each produces analysis + recommendations — **never executes mutations**. Mutations happen separately via Agent Mode if the user explicitly opts in. Click any command name to view its source.

**📊 Meta (4)**

| Command | What it does |
|---|---|
| [`/ai-ads-os:meta-daily-optimization <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/meta-daily-optimization.md) | Morning briefing: 1D vs 3D vs 7D, change-log gate, root-cause action recommendations (pause / cut / reallocate / scale candidates) |
| [`/ai-ads-os:meta-ads-audit <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/meta-ads-audit.md) | 30-day comprehensive audit — pixel/CAPI, fatigue, audience split, ROAS outliers, budget allocation |
| [`/ai-ads-os:meta-creative-fatigue-detection <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/meta-creative-fatigue-detection.md) | Per-ad scoring (Healthy / Early Warning / Fatigued / Dead) with refresh recommendations |
| [`/ai-ads-os:meta-creative-strategy <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/meta-creative-strategy.md) | Winners + losers, pattern extraction, test plan, scaling plan, 12-creative production spec |

**🎯 Google (4)**

| Command | What it does |
|---|---|
| [`/ai-ads-os:google-search-audit <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/google-search-audit.md) | Daily Search briefing: brand-vs-non-brand segmentation, CUT / FIX / SCALE recommendations |
| [`/ai-ads-os:google-pmax-pulse <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/google-pmax-pulse.md) | 3d-vs-3d PMax anomaly check — Critical / Alert / Monitor classification, disciplined against overcorrection |
| [`/ai-ads-os:google-search-term-audit <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/google-search-term-audit.md) | Forensic waste audit using 80/80 Pareto + campaign-relative triggers; suggested negative keywords and root negatives |
| [`/ai-ads-os:google-impression-share <acct>`](https://github.com/gomarble-ai/ai-ads-os/blob/main/commands/google-impression-share.md) | Lost-IS analysis → scaling opportunities (Budget) vs bid/quality work (Rank), gated on profitability |

In Codex, just describe the task in natural language — the skills' `description` fields handle routing.

---

## 📦 Skills shipped (36)

Click any skill name to view its `SKILL.md` source.

### 🎯 Google Ads (17)

| Type | Skill | What it does |
|---|---|---|
| 🏗️ Foundations | [`google-ads-tool-fundamentals`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-tool-fundamentals/SKILL.md) | Tool-call patterns, GAQL basics, account structure |
| 🏗️ Foundations | [`google-ads-guardrails`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-guardrails/SKILL.md) | Mutation safety, attribution rules, what never to fabricate |
| 🔍 Analysis | [`google-ads-search-analysis`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-search-analysis/SKILL.md) | Q1–Q5 query classification, CPC inflation diagnostics |
| 🔍 Analysis | [`google-ads-shopping`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-shopping/SKILL.md) | Shopping / Merchant Center performance audits |
| 🔍 Analysis | [`google-ads-pmax-evaluation`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-pmax-evaluation/SKILL.md) | PMax 3d-vs-3d anomaly detection |
| 🔍 Analysis | [`google-ads-pmax-scaling`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-pmax-scaling/SKILL.md) | PMax scaling decisions, disciplined against overcorrection |
| 🔍 Analysis | [`google-ads-keywordplanner`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-keywordplanner/SKILL.md) | Keyword discovery without fabrication |
| 🔍 Analysis | [`google-ads-depth-of-analysis`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-depth-of-analysis/SKILL.md) | Multi-layer drill-down methodology |
| ⚡ Execution | [`google-ads-search-execution`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-search-execution/SKILL.md) | Bid / budget / structure changes (gated on profitability) |
| 🚀 Creation | [`google-ads-create-master-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-master-skill/SKILL.md) | Master orchestrator for new campaign builds |
| 🚀 Creation | [`google-ads-create-campaign`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-campaign/SKILL.md) | Campaign-level setup |
| 🚀 Creation | [`google-ads-create-ad-group`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-ad-group/SKILL.md) | Ad-group creation |
| 🚀 Creation | [`google-ads-create-ad`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-ad/SKILL.md) | Ad-level creation |
| 🚀 Creation | [`google-ads-create-asset`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-asset/SKILL.md) | Asset uploads |
| 🚀 Creation | [`google-ads-create-experiment`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-experiment/SKILL.md) | Experiment / draft setup |
| 🚀 Creation | [`google-ads-create-negative-keyword-list`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-negative-keyword-list/SKILL.md) | Negative-keyword list management |
| 🚀 Creation | [`google-ads-create-bid-modifiers`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/google-ads-create-bid-modifiers/SKILL.md) | Bid-modifier setup |

### 📊 Meta — Facebook + Instagram (10)

| Type | Skill | What it does |
|---|---|---|
| 🏗️ Foundations | [`meta-tool-fundamentals`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-tool-fundamentals/SKILL.md) | Tool-call patterns, account / campaign / ad-set / ad taxonomy |
| 🏗️ Foundations | [`meta-guardrails`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-guardrails/SKILL.md) | Mutation safety, attribution discipline |
| 🔍 Analysis | [`meta-performance-analysis`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-performance-analysis/SKILL.md) | Account-level performance audits |
| 🔍 Analysis | [`meta-creative-analysis`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-creative-analysis/SKILL.md) | Creative-fatigue scoring (Healthy / Warning / Fatigued / Dead) |
| 🔍 Analysis | [`meta-depth-of-analysis`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-depth-of-analysis/SKILL.md) | Multi-layer drill-down for Meta accounts |
| ⚙️ Operations | [`meta-agent-operations`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-agent-operations/SKILL.md) | Agentic-loop patterns for Meta workflows |
| 🚀 Creation | [`meta-create-master-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-create-master-skill/SKILL.md) | Master orchestrator for new Meta campaign builds |
| 🚀 Creation | [`meta-create-campaign`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-create-campaign/SKILL.md) | Campaign-level setup |
| 🚀 Creation | [`meta-create-adset`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-create-adset/SKILL.md) | Ad-set setup |
| 🚀 Creation | [`meta-create-ad-with-creative`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/meta-create-ad-with-creative/SKILL.md) | Ad + creative pairing |

### 📈 Other platforms (4)

| Platform | Skill | What it does |
|---|---|---|
| 📊 GA4 | [`ga4-source-of-truth`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/ga4-source-of-truth/SKILL.md) | Conversions ≠ transactions, channel-subset-sum traps, attribution discipline |
| 🛍️ Shopify | [`shopify-order-discipline`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/shopify-order-discipline/SKILL.md) | No `financial_status` filter, gross-vs-net, refunds, multi-currency |
| 🔎 Search Console | [`search-console-master-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/search-console-master-skill/SKILL.md) | Organic search analysis + opportunity scoring |
| 🎨 Creative | [`creative-research`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/creative-research/SKILL.md) | Competitor research, evergreen + breakout winners, pattern analysis |

### 📄 Document generation (5)

| Format | Skill | What it does |
|---|---|---|
| 📝 DOCX | [`documents-docx-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/documents-docx-skill/SKILL.md) | Word document generation |
| 🎯 PPTX | [`documents-pptx-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/documents-pptx-skill/SKILL.md) | PowerPoint deck generation |
| 📑 PDF | [`documents-pdf-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/documents-pdf-skill/SKILL.md) | PDF report generation |
| 📊 XLSX | [`documents-xlsx-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/documents-xlsx-skill/SKILL.md) | Excel spreadsheet generation |
| 🐍 Python | [`python-sandbox-skill`](https://github.com/gomarble-ai/ai-ads-os/blob/main/skills/python-sandbox-skill/SKILL.md) | Foundation for all document generation |

---

## 🔄 How it works

```
You ask:  "Audit my Meta account"
    ↓
Claude / Codex auto-invokes the right skills by description
    ↓
Skill instructs the agent to call GoMarble MCP tools (meta_get_account_insights, etc.)
    ↓
GoMarble MCP → live Meta Ads API call (with your OAuth token)
    ↓
Agent applies the methodology + guardrails to interpret the data
    ↓
You get the answer
```

The plugin ships only the methodology. All live data comes from the GoMarble MCP server you authorized with `/mcp` (Claude) or `codex mcp login gomarble`.

---

## 🔁 Updating

```text
# Claude Code
/plugin marketplace update ai-ads-os

# Codex CLI
codex plugin marketplace update ai-ads-os
```

The SessionStart hook also surfaces an "update available" prompt automatically the first time you start a session on an outdated version.

---

## 📁 Repo layout (canonical `ai-ads-os` project)

This is what gets installed when you run any of the install commands above:

```
ai-ads-os/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code manifest
│   └── marketplace.json         # marketplace declaration
├── .codex-plugin/
│   └── plugin.json              # Codex manifest with rich install metadata
├── .mcp.json                    # remote MCP wiring (Streamable HTTP + OAuth)
├── commands/                    # 8 slash commands (Claude reads; Codex ignores)
├── hooks/
│   ├── hooks.json               # registers SessionStart hook
│   └── session-start.mjs        # MCP probe + version check + today's-date injection
├── skills/                      # 36 SKILL.md folders — both hosts read from here
└── README.md
```

### Why one folder works for both hosts

Each host looks for its manifest in a dedicated subfolder; everything else is shared.

| Host | Manifest | Reads | Ignores |
|---|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` | `skills/`, `commands/`, `.mcp.json` (`mcpServers` key) | `.codex-plugin/` |
| Codex | `.codex-plugin/plugin.json` | `skills/`, `.mcp.json` (`mcp_servers` key) | `.claude-plugin/plugin.json`, `commands/` |

`.mcp.json` ships **both** wrapper keys with identical content so each host finds its preferred form.

---

## Aliases (same product)

This package is one of several brand entry-points for the same underlying AI marketing agent — each tuned to how different users search:

| Package | Search target |
|---|---|
| [`ai-ads-os`](https://www.npmjs.com/package/ai-ads-os) | Canonical product |
| `marketing-agent` (this) | "marketing agent" |
| [`ai-marketing-agency`](https://www.npmjs.com/package/ai-marketing-agency) | "ai marketing agency" |
| [`ai-ads-agent`](https://www.npmjs.com/package/ai-ads-agent) | "ai ads agent" |
| [`ai-media-buyer`](https://www.npmjs.com/package/ai-media-buyer) | "ai media buyer" |

All install the same Claude Code / Codex plugin.

---

## Support

- **Docs & examples:** https://gomarble.ai
- **Issues:** https://github.com/gomarble-ai/ai-ads-os/issues
- **Account / billing:** https://apps.gomarble.ai

---

<p align="center">
  <a href="https://gomarble.ai">
    <img src="https://raw.githubusercontent.com/gomarble-ai/marketing-agent/main/assets/icon.svg" alt="GoMarble" height="40">
  </a>
</p>

<p align="center">
  <b>Built with care by <a href="https://gomarble.ai">GoMarble</a></b><br/>
  <sub>The AI marketing agent for performance marketers — Google Ads, Meta, TikTok, LinkedIn, Bing, GA4, Shopify, Klaviyo & more.</sub>
</p>

<p align="center">
  <sub>© GoMarble. MIT licensed.</sub>
</p>
