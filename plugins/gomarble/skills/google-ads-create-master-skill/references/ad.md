<!-- Synced from GoMarble server skill: prompts/skills/google_ads/create/ad -->

# Google Ads — Create / Update Ad (RSA)

Tools: the `ads` array of `google_ads_propose_create_campaign_structure` (create), `google_ads_propose_update_ads` (update). Tool schemas describe shape; this skill covers the business rules.

## Parent linkage
Creating the ad group in the SAME launch call → do NOT set `adgroup_id` anywhere; the server links via temp IDs inside the atomic mutate. Attaching to an EXISTING ad group → pass top-level `adgroup_id` on the launch call. All ads in one call land in that call's SINGLE ad group — ads for different ad groups need separate calls. Batch all ads for the ad group into the one `ads` array; never one call per ad.

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
- Headline/description pinning IS supported: pass objects instead of strings — `{ "text": "...", "pinned_field": "HEADLINE_1" }` (HEADLINE_1–3) or `{ "text": "...", "pinned_field": "DESCRIPTION_1" }` (DESCRIPTION_1–2). Plain strings are fine when nothing needs pinning.

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
