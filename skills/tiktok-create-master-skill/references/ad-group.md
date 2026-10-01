<!-- Synced from GoMarble server skill: prompts/skills/tiktok/create/ad-group -->

# TikTok Ads — Create Ad Group

## This skill defines the `adgroup` SLOT of the launch call

The whole launch is ONE call to `tiktok_propose_create_campaign_structure`. This
skill covers the `adgroup` object. **ONE ad group per call.** Include the slot
only when creating a NEW ad group; to attach ads to an existing one, pass
top-level `adgroup_id` instead and omit this slot.

---

## Placement — decide first, it is permanent

`placement_type` and `placements` **cannot be updated after the ad group is
created**. Getting them wrong means building a new ad group.

**`placement_type` is required.** TikTok's own default is
`PLACEMENT_TYPE_NORMAL`, which then requires `placements` — so omitting both
fails at create time.

- `PLACEMENT_TYPE_AUTOMATIC` — TikTok allocates across surfaces.
  **Do NOT also send `placements`.** When automatic, the array is *ignored and
  overwritten*. Sending both produces an ad group that does not use the
  placements you named, with no warning. (This is exactly how a "Pangle" ad group
  ended up on TikTok feed and rejected its image ad.)
- `PLACEMENT_TYPE_NORMAL` — you choose. `placements` is required.

**Valid values:** `PLACEMENT_TIKTOK`, `PLACEMENT_PANGLE`,
`PLACEMENT_GLOBAL_APP_BUNDLE`. `PLACEMENT_TOPBUZZ` and `PLACEMENT_HELO` are
deprecated — never send them (they still appear in `allowed_placements` on
video-upload responses; ignore that).

**Choose from the creative:**

| Creative | placement_type | placements |
|---|---|---|
| Video / carousel | `PLACEMENT_TYPE_AUTOMATIC` | omit |
| Video, TikTok only | `PLACEMENT_TYPE_NORMAL` | `["PLACEMENT_TIKTOK"]` |
| **Single image** | `PLACEMENT_TYPE_NORMAL` | `["PLACEMENT_PANGLE"]` or `["PLACEMENT_GLOBAL_APP_BUNDLE"]` |

Other placement constraints:
- `PRODUCT_SALES` supports **TikTok placement only**.
- Global App Bundle does not support `optimization_goal: TRAFFIC_LANDING_PAGE_VIEW`.
- Global App Bundle on Auction Reach is allowlist-only.

---

## Locations — verify, never assume

**Always confirm the countries are eligible for the chosen placement before
proposing.** Call `/tool/region/` with `placements` + `objective_type`
(`level_range: TO_COUNTRY`) and use only IDs it returns.

TikTok reaches ~65 countries; **Pangle and Global App Bundle reach far fewer**,
and the set depends on the ad account's registration market. On a typical account
Pangle excludes the **US and UK** while including Canada, Australia, Japan,
Singapore, UAE and others. Documentation lists are stale — the endpoint is the
only trustworthy source.

If the targeted countries have no inventory on the placement, TikTok rejects with
*"your TikTok audience in <region> must increase to over 1000"*. That is **not**
an audience-size problem and adding more countries will not fix it — the
placement or the country list is wrong.

Other rules:
- `location_ids` or `zipcode_ids` is required; combined max 3,000.
- **Overlapping locations are not supported** — you cannot target the US and
  California together.
- `zipcode_ids` is TikTok-placement only, and is unavailable with special ad
  categories or `RF_REACH`.

---

## Shopping / catalog ad groups (`PRODUCT_SALES` only)

`shopping_ads_type` is **required when the campaign objective is
`PRODUCT_SALES`, and rejected on every other objective.** Don't send it on a
TRAFFIC or WEB_CONVERSIONS ad group.

**Ad-group values: `VIDEO` | `LIVE` | `PRODUCT_SHOPPING_ADS`.**
⚠️ This is a *different enum from the campaign-level* `shopping_ads_type` on
GMV_MAX campaigns, which takes `PRODUCT` | `LIVE`. Same field name, same launch
call, different valid values depending on the slot. Sending `PRODUCT` here (or
`VIDEO` there) fails validation.

