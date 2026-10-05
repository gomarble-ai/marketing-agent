![GoMarble](assets/logo.png)

<h1 align="center">GoMarble for Claude</h1>

<p align="center">
  <b>The AI agent for paid media teams, inside Claude and Codex.</b><br/>
  Built by <a href="https://www.gomarble.ai">GoMarble</a>.
</p>

---

GoMarble connects Claude to your ad accounts, analytics and store data. It explains what changed and why, and prepares the next move for your approval.

Ask about any account in plain language. GoMarble pulls the data across channels, finds the root cause, and recommends what to do. When you say yes, it makes the change. You can also hand the routine work to agents that watch your accounts on a schedule and report back by email or Slack.

GoMarble agents manage more than $3B in annualized ad spend for in-house brand teams and agencies.

---

## What you can do

| Job | Ask Claude | Skill |
|---|---|---|
| **Diagnose performance** | "Why did ROAS drop on my Meta account last week? Find the root cause and what to do next." | `diagnose-performance` |
| **Analyze creative** | "Break down my top 10 Meta ads by spend. Which hooks, formats and angles are winning, and which are fatiguing?" | `analyse-creative` |
| **Research competitors** | "Find the longest-running ads from my top 3 competitors and summarize the angles they keep testing." | `research-competitors` |
| **Brief new creative** | "Write a creative brief for next week's tests using our winning hooks and the gaps in competitor ads." | `brief-creative` |
| **Cut wasted spend** | "Find wasted spend across my Google Search campaigns and propose the negatives." | `clean-wasted-spend` |
| **Shift budget** | "Where can we move $12k without pushing CAC above target? Show me the changes before applying." | `shift-budget` |
| **Launch campaigns** | "Launch a Meta sales campaign for our new bundle with these 3 creatives. Keep the ads paused until I review." | `launch-campaigns` |
| **Make any change** | "Pause these ad sets and lower the tCPA on Brand Search to $40." | `manage-campaigns` |
| **Report** | "Build my Monday performance review across Meta, Google and Shopify." | `build-reports` |
| **Automate** | "Every weekday at 9am, check all my accounts for spend spikes and ROAS drops, and email me only when something needs attention." | `automate-with-agents` |

