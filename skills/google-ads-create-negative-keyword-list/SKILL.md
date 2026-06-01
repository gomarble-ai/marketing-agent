---
name: google-ads-create-negative-keyword-list
description: "Use when creating a Google Ads shared negative keyword list. Loaded after the create master skill."
---
# Google Ads — Create / Update Shared Negative Keyword List

Tools: `google_ads_propose_create_negative_keyword_list`, `google_ads_propose_update_negative_keyword_list`. Tool schemas describe shape; this skill covers the business rules.

## When to use this vs campaign-level negatives

| You want | Use |
|---|---|
| Negatives that apply to a single campaign only | `negative_keywords[]` on `propose_create_campaign`, or `negative_keyword_changes[]` on `propose_update_campaigns`. See `google-ads-create-campaign`. |
| Negatives shared across multiple campaigns | This skill (Shared Negative Keyword List / SharedSet). |

## Create — One-Shot Pattern

A single propose call creates the SharedSet, populates it with criteria, and (optionally) attaches it to one or more campaigns. Single approval covers all three steps. If the user says "create a list with negatives `<list>` and attach to campaigns `<a>` and `<b>`", do it in one call.

## Non-Schema Rules

- Set `name` is unique under the customer — duplicate names reject.
- Case-insensitive dedupe on `(text, match_type)` within `keywords[]`.
- `attach_to_campaigns[]` IDs must reference existing SEARCH / SHOPPING / PMax campaigns. Probe before proposing if the user gave names instead of IDs.

## Update Semantics

- `criteria_changes[]` is **add-only** in this skill set. We don't expose criterion removal from a SharedSet — if the user wants to drop a single negative from a list, tell them to manage it in the Google Ads UI.
- `campaign_changes[]` supports both ATTACH and DETACH. DETACH requires `campaign_shared_set_id` (the link's resource ID), not the campaign ID. Probe before proposing.
- No soft-delete of the SharedSet itself. To stop using a list entirely, DETACH it from all campaigns instead.

## GAQL Probes

When the user supplies a SharedSet by name, or needs the link ID for DETACH:

```
SELECT shared_set.id, shared_set.name FROM shared_set WHERE shared_set.status = 'ENABLED'

SELECT campaign_shared_set.shared_set, campaign_shared_set.campaign, campaign_shared_set.resource_name
FROM campaign_shared_set
WHERE shared_set.id = <shared_set_id>
```

Take `campaign_shared_set.resource_name`'s last numeric segment as the `campaign_shared_set_id` for DETACH.

## Output After Execution

Create:
> Done. Created shared list "<name>" (id `<id>`) with `<n>` keywords. Attached to campaigns: `<list>`.

Update:
> Done. Updated shared list "<name>" — added `<n>` keywords, attached to `<x>` campaign(s), detached from `<y>` campaign(s).