`product_source`: `UNSET` | `CATALOG` | `STORE` | `SHOWCASE`.

Conditional rules:
- `catalog_id` is required when `product_source` is `CATALOG` **or `STORE`** —
  not just CATALOG. Get it from `tiktok_list_catalogs` (`resource: CATALOG`).
- `store_authorized_bc_id` is required whenever `store_id` is passed.
- An identity (`identity_type` + `identity_id`) is required on the ad group when
  `shopping_ads_type` is `LIVE`, or `VIDEO` + `product_source: SHOWCASE`.
- **TikTok placement only** — `PRODUCT_SALES` never runs on Pangle or Global App
  Bundle, so a catalog ad group can never carry a single-image ad.

For the catalog *ad* fields (`product_specific_type`, `sku_ids`,
`product_set_id`) the ad group must be `shopping_ads_type: VIDEO` +
`product_source: CATALOG` — see the ad skill.

---

## Fields that only work on certain placements

Sending these on the wrong placement is rejected or silently dropped.

- **TikTok only:** `tiktok_subplacements` (and only for REACH / VIDEO_VIEWS /
  ENGAGEMENT, with `placements: ["PLACEMENT_TIKTOK"]` + NORMAL),
  `brand_safety_type`, `brand_safety_partner`, `category_exclusion_ids`,
  `vertical_sensitivity_id`, `inventory_filter_enabled`, `zipcode_ids`,
  `share_disabled`, `spending_power`. `action_category_ids` needs TikTok as the
  *only* placement.
- **Pangle only:** `blocked_pangle_app_ids`,
  `included_pangle_audience_package_ids`, `excluded_pangle_audience_package_ids`
  (never send included + excluded together), `next_day_retention`.
- **Not with Global App Bundle alone:** `isp_ids`.
- `contextual_tag_ids` is unsupported when `brand_safety_type` is `THIRD_PARTY`.

`search_result_enabled` **auto-enables to true** for APP_PROMOTION /
WEB_CONVERSIONS / TRAFFIC / LEAD_GENERATION on TikTok or automatic placement.
Pass `false` explicitly if the user does not want Search Ads.

---

## Required fields

- `adgroup_name`, `promotion_type` (e.g. `WEBSITE`)
- `budget_mode` + `budget`
- `schedule_type` + `schedule_start_time` (**"YYYY-MM-DD HH:MM:SS" UTC** —
  `SCHEDULE_FROM_NOW` still requires the start time)
- `optimization_goal`, `billing_event`, `bid_type`, `pacing`
- `location_ids`
- `pixel_id` + `optimization_event` when optimizing for `CONVERT` / `VALUE`
- `operation_status: "DISABLE"` — always propose paused

`promotion_type` is required for TRAFFIC / WEB_CONVERSIONS / APP_PROMOTION /
LEAD_GENERATION ad groups; REACH, VIDEO_VIEWS and ENGAGEMENT are exempt.

---

## Slot Shape

```json
{
  "adgroup_name": "Prospecting — Pangle image",
  "promotion_type": "WEBSITE",
  "placement_type": "PLACEMENT_TYPE_NORMAL",
  "placements": ["PLACEMENT_PANGLE"],
  "location_ids": ["6251999"],
  "budget_mode": "BUDGET_MODE_DAY",
  "budget": 25,
  "schedule_type": "SCHEDULE_FROM_NOW",
  "schedule_start_time": "2026-08-07 00:00:00",
  "optimization_goal": "CONVERT",
  "optimization_event": "SHOPPING",
  "pixel_id": "…",
  "billing_event": "OCPM",
  "bid_type": "BID_TYPE_NO_BID",
  "pacing": "PACING_MODE_SMOOTH",
  "gender": "GENDER_UNLIMITED",
  "age_groups": ["AGE_25_34", "AGE_35_44"],
  "operation_status": "DISABLE"
}
```
