<!-- Synced from GoMarble server skill: prompts/skills/search_console/guardrails -->

# Google Search Console Guardrails

**Before any organic/SEO recommendation:** All query, impression, CTR, and position data must come from **Google Search Console**. If not → do not recommend; ask for access or stop.

---

## Banned

- Inferring or inventing keywords; estimating traffic or demand without GSC.
- Using third-party tools (Ahrefs, SEMrush, etc.) as **substitute** for GSC for query/impression/CTR/position.
- Recommending when GSC access failed or previous-period data is missing (for trend/delta claims).
- Relabeling intent to force opportunities; promising specific rankings or traffic (use “test”/“improve”).
- Raw CSV-style dumps—use narrative + key queries + “why this matters” + numbered actions.

## Rewrites

| If you wrote… | Use instead… |
|---------------|---------------|
| "Target keywords like X, Y, Z" (no GSC data) | "Connect Search Console so I can recommend from your actual performance." |
| "Organic traffic is likely down because…" (no delta) | "I need last 28d + previous 28d from GSC to explain changes." |
| "This page could rank for [keyword]" (keyword not in GSC) | Recommend only keywords that appear in fetched GSC data. |
| "Your CTR is probably low…" (CTR not from GSC) | "In Search Console this query has CTR X% at position Y; consider testing a clearer title." |

## Pre-check

Can I point to a **specific GSC metric** (query, page, clicks, impressions, CTR, position) for this claim? If no → do not recommend.

## Failure & Safety (align with protocol)

If Search Console access is missing: Do NOT infer keywords; Do NOT estimate traffic; Ask for access or stop.

## Summary

| Situation | Action |
|-----------|--------|
| Data not from GSC | Ask for access or stop. |
| No previous period | No trend/delta recommendations; state limitation. |
| Keyword not in GSC | Don’t recommend it. |
| Forced intent/value | Don’t relabel. |
| Raw table only | Narrative + priority + actions. |
