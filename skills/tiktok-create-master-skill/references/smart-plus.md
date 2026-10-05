<!-- Synced from GoMarble server skill: prompts/skills/tiktok/create/smart-plus -->

> **In Claude.** This methodology is GoMarble's own, kept in sync with the GoMarble connector.
> - Where this says changes appear as approval cards or rows: in Claude, call the propose tool with `mode: "dryrun"` first. That validates the change without touching the account. Show the user each proposed change (entity, current value, new value), and only after an explicit yes call the same tool with `mode: "live"` and just the approved `operation_ids`.

# TikTok Ads — Upgraded Smart+

## The two tools

- **`tiktok_get_smart_plus`** — reads (entity CAMPAIGN | ADGROUP | AD, action
  GET; CHECK_COPY_TASK). Immediate, no approval.
- **`tiktok_propose_manage_smart_plus`** — every write (CREATE / UPDATE /
  UPDATE_STATUS / UPDATE_BUDGETS / COPY). Approval card first; nothing reaches
  TikTok until the user approves.

Smart+ entities live on a PARALLEL endpoint tree — the regular
`tiktok_get_campaigns` / propose tools never see them, and vice versa.

## Payload rules the docs do not state (all verified live)

**CAMPAIGN CREATE**
- `request_id` must be **NUMERIC DIGITS** (e.g. a timestamp `"20260807133801"`).
  Any other format → 40002. Reuse the same value on retry — it is the
  idempotency key.
- `sales_destination` (e.g. `"WEBSITE"`) is **required** for WEB_CONVERSIONS.
- Even a successful create reads back `campaign_type: REGULAR_CAMPAIGN` on
  accounts not enabled for true Upgraded Smart+ — that readback is the signal
  the account enablement is missing, not a bug in your call.

**ADGROUP CREATE**
- Targeting fields (`location_ids`, `age_groups`, `gender`, `spending_power`,
  brand safety…) must be **nested under `targeting_spec`** — flat top-level
  targeting is rejected.
- `schedule_start_time` and a NUMERIC `request_id` are required.
- With `bid_type: BID_TYPE_CUSTOM` the budget must be
  **`BUDGET_MODE_INFINITE` / 0** — budget lives on the campaign.

**AD CREATE**
- Parallel lists, NOT the regular /ad/create/ body: creative fields inside
  `creative_list[].creative_info`; the video is `video_info.video_id`; the
  cover is `image_info[].web_uri`; ad_text / call_to_action /
  landing_page_url each wrapped in their own `*_list`.
- The **Spark identity lives INSIDE `creative_info`** (`identity_type`,
  `identity_id`, `identity_authorized_bc_id`). Putting it in
  `ad_configuration` returns *"Creative error. Verify that your identity
  matches your selected TikTok posts"* — the asset is fine, the slot is wrong.
- **CTA wall**: `call_to_action_list` (1–3 entries) is the required shape, but
  accounts not fully enabled for Upgraded Smart+ reject EVERY value with
  *"The call to action you have selected is not supported"*. If that repeats
  across different CTA values, STOP — it is an account-level restriction a
  TikTok representative must lift. Do not iterate CTA values.

**UPDATE_BUDGETS (ADGROUP)**
- Shape: `{adgroup_ids: [...], budget: [{adgroup_id, budget}]}` — `budget` is
  an ARRAY OF OBJECTS. The error trail for every other shape: no adgroup_ids →
  `AdgIds is nil`; scalar budget → `must be set to array`; `[10]` →
  `budget.0 must be set to object`.
- Platform rule: budget controls only work with **maximum-delivery /
  highest-value bidding** — a `BID_TYPE_CUSTOM` ad group rejects them.

**COPY**
- **Allowlist-gated per account** (*"Copy API is an allowlist-only feature"*),
  on BOTH the Smart+ and the regular campaign-copy endpoints. If that error
  appears, stop and say the account needs copy access from its TikTok
  representative.

## Account-enablement gates to recognize (not payload problems)

| Error | Meaning |
|---|---|
| CTA *"not supported"* across all values | Account not enabled for Upgraded Smart+ ads |
| *"Copy API is an allowlist-only feature"* | Campaign copy not granted to this advertiser |
| `campaign_type: REGULAR_CAMPAIGN` readback | Smart+ enablement missing — chain will hit the CTA wall |

## Posture

- CREATE/COPY default to `operation_status: DISABLE` (paused) — TikTok's own
  default is ENABLE, i.e. live spend on approval.
- A delivering Smart+ campaign needs campaign → ad group → ad, proposed in
  that order, threading returned IDs. Reads via `tiktok_get_smart_plus`
  supply `current_state` for before/after cards on updates.
