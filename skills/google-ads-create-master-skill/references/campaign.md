<!-- Synced from GoMarble server skill: prompts/skills/google_ads/create/campaign -->

# Google Ads — Create / Update Campaign

Tools: the `campaign` slot of `google_ads_propose_create_campaign_structure` (create), `google_ads_propose_update_campaigns` (update). The tool schemas describe shape and types; this skill covers the business rules they don't.

## Create = one SLOT of one call
Campaign, ad group and ads are created in ONE `google_ads_propose_create_campaign_structure` call (atomic — all or nothing). The `campaign` slot is a single object; never capture/thread IDs between create steps. Pass top-level `campaign_id` (instead of the slot) only when attaching new children to an EXISTING campaign.

## Status Convention

- **At create:** always `ENABLED`. The spend gate is the **ad** layer (see `ad`), not the campaign.
- **On update:** only flip between `ENABLED` and `PAUSED`. Don't propose `REMOVED` — we don't expose entity removal.

## V1 Capability Surface

- Campaign type: `SEARCH` only — the create slot's input key is `campaign_type` (the GAQL read field is `campaign.advertising_channel_type`).
- `bidding_strategy_type` (create): `MAXIMIZE_CLICKS` (alias — the server normalizes it to `TARGET_SPEND`), `TARGET_SPEND`, `MAXIMIZE_CONVERSIONS`, `MAXIMIZE_CONVERSION_VALUE`, `TARGET_CPA`, `TARGET_ROAS`. `MANUAL_CPC` is **update-only** — the create call rejects it.

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

- **Below the propose-layer floor** (~0.01 in account currency) → block. Google's own server may enforce higher per-currency minimums on top.
- **Below $5 USD equivalent** → warn: "Very low budget; learning may stall."
- **`end_date` after 2037-12-30** → block, cite Google's sentinel.
- **`end_date` before `start_date`** → block (same-day start/end is allowed).
- Pass `daily_budget` as a number; the propose tool converts to micros.

## Direct Campaign-Level Negatives (create)

`negative_keywords[]` seeds CampaignCriterion negatives at creation time. Two non-schema rules:
- Case-insensitive dedupe on `(text, match_type)` — duplicates rejected.
- For negatives shared across multiple campaigns, route to `references/negative-keyword-list.md` instead.

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
