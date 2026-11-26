<!-- Synced from GoMarble server skill: prompts/skills/tiktok/create/campaign -->

# TikTok Ads — Create Campaign

## This skill defines the `campaign` SLOT of the launch call

The whole launch is ONE call to `tiktok_propose_create_campaign_structure`. This
skill covers the `campaign` object. Include it only when creating a NEW campaign;
to launch under an existing one, pass top-level `campaign_id` and omit this slot.

---

## Objective — pick it from the creative and the goal

Supported for standard launches: **`TRAFFIC`**, **`WEB_CONVERSIONS`**,
**`PRODUCT_SALES`**.

- `TRAFFIC` — clicks / landing page views. Simplest, no pixel needed.
- `WEB_CONVERSIONS` — pixel + conversion event. The default for e-commerce.
- `PRODUCT_SALES` — catalog or store driven. **TikTok placement only**, and
  `campaign_product_source` is **required**: `CATALOG` | `STORE` | `SHOWCASE`.
  For `CATALOG`, confirm a catalog actually exists first
  (`tiktok_list_catalogs`, `resource: CATALOG`) — we cannot create one.

The objective constrains the ad group: `PRODUCT_SALES` cannot use Pangle or
Global App Bundle, so it can never carry a single-image ad. It also makes
`shopping_ads_type` required on the ad group — see the ad-group skill.

---

## Budget

- `budget_mode` — `BUDGET_MODE_DAY` or `BUDGET_MODE_TOTAL`; `budget` in the
  **advertiser's currency** (e.g. `50` for $50), never micros. Pass
  `currency_code` at the top level from `tiktok_get_account_details`.
- Campaign budget is optional when each ad group carries its own. Do not set both
  unless the user asked for campaign-level pacing.

---

## Name

`campaign_name` — required. Max 512 characters, **no emoji**. CJK characters
count double against the limit. Mirror the account's existing naming convention
when one is evident.

---

## Status

`operation_status: "DISABLE"` — always propose paused. TikTok's default is
`ENABLE`, which means live spend the moment the structure is approved.

Exception: Reach & Frequency (`RF_REACH`) campaigns cannot be created paused;
the server forces `ENABLE` for those.

---

## Smart+ / GMV Max

`campaign_type: "GMV_MAX"` is a **campaign-only** structure — no ad group, no
ads; TikTok manages delivery. Send the `campaign` slot alone.

Always required: `request_id` (any unique idempotency string), `store_id`,
`store_authorized_bc_id`, `shopping_ads_type`, `optimization_goal: "VALUE"`,
`deep_bid_type: "VO_MIN_ROAS"` + `roas_bid`, budget, and `schedule_type`
(+ `schedule_start_time`).

**`shopping_ads_type` here is `PRODUCT` | `LIVE`** — *not* the ad-group enum
(`VIDEO` | `LIVE` | `PRODUCT_SHOPPING_ADS`). Same field name, different slot,
different values.

Then, conditionally:

| Condition | Also required |
|---|---|
| `shopping_ads_type: PRODUCT` | `product_video_specific_type`: `AUTO_SELECTION` \| `CUSTOM_SELECTION` |
| `shopping_ads_type: LIVE` | `identity_list` |
| `PRODUCT` + `product_video_specific_type: CUSTOM_SELECTION` | `item_list` |
| `PRODUCT` + `product_specific_type: CUSTOMIZED_PRODUCTS` | `item_group_ids` (SPU ids) |

`product_specific_type` on GMV_MAX is only **`ALL` | `CUSTOMIZED_PRODUCTS`** —
`PRODUCT_SET` is valid at the *ad* level for catalog ads, not here.

GMV Max also needs the **Onsite Commerce Store** permission on the connection —
without it `/store/list/` returns 40001 and the store IDs cannot be resolved at
all. Resolve them with `tiktok_list_catalogs` (`resource: STORE`).

For a single-image launch, keep Smart+ **off**: the single-image flow requires a
regular campaign (`is_smart_performance_campaign: false`).

---

## Slot Shape

```json
{
  "campaign_name": "Beard Care — Prospecting",
  "objective_type": "WEB_CONVERSIONS",
  "budget_mode": "BUDGET_MODE_DAY",
  "budget": 50,
  "operation_status": "DISABLE"
}
```
