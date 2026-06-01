---
name: google-ads-create-ad-group
description: "Use when creating a Google Ads ad group. Loaded after the create master skill."
---
# Google Ads — Create / Update Ad Group

Tools: `google_ads_propose_create_adgroup`, `google_ads_propose_update_adgroups`. Tool schemas describe shape; this skill covers the business rules.

## CRITICAL: Parent campaign must exist
Capture `campaign_id` from the prior propose-create-campaign execution result. Never invent it.

## Status Convention

- **At create:** always `ENABLED`. The spend gate is at the **ad** layer.
- **On update:** flip between `ENABLED` and `PAUSED` only. No removal.

## V1 Capability Surface

- `adgroup_type`: `SEARCH_STANDARD` only.

## Keyword Rules (non-schema)

- Per-ad-group positive count is capped at 30 in V1 — if the user gives more, propose splitting across multiple ad groups in one batched call rather than truncating.
- Case-insensitive dedupe on `(text, match_type)` across both `keywords[]` and `negative_keywords[]`.

## Update Semantics

- `cpc_bid_micros` only affects serving when the parent campaign uses `MANUAL_CPC`. On smart-bidding campaigns it's a no-op — tell the user.
- Keyword-level changes (`PAUSE` / `ENABLE` / `CHANGE_MATCH_TYPE`) require `criterion_id`. We don't expose keyword removal — to stop a keyword from serving, PAUSE it. If the user named the keyword instead of giving an ID, probe first:

```
SELECT ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status
FROM ad_group_criterion
WHERE ad_group.id = <adgroup_id> AND ad_group_criterion.type = 'KEYWORD'
```

- Audience attach requires a fully-qualified `resource_name` (e.g. `customers/<cid>/userLists/<id>`). Probe via `SELECT user_list.resource_name, user_list.name FROM user_list` if the user gave a list name.

## Error Handling

| `error_code` | Trigger | Fix |
|---|---|---|
| 601 | Empty keywords, dupe, count >30, schema validation | Read `validation_errors[]` |
| 403 | Parent campaign suspended, ad-group-name dupe within campaign | Surface to user — needs Ads UI fix |

## Output After Execution

> Done. Created ad group `<name>` (id `<id>`) under campaign `<campaign_name>` with `<n>` keywords. ENABLED.