The use-case skills follow [gomarble.ai/use-cases](https://www.gomarble.ai/use-cases/diagnose-performance). Skills load automatically from what you ask; you don't need to name them.

---

## Works with your whole stack

| Channel | What Claude can do through GoMarble |
|---|---|
| **Meta Ads** | Analyze, diagnose, creative analysis, audits. Launch Sales campaigns, edit, clone, pause and change budgets, with approval. |
| **Google Ads** | Analyze with GAQL, search terms, Shopping, PMax, keyword research. Launch Search and Performance Max, edit, negatives, bid modifiers, experiments, with approval. |
| **TikTok Ads** | Reports, audience and creative breakdowns, review status. For accounts in GoMarble's TikTok beta, launches and edits are prepared and validated in Claude, then applied in TikTok Ads Manager. |
| **LinkedIn Ads, Microsoft Ads** | Performance, campaigns, keywords, targeting. Read-only: changes come back as instructions. |
| **GA4, Shopify** | The business source of truth for sessions, conversions, orders and revenue. |
| **Klaviyo** | Campaign and flow performance, lists and segments. |
| **Search Console** | Organic queries, pages, indexing and sitemaps. |
| **Facebook Pages, Instagram** | Organic content performance, comments, tagged UGC. |
| **impact.com** | Affiliate partners, commissions, conversions and invoices. |
| **Snowflake, Google Drive** | Your warehouse (read-only queries), and docs, sheets and media in Drive. |
| **Ad library** | Competitor ads by brand, domain, keyword or niche. |

GoMarble supports 80+ integrations. Claude can reach the ones you connect in GoMarble.

---

## You approve every change

- **Analysis never changes anything.** Diagnosing, creative analysis, competitor research and reporting are read-only.
- **Changes are proposed first.** GoMarble validates each change as a dry run, and Claude shows you each edit, from the current value to the new one. Nothing is applied until you approve, and you can approve some edits and reject others.
- **New ads start paused.** By default, ads in a campaign built from Claude are created paused (TikTok entities start disabled), so nothing spends until you turn them on.
- **Agents start as drafts.** A new agent doesn't run until you activate it. Agents that can make changes ask for approval by default. Auto-apply is available only if you turn it on.
- **Guardrails for teams.** On plans with agent governance, you can limit which kinds of changes an agent may make and cap the size of any budget change.

## Built for teams

Claude works inside your GoMarble team's access rules, so agencies and in-house teams can give everyone Claude without giving everyone every account.

- **Roles:** owners and admins reach every account. Members reach only the accounts granted to them.
- **View or Act, per account:** a member with View can analyze an account; changing it (even proposing a change) needs Act.
- **Opt-in write access for Claude:** a Claude connection can read by default. Applying changes on Meta or Google Ads is a permission each person turns on.
- **Clear answers when access is missing:** Claude says what's needed and who can grant it, instead of failing silently.

Admins manage roles and access at Settings → Team management, and connections at Settings → Integrations.

---

## What's inside

**52 skills** and **8 slash commands**.

### Start here

| Skill | What it does |
|---|---|
| `get-started` | Connect accounts, find what's connected, use GoMarble's memory, and how approvals work. |
| `accounts-and-connections` | See, add, remove or reconnect ad accounts and data sources, connect other tools and Slack, and switch read-only / read & write. |
| `access-and-permissions` | Team roles, View vs Act account access, Claude's permissions, and what to do when a tool is denied. |

### Use cases

| Skill | What it does |
|---|---|
| `diagnose-performance` | Traces a performance move to its driver across channels, then proposes the smallest fix. |
| `analyse-creative` | Ranks creative by hook, hold, CTR, CPA and ROAS, reads the creative itself, and flags fatigue. |
| `research-competitors` | Finds competitors, pulls their ads from the ad library, groups angles, and flags what's new. |
| `brief-creative` | Turns winning patterns, customer language and market gaps into a production-ready brief. |
| `launch-campaigns` | Builds Meta, Google Search, PMax and TikTok (beta) launches for review before anything goes live. |
| `shift-budget` | Finds headroom from pacing, efficiency and targets, and proposes exact budget moves. |
| `clean-wasted-spend` | Quantifies waste in search terms, placements, audiences and creative, and proposes the clean-up. |
| `manage-campaigns` | Any other change: status, bids, targeting, copy, assets, modifiers, experiments. |
| `build-reports` | Cross-channel reports with drivers, decisions and a 7-day plan, saved to Drive or scheduled. |
| `automate-with-agents` | Creates and manages GoMarble agents that run on a schedule and deliver by email or Slack. |

### Channels

`tiktok-ads`, `linkedin-ads`, `microsoft-ads`, `email-marketing` (Klaviyo), `organic-social` (Facebook Pages and Instagram), `affiliate-marketing` (impact.com), `search-console-master-skill`, `ga4-source-of-truth`, `shopify-order-discipline`.

### GoMarble playbooks

The same methodology GoMarble's own agent uses, synced from the GoMarble server:

- **Meta:** `meta-performance-analysis`, `meta-creative-analysis`, `meta-depth-of-analysis`, `meta-guardrails`, `meta-tool-fundamentals`, `meta-agent-operations`, `meta-custom-event-interpretation`, `meta-create-master-skill`
- **Google Ads:** `google-ads-search-analysis`, `google-ads-search-execution`, `google-ads-shopping`, `google-ads-pmax-evaluation`, `google-ads-pmax-scaling`, `google-ads-keywordplanner`, `google-ads-depth-of-analysis`, `google-ads-guardrails`, `google-ads-tool-fundamentals`, `google-ads-create-master-skill`
- **TikTok:** `tiktok-create-master-skill`

### Creative strategy

`winning-ads-orchestrator` runs the full pipeline from market research to a shoot-ready brief, through `competitor-ad-intelligence`, `creative-research`, `own-creative-diagnosis`, `creative-psychology-hooks`, `winning-pattern-synthesis` and `ad-brief-generator`. `winning-ads-engine` holds the whole method in one reference.

### Business frameworks

`gomarble-skills-ecommerce-brands`, `gomarble-skills-saas-companies`, `gomarble-skills-creative-strategists`.

### Slash commands (Claude Code)

Read-only morning workflows. Each produces analysis and recommendations and never changes the account.

| Command | What it does |
|---|---|
| `/gomarble:meta-daily-optimization <acct>` | Yesterday vs 3-day vs 7-day, change-log gate, and root-cause actions. |
| `/gomarble:meta-ads-audit <acct>` | 30-day audit: pixel and CAPI, fatigue, audience split, ROAS outliers, budget allocation. |
| `/gomarble:meta-creative-fatigue-detection <acct>` | Per-ad fatigue scoring with refresh recommendations. |
| `/gomarble:meta-creative-strategy <acct>` | Winners and losers, patterns, test plan, and a 12-creative production spec. |
| `/gomarble:google-search-audit <acct>` | Daily Search briefing with brand vs non-brand, and CUT / FIX / SCALE. |
| `/gomarble:google-pmax-pulse <acct>` | 3-day vs 3-day PMax anomaly check, disciplined against overcorrection. |
| `/gomarble:google-search-term-audit <acct>` | Forensic search term waste audit with suggested negatives. |
| `/gomarble:google-impression-share <acct>` | Lost impression share: budget vs rank, gated on profitability. |

---

## Plans

A GoMarble account is required. MCP access is included in every plan.

- **Free:** 1 ad account per connector, 1 seat and 1 read-only agent. No card required.
- **Paid plans** add more accounts, seats and agents. Plans with write actions add approved changes (launch and edit campaigns, manage keywords, adjust budgets, pause ads) and agents that can make changes.

Paid plans come with a 7-day trial. See [gomarble.ai/pricing](https://www.gomarble.ai/pricing) for current plans and limits.

---

## Install

### Claude Code

```text
/plugin marketplace add https://github.com/gomarble-ai/marketing-agent.git
/plugin install gomarble@gomarble
/reload-plugins
```

Using the full HTTPS URL avoids SSH-key errors on machines where git rewrites GitHub URLs to SSH.

### Claude and Claude Cowork

Install **GoMarble** from the plugin directory once it's listed. You can also upload the plugin from your organization's plugin settings.

### Codex CLI

```bash
codex plugin marketplace add https://github.com/gomarble-ai/marketing-agent.git
```

Start Codex, open the **Plugins** panel, find **GoMarble**, and install. Then run `codex mcp login gomarble`.

### One command for both (npm)

```bash
npx marketing-agent
```

This runs the official install commands above on macOS, Linux and Windows, and removes an earlier `marketing-agent` install if there is one.

### Upgrading from `marketing-agent`

The plugin was renamed from `marketing-agent` to `gomarble`. If you installed it before, remove the old one first:

```text
/plugin uninstall marketing-agent@marketing-agent
/plugin marketplace remove marketing-agent
```

Then install as above. `npx marketing-agent` does this for you.

---

## Connect your ad accounts

1. The first time Claude uses GoMarble, you'll be asked to sign in. In Claude Code, run `/mcp`, pick the GoMarble server, and choose **Authenticate**. In Codex, run `codex mcp login gomarble`.
2. Log in at [apps.gomarble.ai](https://apps.gomarble.ai) with your work email.
3. Add your ad accounts and data sources at [apps.gomarble.ai/settings/integrations](https://apps.gomarble.ai/settings/integrations).
4. Come back and ask about your accounts.

**Already added GoMarble as a custom connector?** If you set it up by hand earlier (for example at `https://apps.gomarble.ai/mcp-api/sse`), you'll see two GoMarble connectors after installing the plugin. Remove the old custom one in your connector settings and keep the plugin's.

---

## Data and privacy

- **What the plugin runs locally:** nothing. It has no hooks and no local servers. It contains markdown skills and commands, and one connector setting. The `scripts/` folder holds maintainer tools that the plugin never runs.
- **What it connects to:** one remote MCP server, `https://apps.gomarble.ai/mcp-api/mcp`, over HTTPS. You sign in with OAuth. The plugin stores no credentials.
- **What data moves:** when Claude calls a GoMarble tool, GoMarble reads from the ad platforms and data sources you connected in your GoMarble account and returns the results to Claude. Tool requests and their results pass through GoMarble's servers. Approved changes are applied to your ad accounts by GoMarble through each platform's official API.
- **Access control:** Claude can only reach accounts your GoMarble login can reach, at the permission level your workspace grants. You can disconnect data sources in GoMarble, or disconnect the connector in Claude, at any time.

GoMarble's privacy policy: [gomarble.ai/privacy](https://www.gomarble.ai/privacy). Security: [gomarble.ai/security](https://www.gomarble.ai/security).

---

## Repo layout

```text
marketing-agent/
├── .claude-plugin/
│   ├── plugin.json          # Claude manifest (plugin name: gomarble)
│   └── marketplace.json     # marketplace for /plugin marketplace add
├── .codex-plugin/
│   └── plugin.json          # Codex manifest
├── .mcp.json                # GoMarble connector (Claude reads mcpServers, Codex reads mcp_servers)
├── commands/                # 8 slash commands (Claude Code)
├── skills/                  # 52 skills, read by both Claude and Codex
├── scripts/                 # maintainer tools: skill sync and coverage check
├── installer/install.mjs    # the npx installer
└── README.md
```

---

## Contributing

**GoMarble playbooks come from the server.** The Meta, Google Ads, TikTok, GA4, Shopify, Search Console and creative-research skills are synced from GoMarble's server-side skill catalog, the same source the connector's `load_skill` tool serves. Don't edit them here; change them on the server, then re-sync:

```bash
git -C ../mcp-server-sse show origin/main:ads-mcp-server/src/lib/langfuse/langfuse.json > /tmp/langfuse.json
node scripts/sync-server-skills.mjs /tmp/langfuse.json
node scripts/check-coverage.mjs
```

`scripts/skill-map.json` maps each server skill to a plugin skill. The sync adds frontmatter, rewrites server paths to plugin skill names, and adds a short note wherever the server text assumes GoMarble's own app.

**Every connector tool has a skill.** `scripts/check-coverage.mjs` fails if a tool in `scripts/connector-tools.json` isn't covered by a skill, or a skill names a tool the connector doesn't expose. Update that list when the connector's tools change.

**Other skills** (use cases, channels, creative strategy, business frameworks) live here. Keep each `SKILL.md` under about 3,000 words and put detail in `references/`.

Raise `version` in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` and `package.json` with every release.

---

## Support

- **Product and docs:** [gomarble.ai](https://www.gomarble.ai)
- **Issues and feature requests:** [github.com/gomarble-ai/marketing-agent/issues](https://github.com/gomarble-ai/marketing-agent/issues)
- **Account and billing:** [apps.gomarble.ai](https://apps.gomarble.ai)

<p align="center"><sub>© GoMarble. MIT licensed.</sub></p>
