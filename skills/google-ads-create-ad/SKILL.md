---
name: google-ads-create-ad
description: "Use when creating a Google Ads ad (RSA, expanded text, etc.). Loaded after the create master skill."
---
# Google Ads — Create / Update Ad (RSA)

Tools: `google_ads_propose_create_ad`, `google_ads_propose_update_ads`. Tool schemas describe shape; this skill covers the business rules.

## CRITICAL: Parent ad group must exist
Capture `ad_group_id` from the previous propose-create-adgroup execution result. Never invent it.

## V1 Capability Surface

- `ad_type`: `RESPONSIVE_SEARCH_AD` only. No expanded text ads, no display, no DSA.

## Status Convention

- **At create:** always `PAUSED`. Ads are the user's final spend gate.
- **On enable:** separate explicit propose call (`propose_update_ads` setting `status: ENABLED`).
- **On update:** flip between `ENABLED` and `PAUSED` only. No removal.

## Non-Schema Rules

- Headlines and descriptions are case-insensitive deduped on the trimmed text. "Boost ROAS" and "boost roas" count as duplicates and reject.
- `path2` requires `path1`. The path fields live on `responsive_search_ad`, not the Ad root — the propose tool handles placement, but agent should not invent its own path-only payload.
- URLs must be http(s). `javascript:`, `data:`, and other non-http schemes reject up front.
- No headline pinning via this tool — pinning is set in the Ads UI after creation.

## Update Semantics

- RSAs are largely immutable in Google Ads — most "edits" actually create a new ad behind the scenes. Prefer a fresh ad + pause the old when the user wants substantively different copy. Edits that go through `propose_update_ads` may reset learning.
- `headlines[]` and `descriptions[]` updates are full-replacement — provide the complete final list, not a delta.

## Error Handling

| `error_code` | Trigger | Fix |
|---|---|---|
| 601 | Headline / description length, count out of range, case-insensitive dupe, `path2` without `path1`, non-http URL | Read `validation_errors[]`, fix, re-propose |
| 403 | Ad policy violation (trademark, restricted vertical, landing page issues) | Surface — user must address in Ads UI |

## Output After Execution

> Done. Created RSA in ad group `<adgroup_name>` (ad id `<id>`). PAUSED — enable when ready.
