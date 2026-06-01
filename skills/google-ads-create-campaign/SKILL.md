---
name: google-ads-create-campaign
description: "Use when creating a Google Ads campaign. Loaded after the create master skill."
---
# Google Ads — Create / Update Campaign

Tools: `google_ads_propose_create_campaign`, `google_ads_propose_update_campaigns`. The tool schemas describe shape and types; this skill covers the business rules they don't.

## CRITICAL: Do NOT combine with other creation steps
Each entity type has its own propose call. Capture new campaign IDs from the execution result before moving to ad-group.

## Status Convention

- **At create:** always `ENABLED`. The spend gate is the **ad** layer (see `ad`), not the campaign.
- **On update:** only flip between `ENABLED` and `PAUSED`. Don't propose `REMOVED` — we don't expose entity removal.

## V1 Capability Surface

- `advertising_channel_type`: `SEARCH` only.
- `bidding_strategy_type`: `MAXIMIZE_CLICKS`, `MAXIMIZE_CONVERSIONS`, `MAXIMIZE_CONVERSION_VALUE`, `TARGET_CPA`, `TARGET_ROAS`, `TARGET_SPEND`, `MANUAL_CPC`.

## Auto-Detect Before Proposing (GAQL probes)

| Need | Probe |
|---|---|
| Currency for budget | `SELECT customer.currency_code FROM customer` |
| Smart-bidding eligibility | `SELECT customer.conversion_tracking_setting.conversion_tracking_status FROM customer` |
| Reusable budget | `SELECT campaign_budget.id, campaign_budget.name FROM campaign_budget WHERE campaign_budget.status = 'ENABLED'` |

## Bidding Rules

- **Smart bidding requires conversion tracking.** If `conversion_tracking_status` is `NOT_CONVERSION_TRACKED` and the user requested `TARGET_CPA` / `TARGET_ROAS` / `MAXIMIZE_CONVERSIONS` / `MAXIMIZE_CONVERSION_VALUE`, fall back to `MAXIMIZE_CLICKS` and tell the user once: "Account has no conversion tracking — switching to Maximize Clicks. Set up conversion tracking to use smart bidding."
- `target_cpa` only applies under `TARGET_CPA` or `MAXIMIZE_CONVERSIONS`.
- `target_roas` only applies under `TARGET_ROAS` or `MAXIMIZE_CONVERSION_VALUE`.
- Never set both `target_cpa` and `target_roas` on the same campaign.

## Budget & Date Guardrails

- **Below currency floor** (USD: $0.01, INR: ₹1) → block, cite the floor.
- **Below $5 USD equivalent** → warn: "Very low budget; learning may stall."
- **`end_date` after 2037-12-30** → block, cite Google's sentinel.
- **`end_date` ≤ `start_date`** → block.
- Pass `daily_budget` as a number; the propose tool converts to micros.

## Direct Campaign-Level Negatives (create)

`negative_keywords[]` seeds CampaignCriterion negatives at creation time. Two non-schema rules:
- Case-insensitive dedupe on `(text, match_type)` — duplicates rejected.
- For negatives shared across multiple campaigns, route to `google-ads-create-negative-keyword-list` instead.

## Update Semantics

The schema enumerates which fields are mutable. Notable extra rules:
- `daily_budget` updates flow through the linked CampaignBudget (one CampaignBudget can back multiple campaigns; an update affects all of them).
- `bidding_strategy_type` switches reset learning — warn the user once before proposing.
- `geo_changes[]` and `negative_keyword_changes[]` are **add-only** in this skill set. We don't expose criterion removal — if the user wants to undo a geo target or campaign-level negative they previously added, tell them to manage it in the Google Ads UI.

## Error Handling

| `error_code` | Meaning | Fix |
|---|---|---|
| 601 | Validator rejected the payload | Read `validation_errors[]`, fix the root cause, re-propose once |
| 403 / `PLATFORM_API_FAILURE` | Google rejected — usually policy / permission | Surface to user; needs Ads UI fix |

## Output After Execution

> Done. Created campaign `<name>` (id `<id>`) ENABLED, daily budget `<currency> <amount>`, bidding `<strategy>`. (No spend yet — ads under it are PAUSED until enabled.)

One line per campaign in batched calls.
