<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/gomarble-ai/marketing-agent/main/assets/logo-dark.png">
    <img alt="Marketing Agent — by GoMarble" src="https://raw.githubusercontent.com/gomarble-ai/marketing-agent/main/assets/logo-light.png" width="320">
  </picture>
</p>

<h1 align="center">Marketing Agent</h1>

<p align="center">
  <i>An AI marketing agent in your terminal.</i><br/>
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

> **An AI marketing agent at your fingertips.** Meta strategists, Google Ads specialists, creative-fatigue analysts, GA4 attribution experts, Shopify ops leads — each a specialized agent with battle-tested processes, not a generic chatbot.

**Marketing Agent** is the AI marketing agent for **Claude Code & Codex CLI** — it plugs your terminal into your ad accounts and turns it into a senior performance marketer across Google Ads, Meta, TikTok, LinkedIn, Bing, GA4, Shopify, Klaviyo & Search Console. Built by [GoMarble](https://gomarble.ai), the team that runs paid media for some of the fastest-growing DTC brands.

- 🔌 **Live ad-platform data** via the GoMarble MCP server — OAuth, one-click sign-in
- 🧠 **42 expert-authored skills** — Google Ads, Meta (Facebook/Instagram), creative strategy, GA4, Shopify, Search Console, Klaviyo, TikTok, LinkedIn, Bing Ads, document generation
- ⚡ **8 morning-workflow slash commands** — daily audits and decision matrices for Meta + Google
- 🛡️ **Built-in guardrails** — no synthetic data, no fabricated keywords, proper attribution discipline

---

## Install

### Claude Code

In a Claude Code session, paste these three commands:

```text
/plugin marketplace add https://github.com/gomarble-ai/marketing-agent.git
/plugin install marketing-agent@marketing-agent
/reload-plugins
```

> Using the **full HTTPS URL** (not the `owner/repo` shorthand) avoids SSH-key errors on machines where git is configured to rewrite GitHub HTTPS URLs to SSH.

Then connect the MCP server:

```text
/mcp
```

Pick `gomarble`, click **Authenticate** — the browser opens, you sign in to GoMarble, you're done.

### Codex CLI

```bash
codex plugin marketplace add https://github.com/gomarble-ai/marketing-agent.git
```

Start Codex, open the **Plugins** panel, find `Marketing Agent`, and install. Then:

```bash
codex mcp login gomarble
```

Same OAuth flow, one-time.

### One-command install for both (via npm)

```bash
npx marketing-agent
```

This wraps the official commands above and works on macOS / Linux / Windows.

---

## 🗣️ What you can ask the agent

The skills auto-invoke based on what you ask — you don't have to remember anything. Some examples:

| Ask | What happens |
|---|---|
| _"Audit my Meta account act_12345 for the last 30 days."_ | Loads performance + creative + depth-of-analysis skills, pulls 30d data, runs Pareto analysis, flags fatiguing creatives, surfaces ROAS outliers, produces a report. |
| _"How did my Google Ads Search campaigns do this week?"_ | Loads search-analysis skill, classifies queries Q1–Q5, diagnoses CPC inflation or rank pressure, returns a decision matrix. |
| _"Create a Meta ad set for this creative targeting US iOS users."_ | Loads create/master + adset skills, verifies parent campaign, detects pixel, builds the propose payload, asks you to confirm before posting. |
| _"Pull a 7d Shopify sales report and compare to GA4 conversions."_ | Loads Shopify order-discipline + GA4 source-of-truth skills, queries both, reconciles the difference. |
| _"Find winning ad ideas for my brand and turn the best directions into shoot-ready briefs."_ | Runs competitor intelligence, own-creative diagnosis, hook psychology, pattern synthesis, and brief generation, adapting to the data available. |
| _"Generate a PPTX summarizing all my paid-media performance."_ | Loads pptx skill + the relevant analytics skills, produces a deck. |

### ⚡ Slash commands (Claude Code only)

8 read-only morning-workflow commands. Each produces analysis + recommendations — **never executes mutations**. Mutations happen separately via Agent Mode if the user explicitly opts in. Click any command name to view its source.

**📊 Meta (4)**

| Command | What it does |
|---|---|
| [`/marketing-agent:meta-daily-optimization <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/meta-daily-optimization.md) | Morning briefing: 1D vs 3D vs 7D, change-log gate, root-cause action recommendations (pause / cut / reallocate / scale candidates) |
| [`/marketing-agent:meta-ads-audit <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/meta-ads-audit.md) | 30-day comprehensive audit — pixel/CAPI, fatigue, audience split, ROAS outliers, budget allocation |
| [`/marketing-agent:meta-creative-fatigue-detection <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/meta-creative-fatigue-detection.md) | Per-ad scoring (Healthy / Early Warning / Fatigued / Dead) with refresh recommendations |
| [`/marketing-agent:meta-creative-strategy <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/meta-creative-strategy.md) | Winners + losers, pattern extraction, test plan, scaling plan, 12-creative production spec |

**🎯 Google (4)**

| Command | What it does |
|---|---|
| [`/marketing-agent:google-search-audit <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/google-search-audit.md) | Daily Search briefing: brand-vs-non-brand segmentation, CUT / FIX / SCALE recommendations |
| [`/marketing-agent:google-pmax-pulse <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/google-pmax-pulse.md) | 3d-vs-3d PMax anomaly check — Critical / Alert / Monitor classification, disciplined against overcorrection |
| [`/marketing-agent:google-search-term-audit <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/google-search-term-audit.md) | Forensic waste audit using 80/80 Pareto + campaign-relative triggers; suggested negative keywords and root negatives |
| [`/marketing-agent:google-impression-share <acct>`](https://github.com/gomarble-ai/marketing-agent/blob/main/commands/google-impression-share.md) | Lost-IS analysis → scaling opportunities (Budget) vs bid/quality work (Rank), gated on profitability |

In Codex, just describe the task in natural language — the skills' `description` fields handle routing.

---

## 📦 Skills shipped (42)

Click any skill name to view its `SKILL.md` source.

### 🎯 Google Ads (17)

| Type | Skill | What it does |
|---|---|---|
| 🏗️ Foundations | [`google-ads-tool-fundamentals`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-tool-fundamentals/SKILL.md) | Tool-call patterns, GAQL basics, account structure |
| 🏗️ Foundations | [`google-ads-guardrails`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-guardrails/SKILL.md) | Mutation safety, attribution rules, what never to fabricate |
| 🔍 Analysis | [`google-ads-search-analysis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-search-analysis/SKILL.md) | Q1–Q5 query classification, CPC inflation diagnostics |
| 🔍 Analysis | [`google-ads-shopping`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-shopping/SKILL.md) | Shopping / Merchant Center performance audits |
| 🔍 Analysis | [`google-ads-pmax-evaluation`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-pmax-evaluation/SKILL.md) | PMax 3d-vs-3d anomaly detection |
| 🔍 Analysis | [`google-ads-pmax-scaling`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-pmax-scaling/SKILL.md) | PMax scaling decisions, disciplined against overcorrection |
| 🔍 Analysis | [`google-ads-keywordplanner`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-keywordplanner/SKILL.md) | Keyword discovery without fabrication |
| 🔍 Analysis | [`google-ads-depth-of-analysis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-depth-of-analysis/SKILL.md) | Multi-layer drill-down methodology |
| ⚡ Execution | [`google-ads-search-execution`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-search-execution/SKILL.md) | Bid / budget / structure changes (gated on profitability) |
| 🚀 Creation | [`google-ads-create-master-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-master-skill/SKILL.md) | Master orchestrator for new campaign builds |
| 🚀 Creation | [`google-ads-create-campaign`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-campaign/SKILL.md) | Campaign-level setup |
| 🚀 Creation | [`google-ads-create-ad-group`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-ad-group/SKILL.md) | Ad-group creation |
| 🚀 Creation | [`google-ads-create-ad`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-ad/SKILL.md) | Ad-level creation |
| 🚀 Creation | [`google-ads-create-asset`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-asset/SKILL.md) | Asset uploads |
| 🚀 Creation | [`google-ads-create-experiment`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-experiment/SKILL.md) | Experiment / draft setup |
| 🚀 Creation | [`google-ads-create-negative-keyword-list`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-negative-keyword-list/SKILL.md) | Negative-keyword list management |
| 🚀 Creation | [`google-ads-create-bid-modifiers`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/google-ads-create-bid-modifiers/SKILL.md) | Bid-modifier setup |

### 📊 Meta — Facebook + Instagram (10)

| Type | Skill | What it does |
|---|---|---|
| 🏗️ Foundations | [`meta-tool-fundamentals`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-tool-fundamentals/SKILL.md) | Tool-call patterns, account / campaign / ad-set / ad taxonomy |
| 🏗️ Foundations | [`meta-guardrails`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-guardrails/SKILL.md) | Mutation safety, attribution discipline |
| 🔍 Analysis | [`meta-performance-analysis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-performance-analysis/SKILL.md) | Account-level performance audits |
| 🔍 Analysis | [`meta-creative-analysis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-creative-analysis/SKILL.md) | Creative-fatigue scoring (Healthy / Warning / Fatigued / Dead) |
| 🔍 Analysis | [`meta-depth-of-analysis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-depth-of-analysis/SKILL.md) | Multi-layer drill-down for Meta accounts |
| ⚙️ Operations | [`meta-agent-operations`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-agent-operations/SKILL.md) | Agentic-loop patterns for Meta workflows |
| 🚀 Creation | [`meta-create-master-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-create-master-skill/SKILL.md) | Master orchestrator for new Meta campaign builds |
| 🚀 Creation | [`meta-create-campaign`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-create-campaign/SKILL.md) | Campaign-level setup |
| 🚀 Creation | [`meta-create-adset`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-create-adset/SKILL.md) | Ad-set setup |
| 🚀 Creation | [`meta-create-ad-with-creative`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/meta-create-ad-with-creative/SKILL.md) | Ad + creative pairing |

### 📈 Other platforms (3)

| Platform | Skill | What it does |
|---|---|---|
| 📊 GA4 | [`ga4-source-of-truth`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/ga4-source-of-truth/SKILL.md) | Conversions ≠ transactions, channel-subset-sum traps, attribution discipline |
| 🛍️ Shopify | [`shopify-order-discipline`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/shopify-order-discipline/SKILL.md) | No `financial_status` filter, gross-vs-net, refunds, multi-currency |
| 🔎 Search Console | [`search-console-master-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/search-console-master-skill/SKILL.md) | Organic search analysis + opportunity scoring |

### 🎨 Creative strategy (7)

| Type | Skill | What it does |
|---|---|---|
| 🔁 Orchestration | [`winning-ads-orchestrator`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/winning-ads-orchestrator/SKILL.md) | Routes competitor research, first-party diagnosis, hook analysis, synthesis, and brief generation |
| 🔎 Research | [`creative-research`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/creative-research/SKILL.md) | Competitor discovery plus evergreen and breakout investment signals |
| 🔎 Research | [`competitor-ad-intelligence`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/competitor-ad-intelligence/SKILL.md) | Live competitor-ad patterns and investment proxies through GoMarble MCP |
| 📊 Analysis | [`own-creative-diagnosis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/own-creative-diagnosis/SKILL.md) | First-party Meta creative diagnosis with explicit evidence gates |
| 🧠 Ideation | [`creative-psychology-hooks`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/creative-psychology-hooks/SKILL.md) | Structured hook generation and psychological hypothesis grading |
| 🧩 Synthesis | [`winning-pattern-synthesis`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/winning-pattern-synthesis/SKILL.md) | Cross-source patterns, own-account test gaps, and market whitespace |
| 🎬 Production | [`ad-brief-generator`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/ad-brief-generator/SKILL.md) | Shoot-ready UGC, static, carousel, and creator briefs |

### 📄 Document generation (5)

| Format | Skill | What it does |
|---|---|---|
| 📝 DOCX | [`documents-docx-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/documents-docx-skill/SKILL.md) | Word document generation |
| 🎯 PPTX | [`documents-pptx-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/documents-pptx-skill/SKILL.md) | PowerPoint deck generation |
| 📑 PDF | [`documents-pdf-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/documents-pdf-skill/SKILL.md) | PDF report generation |
| 📊 XLSX | [`documents-xlsx-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/documents-xlsx-skill/SKILL.md) | Excel spreadsheet generation |
| 🐍 Python | [`python-sandbox-skill`](https://github.com/gomarble-ai/marketing-agent/blob/main/skills/python-sandbox-skill/SKILL.md) | Foundation for all document generation |

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
/plugin marketplace update marketing-agent

# Codex CLI
codex plugin marketplace update marketing-agent
```

The SessionStart hook also surfaces an "update available" prompt automatically the first time you start a session on an outdated version.

---

## 📁 Repo layout

This is what gets installed when you run any of the install commands above:

```
marketing-agent/
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
├── skills/                      # 42 discoverable skills — both hosts read from here
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

## Support

- **Docs & examples:** https://gomarble.ai
- **Issues & feature requests:** https://github.com/gomarble-ai/marketing-agent/issues
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
