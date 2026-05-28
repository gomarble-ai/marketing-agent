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

## What the Marketing Agent does

| Ask | What happens |
|---|---|
| _"Audit my Meta account for the last 30 days."_ | Loads performance + creative + depth-of-analysis skills, runs Pareto analysis, flags fatiguing creatives, surfaces ROAS outliers. |
| _"How did my Google Ads Search campaigns do this week?"_ | Classifies queries Q1–Q5, diagnoses CPC inflation or rank pressure, returns a decision matrix. |
| _"Build a Meta ad set for this creative targeting US iOS users."_ | Verifies parent campaign, detects pixel, builds the propose payload, asks for confirmation. |
| _"Pull a 7d Shopify sales report and compare to GA4 conversions."_ | Queries both, reconciles attribution differences. |
| _"Generate a PPTX of all my paid-media performance."_ | Produces a professional deck. |

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
