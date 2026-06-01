---
name: meta-agent-operations
description: "Use when proposing or executing Meta Ads changes: propose/execute workflow, campaign/adset/ad update rules, currency in cents."
---
---
path: meta-agent-operations
label: production
version: 1
chars: 4824
estimated_tokens: ~1206
fetched_at: 2026-03-16T05:33:37.413Z
---

# Meta Ads - Agent Operations

Rules for proposing and executing changes on Meta Ads via propose/execute tools.

## General Workflow
1. Describe the intended change in plain language to the user
2. Call the appropriate propose tool to create pending operations
3. Wait for user approval (up to 2.5 minutes active, then approvable via panel for 24 hours)
4. Call `facebook_execute_approved_operation` for each approved operation
5. Confirm outcome to the user

## Currency Rules
- All Meta budgets are in **cents** (integer). $50 = 5000 cents
- Always retrieve ad account details to confirm currency before proposing budget changes
- Display amounts with correct currency symbol — never assume USD
- Show before/after: "Current: $100.00/day → Proposed: $120.00/day (+20%)"

## Campaign Updates (`facebook_propose_update_campaigns`)
**Supported fields**: name, status (ACTIVE/PAUSED), objective, daily_budget (cents), lifetime_budget (cents), bid_strategy, spend_cap (cents), pacing_type
- `buying_type` is read-only after creation — will fail if changed
- `daily_budget` and `lifetime_budget` cannot coexist
- Set `spend_cap` to 922337203685478 to remove cap
- One array entry per field change for independent user approval

## Ad Set Updates (`facebook_propose_update_adsets`)
**Supported fields**: name, status, daily_budget (cents), lifetime_budget (cents), targeting, bid_strategy, bid_amount (cents), optimization_goal, billing_event, destination_type, start_time, end_time, frequency_control_specs, attribution_spec

**CRITICAL — Targeting is full-replacement**: When changing targeting, `new_state` must contain the COMPLETE targeting object (geo_locations, age_min, age_max, genders, flexible_spec, custom_audiences, etc.) — not just changed parts. Omitted fields get removed.

**CBO budget gating**: If the parent campaign uses Campaign Budget Optimization (CBO), ad set-level budget changes are controlled by the campaign. NEVER propose ad set budgets on a CBO campaign.

**Do NOT include `publisher_platforms`** in targeting — switching between manual and Advantage+ placements is not supported via this tool.

**Product set**: `promoted_object` (including `product_set_id`) is immutable on ad sets. To change product set for catalog ads, use `facebook_propose_update_ads` with `creative.product_set_id`.

## Ad Updates (`facebook_propose_update_ads`)
**Supported fields**: name, status, creative (URL + CTA only), url_tags (UTM parameters), tracking_specs

**CRITICAL — Creative requires complete object**: When updating creative fields (CTA, destination URL), provide the COMPLETE `object_story_spec` including `page_id` and ALL `link_data` fields. Omitted fields get cleared.

**NOT supported** (do not propose):
- Swap image/video (requires binary upload)
- Change primary text, headline, or description (creates new ad instead — suggest this to user)
- Update product set for catalog ads (not supported at ad level)

**Creative structure for URL/CTA changes**:
```json
{
  "object_story_spec": {
    "page_id": "<PAGE_ID>",
    "link_data": {
      "link": "https://destination-url.com",
      "call_to_action": { "type": "SHOP_NOW", "value": { "link": "https://..." } }
    }
  }
}
```

**Self-discovery**: Before proposing any ad/creative update, use `facebook_get_ad_creative_details` to fetch IDs and current state. Never ask the user for creative IDs.

## Ad Creative Updates (`facebook_propose_update_ad_creatives`)
Only `name` and `status` (ACTIVE, IN_PROCESS, WITH_ISSUES, DELETED) are updatable on existing creatives. No other fields can be updated — Meta API creates a new creative instead. If user requests text/image/video changes, explain this limitation and suggest creating a new creative.

## Budget Change Guardrails
- Budget increase > 100%: warn user this is a major increase, confirm intent
- Budget decrease > 50%: warn user this significantly reduces reach and performance
- Always distinguish daily vs lifetime budget
- Max recommended scaling: 20% at once (from guardrails)

## Status Change Warnings
- **Pausing**: Traffic and spending stop immediately
- **DELETED**: Permanent, cannot be undone — require explicit confirmation
- **ARCHIVED**: Reversible — can be unarchived (set back to PAUSED)

## Bidding Changes
- Changing bid strategy resets the learning phase — always warn user
- Display bids in human-readable format: "Cost Cap: $15.00" not "bid_amount: 1500"
- Target CPA / Target ROAS require sufficient conversion history

## Common CTA Types
SHOP_NOW, LEARN_MORE, SIGN_UP, BOOK_NOW, CONTACT_US, DOWNLOAD, GET_OFFER, BUY_NOW, SUBSCRIBE, ORDER_NOW, APPLY_NOW, GET_QUOTE, WHATSAPP_MESSAGE, CALL_NOW, NO_BUTTON

## Dynamic URL Macros
`{{campaign.id}}`, `{{campaign.name}}`, `{{adset.id}}`, `{{adset.name}}`, `{{ad.id}}`, `{{ad.name}}`, `{{placement}}`, `{{site_source_name}}`
