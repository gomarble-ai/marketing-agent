# Winning Ads Skill Pack — Setup

This pack contains 6 Claude Skills:

1. `winning-ads-orchestrator.skill` — entry point, routes the full pipeline
2. `competitor-ad-intelligence.skill` — requires GoMarble MCP
3. `own-creative-diagnosis.skill` — MCP preferred, works from CSV/screenshots too
4. `creative-psychology-hooks.skill` — no data source needed
5. `winning-pattern-synthesis.skill` — synthesizes outputs of #2–4
6. `ad-brief-generator.skill` — turns synthesis into shoot-ready briefs

`winning-ads-skill-pack.md` has all six combined into a single reference document if you just want to read through the methodology without installing anything.

Two things to set up: **GoMarble MCP** (required for competitor intelligence and gives you live-data access for the rest), and **the skills themselves**.

---

## Before You Start: Connect Claude with GoMarble MCP

**1. Sign up**
Sign up on [GoMarble](https://apps.gomarble.ai/) using your work email.

**2. Add a Custom Connector**
Go to [Claude Integrations](https://claude.ai/settings/connectors) → **"Add Custom Connector"**.

**3. Add the following details**
- Name: `GoMarble AI`
- URL: `https://apps.gomarble.ai/mcp-api/sse`

**4. Finish setup**
Click **"Add"**, then **"Connect"**.

Without this connected, `competitor-ad-intelligence` cannot run — it has no fallback data source. The other skills will still work (own-creative-diagnosis can fall back to a CSV export; creative-psychology-hooks needs no data at all), but you'll be missing the competitive half of the pipeline.

---

## Adding the Skills to Claude

1. Go to [Claude](https://claude.ai/) → **Customize** → **Skills**
2. Click **"+"** → **Create skill** → **Upload a skill**
3. Upload the skill files (`.skill`), one at a time

Repeat for all six. Once uploaded, they trigger automatically based on what you ask for — you don't need to name them. For example:

- *"Find me winning ad ideas for [brand/category]"* → triggers `winning-ads-orchestrator`, which runs the full pipeline
- *"What is [competitor] running right now?"* → triggers `competitor-ad-intelligence` directly
- *"Why isn't this ad performing?"* → triggers `own-creative-diagnosis`
- *"Give me hook ideas for [product]"* → triggers `creative-psychology-hooks`

## Recommended install order

If you're uploading one at a time and want to test as you go:

1. `creative-psychology-hooks` — no dependencies, test it standalone first
2. `own-creative-diagnosis` — test against a live account (needs GoMarble MCP connected, or a Meta Ads Manager CSV export)
3. `competitor-ad-intelligence` — needs GoMarble MCP connected
4. `winning-pattern-synthesis` — needs at least one of #2/#3 to have run in the conversation to have something to synthesize
5. `ad-brief-generator` — needs #4's output, or a single hook from #1
6. `winning-ads-orchestrator` — install last; it assumes the other five are all present and routes between them

## Troubleshooting

- **Competitor intel skill won't trigger / says it can't run**: GoMarble MCP isn't connected in this session. Check Claude → Settings → Connectors, and re-authorize if it shows disconnected.
- **Own-creative-diagnosis is giving generic answers with no real numbers**: it has no data source. Either connect GoMarble MCP, or export a CSV from Meta Ads Manager and share it directly in the chat.
- **Orchestrator skips a step silently**: check its recap paragraph at the top of the response — it states explicitly which steps ran and which were skipped and why (usually a missing data source).
