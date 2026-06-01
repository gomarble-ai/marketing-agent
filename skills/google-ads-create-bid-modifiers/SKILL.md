---
name: google-ads-create-bid-modifiers
description: "Use when adjusting Google Ads bid modifiers (device, location, audience). Loaded after the create master skill."
---
# Google Ads — Update Bid Modifiers / Ad Schedule

Tool: `google_ads_propose_update_bid_modifiers`. Tool schema describes shape; this skill covers the business rules.

## What this covers

Adjust bid modifiers and ad-schedule criteria on an existing campaign or ad group. Supported `target_type`s: `DEVICE`, `AD_SCHEDULE`, `LOCATION`, `AGE_RANGE`. Each criterion is created automatically when you ADD a modifier on a target that doesn't have one yet.

There is no separate create tool — ADD on a new target IS the create.

## Non-Schema Rules

- **`bid_modifier = 0` is allowed only for `DEVICE`** (opt-out of that device). Setting 0 on `AD_SCHEDULE` / `LOCATION` / `AGE_RANGE` rejects.
- **`bid_modifier` range:** 0.1 – 10.0 (inclusive). Anything outside rejects.
- **AD_SCHEDULE per-day cap:** ≤ 6 entries per day per parent. The 7th rejects.
- **AD_SCHEDULE minute enum:** only `ZERO`, `FIFTEEN`, `THIRTY`, `FORTY_FIVE`. Other values reject.
- **One target per change:** don't combine `device` + `ad_schedule` (etc.) in the same change item.

## Pure Dayparting (no bid multiplier)

To restrict serving to a window without changing bids, omit `bid_modifier` on the AD_SCHEDULE entry. Google interprets this as "serve only during these schedules." Useful for "only run weekdays 9–5" requests.

## Undoing a Bid Modifier

We don't expose entity removal, but bid modifiers are criterion-level — to undo an effect:

- For `DEVICE` / `LOCATION` / `AGE_RANGE`: UPDATE the change to `bid_modifier = 1.0` (neutral — no boost, no cut).
- For pure-dayparting `AD_SCHEDULE`: UPDATE to set a neutral `bid_modifier = 1.0` to preserve the schedule but stop adjusting bids; if the user wants to remove the schedule restriction entirely, that requires criterion deletion which this skill doesn't expose — tell the user to manage it in the Ads UI.

## GAQL Probes

When you need an existing criterion's id (to UPDATE):

```
SELECT campaign_criterion.criterion_id, campaign_criterion.type, campaign_criterion.bid_modifier
FROM campaign_criterion
WHERE campaign.id = <campaign_id> AND campaign_criterion.bid_modifier IS NOT NULL
```

Or `ad_group_criterion` for ad-group-scoped modifiers.

## Output After Execution

> Done. Updated bid modifiers on campaign `<name>`: +20% MOBILE, +30% AD_SCHEDULE Mon-Fri 9-5.
