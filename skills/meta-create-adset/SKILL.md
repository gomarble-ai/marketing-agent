---
name: meta-create-adset
description: "Use when creating a Meta ad set. Parent campaign verification, pixel detection, targeting patterns, attribution spec, bid amount rules, placement/optimization guardrails. Loaded after the create master skill."
---
# Meta Ads - Create Ad Set

## CRITICAL: Do NOT combine with other creation steps
Each creation step (campaign → ad set → ad+creative) has its own separate flow. The ad set step happens AFTER campaign has been created and executed.

## user_input Rules

Do NOT call `user_input` for ad set creation. Auto-detect and auto-configure ALL fields. Show a brief summary in chat, then call `facebook_propose_create_adset` directly. The user can review and edit everything in the approval UI.

**Auto-configure ALL fields silently:**

| Field | Fixed Value | Source |
|-------|------------|--------|
| `adset_name` | Auto-generate | Follow parent campaign's naming convention (e.g., "Brand \| Audience \| Date"). If no pattern, generate from campaign context + targeting. |
| `target_countries` | Auto-detect | Most common countries from Step 4. If no existing ad sets, use account's default country. |
| `daily_budget` | Auto-detect or ASK (ABO only) | Median budget from Step 4. **If no existing ad sets with budgets → ASK the user for budget.** NEVER invent a number. Skip if CBO. |
| `bid_amount` | Auto-detect or ASK (if needed) | Only if campaign uses COST_CAP or BID_CAP. Use median from existing ad sets. **If no existing bid data → ASK the user.** NEVER invent a number. |
| `campaign_id` | From prior step | Just-executed campaign's `new_campaign_id` |
| `campaign_name` | From prior step | Campaign name used during creation — UI breadcrumb only |
| `billing_event` | `IMPRESSIONS` | Fixed for Sales |
| `destination_type` | `WEBSITE` | Default for Sales |
| `optimization_goal` | `OFFSITE_CONVERSIONS` | Default for Sales — optimize for conversions. Do NOT use VALUE unless user explicitly asks AND pixel is eligible. |
| `status` | `ACTIVE` | Default — ad set goes live as soon as an active ad is attached |
| `promoted_object` | `{ pixel_id: <from Step 3>, custom_event_type: "PURCHASE" }` | Auto-detect pixel. If 1 pixel → use it. If multiple → show in chat, ask user to pick (this is the ONE exception where user input is needed). |
| `attribution_spec` | `[{ event_type: "CLICK_THROUGH", window_days: 7 }, { event_type: "VIEW_THROUGH", window_days: 1 }]` | Standard 7d click + 1d view |
| `is_campaign_cbo` | `true` if campaign has budget | From Step 2 |
| `campaign_bid_strategy` | From Step 2 | `facebook_get_campaign_details` → bid_strategy |
| `bid_strategy` | Do NOT set | Inherits from campaign |
| `is_dynamic_creative` | `false` (default) | Leave `false` in most cases. For multiple headlines/texts, prefer `creative_asset_groups_spec` (Flexible Ads) at the ad level instead — it does NOT need this flag. Only set to `true` if specifically using `asset_feed_spec` (legacy DCO) or placement-specific `asset_customization_rules`. |
| `targeting.age_min` | `18` | Default performant range |
| `targeting.age_max` | `55` | Default performant range |
| `targeting.genders` | Do NOT set | All genders |
| `targeting.publisher_platforms` | Do NOT set | Advantage+ Placements (automatic) |

**Workflow:** Fetch account details (Step 1) → get campaign details (Step 2) → list pixels (Step 3) → detect patterns (Step 4) → build targeting with interest search (Step 5) → call `facebook_propose_create_adset` directly with all auto-configured values. Do NOT call `user_input`. Do NOT show a summary before proposing — the user reviews and edits everything in the approval UI.

**EMPTY ACCOUNT (no existing adsets to detect patterns from):** If `account_structure.adsets` is empty, this is a NEW account. Do NOT stop and ask the user what to do. Proceed with creation using these defaults:
- `target_countries`: Use the account's timezone/locale to infer country (e.g., INR currency → `["IN"]`, USD → `["US"]`). If unsure, ASK the user.
- `daily_budget` (ABO only): **ASK the user** — you have no data to infer from. Use `user_input` with a single `daily_budget` number field.
- `adset_name`: Generate from campaign name + "Broad" (e.g., "GoMarble | Broad | Apr 2026")
- `targeting`: Broad targeting — geo_locations only, age 18-55, no interests/behaviors
- Everything else: use standard auto-configured values (IMPRESSIONS, OFFSITE_CONVERSIONS, ACTIVE, etc.)

---

## Complete Workflow (follow in exact order)

### Phase 1: Gather Information

**Step 1: Get Account Details** (if not already fetched)
Call `facebook_get_details_of_ad_account` with `act_id`.
Extract:
| Field | Where to Find | Use For |
|-------|--------------|---------|
| `currency` | Response root | `currency_code` param |
| `account_structure.adsets` | Response root | Detect targeting patterns, conversion events, budget ranges |

**Step 2: Get Parent Campaign Details** (MANDATORY)
Call `facebook_get_campaign_details` with `campaign_id` and `act_id`.
Extract:
| Field | Where to Find | Use For |
|-------|--------------|---------|
| `daily_budget` or `lifetime_budget` | Campaign response | `is_campaign_cbo` = true if either exists |
| `bid_strategy` | Campaign response | `campaign_bid_strategy` — determines if bid_amount is needed |
| `special_ad_categories` | Campaign response | Pass as `campaign_special_ad_categories` |
| `special_ad_category_country` | Campaign response | Pass as `campaign_special_ad_category_country` |
| `objective` | Campaign response | Must be OUTCOME_SALES for V1 |
| `status` | Campaign response | Verify not DELETED/ARCHIVED |

**STOP** if `facebook_get_campaign_details` fails — tell user campaign does not exist.

**Step 3: Get Pixel**
Call `facebook_list_pixels` with `act_id`.
- **1 pixel** → show to user for confirmation (e.g., "Found pixel: {name} ({id}). Using this for conversion tracking.")
- **Multiple pixels** → check which pixel is most used across existing ad sets' `promoted_object.pixel_id`. Show the most-used one as the recommended choice, list others. Ask user to confirm.
- **No pixels** → warn user that conversion tracking won't work

**Step 4: Detect Patterns from Existing Ad Sets**
From `account_structure.adsets`, extract:
| Pattern | Where to Find | Use For |
|---------|--------------|---------|
| Common countries | `adsets[].targeting.geo_locations.countries` | `target_countries` defaultValue |
| Age range | `adsets[].targeting.age_min`, `age_max` | Suggest age |
| Conversion event | `adsets[].promoted_object.custom_event_type` | Default event (usually PURCHASE) |
| Budget range | `adsets[].daily_budget` | `daily_budget` — use median. **If none found → ASK user, do NOT guess.** |
| Naming convention | `adsets[].name` | `adset_name` defaultValue |
| Bid amounts | `adsets[].bid_amount` | `bid_amount` — use median. **If none found → ASK user, do NOT guess.** |

**Step 5: Build Targeting with Interest/Behavior Search** (when user wants audience targeting)

Use `facebook_search_targeting` to find targeting option IDs for interests, behaviors, demographics, and other audience categories. **This tool operates at the ad set level — targeting is always configured on the ad set, never on the ad.**

#### When to use targeting search:
- User mentions specific interests (e.g., "people who like yoga", "anime fans", "runners")
- User wants to target specific behaviors (e.g., "engaged shoppers", "frequent travelers")
- User wants demographic targeting (e.g., "homeowners", "parents with toddlers")
- Creative analysis suggests a clear audience (e.g., fitness creative → search fitness interests)
- User explicitly asks for interest-based or behavior-based targeting

#### When to skip targeting search (use broad targeting):
- User says "broad targeting" or "let Meta optimize"
- No clear audience signals from creative or user
- Account patterns show broad targeting performs best

#### Search types:

| Search Type | When to Use | Required Params |
|-------------|-------------|-----------------|
| `adinterest` | Free-text search for interests | `query` (e.g., "yoga", "anime", "organic food", "running shoes") |
| `adinterestsuggestion` | Expand targeting with related interests | `interest_list` (array of interest IDs from prior search) |
| `adTargetingCategory` | Browse a full category | `class` (see categories below) |
| `adinterestvalid` | Validate interest IDs are still active | `interest_list` (array of interest IDs) |

#### Available category classes for `adTargetingCategory`:

| Class | Description | Example Use |
|-------|-------------|-------------|
| `interests` | Hobbies, entertainment, activities | "anime", "yoga", "gaming" |
| `behaviors` | Purchase behavior, device usage, travel | "engaged shoppers", "frequent travelers" |
| `demographics` | Education, relationship, work | "college graduates", "small business owners" |
| `life_events` | Recent milestones | "recently moved", "newly engaged" |
| `industries` | Professional industries | "technology", "healthcare" |
| `income` | Household income brackets | Top 10%, 25%, etc. |
| `family_statuses` | Parental status, family composition | "parents with toddlers", "new parents" |
| `home_ownership` | Homeowner vs renter | "homeowners", "renters" |
| `home_type` | Housing type | "apartment", "house" |
| `home_value` | Property value ranges | High-value homeowners |
| `household_composition` | Household makeup | "roommates", "living alone" |
| `net_worth` | Financial net worth brackets | High net worth individuals |
| `generation` | Generational cohorts | "millennials", "gen X" |
| `ethnic_affinity` | Cultural affinity | Multicultural targeting |
| `politics` | Political leanings | Political interest targeting |
| `markets` | Market segments | DMA/market-based targeting |
| `moms` | Parenting stage | "new moms", "moms of teenagers" |
| `office_type` | Work environment | "home office", "corporate" |
| `user_device` | Device targeting | "iPhone", "Samsung Galaxy" |
| `user_os` | Operating system targeting | "iOS", "Android" |

#### How to use search results in targeting:

The search returns objects with `id` and `name`. **Always include both `id` and `name`** when building targeting. Place results in the correct sub-key of `flexible_spec`:

```json
{
  "targeting": {
    "geo_locations": { "countries": ["US"] },
    "age_min": 25,
    "age_max": 55,
    "flexible_spec": [
      {
        "interests": [
          { "id": "6003139266461", "name": "Yoga" },
          { "id": "6003384248805", "name": "Meditation" }
        ],
        "behaviors": [
          { "id": "6002714895372", "name": "Engaged shoppers" }
        ]
      }
    ]
  }
}
```

#### flexible_spec sub-keys (must match the category of the targeting option):

| Sub-key | For Options From |
|---------|-----------------|
| `interests` | `adinterest` search or `adTargetingCategory` class=interests |
| `behaviors` | `adTargetingCategory` class=behaviors |
| `demographics` | `adTargetingCategory` class=demographics |
| `life_events` | `adTargetingCategory` class=life_events |
| `family_statuses` | `adTargetingCategory` class=family_statuses |
| `education_statuses` | Education-related demographics |
| `work_employers` | Employer targeting |
| `work_positions` | Job title targeting |
| `income` | `adTargetingCategory` class=income |
| `industries` | `adTargetingCategory` class=industries |
| `user_device` | `adTargetingCategory` class=user_device |
| `user_os` | `adTargetingCategory` class=user_os |

#### Targeting search workflow example:

1. User says "target people interested in anime and gaming"
2. Call `facebook_search_targeting({ act_id, search_type: "adinterest", query: "anime" })` — get results
3. Call `facebook_search_targeting({ act_id, search_type: "adinterest", query: "gaming" })` — get results
4. Pick the most relevant results (highest audience size, most specific match)
5. Optionally call with `search_type: "adinterestsuggestion"` + picked IDs to find related interests
6. Build `targeting.flexible_spec[].interests` with the selected `{ id, name }` pairs
7. Present to user in the proposal — they can edit/remove in the approval UI

#### Multiple flexible_spec groups (OR vs AND logic):

- Items **within** the same `flexible_spec` object are **OR** (match any)
- Items in **separate** `flexible_spec` objects are **AND** (must match all)

```json
{
  "flexible_spec": [
    { "interests": [{ "id": "123", "name": "Yoga" }, { "id": "456", "name": "Fitness" }] },
    { "behaviors": [{ "id": "789", "name": "Engaged shoppers" }] }
  ]
}
```
This means: (interested in Yoga OR Fitness) AND (Engaged shoppers)

**Step 6: Get Custom Audiences** (only if user mentions audiences)
Call `facebook_list_custom_audiences` with `act_id`.

### Phase 2: Auto-Configure (silently — do NOT show or ask user)

| Field | Value | Source |
|-------|-------|--------|
| `billing_event` | `IMPRESSIONS` | Always for Sales |
| `destination_type` | `WEBSITE` | Default for Sales |
| `optimization_goal` | `OFFSITE_CONVERSIONS` | Default for Sales — optimize for Purchase |
| `status` | `ACTIVE` | Default — goes live when an active ad is attached |
| `promoted_object` | `{ pixel_id: from Step 3, custom_event_type: "PURCHASE" }` | Pixel shown to user for confirmation in Step 3 |
| `is_campaign_cbo` | From Step 2 | true if campaign has budget |
| `campaign_bid_strategy` | From Step 2 | Pass the campaign's bid_strategy |
| `campaign_special_ad_categories` | From Step 2 | Pass the campaign's special_ad_categories |
| `campaign_special_ad_category_country` | From Step 2 | Pass the campaign's special_ad_category_country |
| `attribution_spec` | `[{ event_type: "CLICK_THROUGH", window_days: 7 }, { event_type: "VIEW_THROUGH", window_days: 1 }]` | Default 7d click + 1d view for conversions |
| `bid_strategy` | Do NOT set | Unless optimization_goal is IMPRESSIONS/REACH → then MUST set LOWEST_COST_WITHOUT_CAP |
| `is_dynamic_creative` | `false` (default) | Leave `false` — prefer `creative_asset_groups_spec` for text variations |
| `targeting` | From Step 5 | Interest/behavior/demographic search results in `flexible_spec`, geo from Step 4, age/gender defaults |

### Phase 3: Auto-Fix (apply silently, do NOT ask)

| Missing Field | Auto-Fix |
|--------------|----------|
| No audience / targeting | **Broad targeting** — geo_locations only, no interests/behaviors |
| No age range | **18-55** (default performant range) |
| No gender | All genders (omit field) |
| No placements | **Advantage+ Placements** (automatic — do NOT set publisher_platforms) |
| No attribution | **7d click + 1d view** (standard for conversions) |
| No conversion event | **PURCHASE** (for ecommerce/Sales campaigns) |

### Phase 4: Propose Directly

Call `facebook_propose_create_adset` immediately with all auto-configured values. Do NOT show a summary or ask for confirmation — the user reviews and edits everything in the approval UI.

---

## Guardrails

### CBO/ABO Budget Conflict (server enforces at execution)
| Condition | Action |
|-----------|--------|
| Parent campaign is CBO (has campaign-level budget) + ad set has daily_budget or lifetime_budget | **BLOCK** — "Parent campaign uses CBO. Remove budget from ad set." |
| Parent campaign is ABO (no campaign-level budget) + ad set has NO budget | **BLOCK** — "Parent campaign uses ABO. Ad set must have daily_budget or lifetime_budget." |

### Optimization Event Protection
| Condition | Action |
|-----------|--------|
| optimization_goal is NOT OFFSITE_CONVERSIONS and NOT VALUE | **WARN** — "You're optimizing for {goal} instead of conversions. For Sales campaigns, OFFSITE_CONVERSIONS or VALUE typically performs best." |
| optimization_goal is VALUE | **WARN** — "VALUE optimization requires a pixel with sufficient purchase events with varied values. If Meta rejects it, retry with OFFSITE_CONVERSIONS." |
| custom_event_type is NOT PURCHASE for ecommerce account | **WARN** — "You're optimizing for {event} instead of PURCHASE. For ecommerce, PURCHASE usually gives the best ROAS." |

### Budget Guardrails
| Condition | Action |
|-----------|--------|
| ABO budget < $1 USD equivalent | **BLOCK** — "Minimum budget is {minInLocal} {currency}" |
| ABO budget $1-$5 USD | **WARN** — "Budget is very low. Meta may struggle to exit learning phase." |
| ABO budget $5-$10 USD | **WARN** — "Budget is below recommended minimum for stable optimization." |

### Budget Fragmentation Guardrail
If user wants ABO + multiple ad sets under same campaign:
- Total budget across all ad sets < $20 USD → **WARN** — "Splitting {total} across {n} ad sets gives each only {per_adset}. Consider fewer ad sets or higher budget."

### Dynamic Creative Guardrail
| Condition | Action |
|-----------|--------|
| Ads will use `asset_feed_spec` but `is_dynamic_creative` not set to `true` | **BLOCK** — Meta returns "Dynamic creative ad sets allow for one active ad at most". Set `is_dynamic_creative: true` on the ad set. |

### Targeting Guardrails
| Condition | Action |
|-----------|--------|
| `flexible_spec` items missing `id` or `name` | **BLOCK** — both fields are required. Re-run `facebook_search_targeting` to get valid IDs. |
| `flexible_spec` has items in wrong sub-key (e.g., behavior in `interests`) | **WARN** — place each item in the sub-key matching its category (interests, behaviors, demographics, etc.) |
| If setting `user_device`, must also set `user_os` | **BLOCK** — Meta rejects device targeting without OS |
| `targeting.geo_locations` missing or empty | **BLOCK** — at least one location is required |
| `age_min` < 18 or `age_max` > 65 or `age_min` > `age_max` | **BLOCK** — invalid age range |
| Advantage+ audience (`targeting_automation.advantage_audience=1`) with `age_max` < 65 | **BLOCK** — Meta rejects hard age_max limits below 65 for Advantage+ audience. Either set age_max to 65, omit age_max, or disable Advantage+ audience. |

### Attribution Guardrail
| Condition | Action |
|-----------|--------|
| CLICK_THROUGH window_days = 1 for OFFSITE_CONVERSIONS/VALUE | **WARN** — "1-day click attribution gives Meta less conversion data. 7-day click is recommended for conversion campaigns." |

### Placement Guardrail
| Condition | Action |
|-----------|--------|
| Manual placements set (publisher_platforms specified) | **WARN** — "Manual placements restrict where Meta can show ads. Advantage+ Placements usually delivers better results at lower cost." |

### Spending Limits Rules
- Must be zero or positive numbers
- `daily_min_spend_target` must be <= `daily_spend_cap` (if both set)
- `lifetime_min_spend_target` must be <= `lifetime_spend_cap` (if both set)
- Do NOT mix daily and lifetime spending limits — use one type only

### Attribution Spec Rules (Meta enforces)

| Optimization Goal | Attribution Spec |
|-------------------|-----------------|
| OFFSITE_CONVERSIONS / VALUE | `[{ event_type: "CLICK_THROUGH", window_days: 7 }, { event_type: "VIEW_THROUGH", window_days: 1 }]` |
| IMPRESSIONS / REACH | `[{ event_type: "CLICK_THROUGH", window_days: 1 }, { event_type: "VIEW_THROUGH", window_days: 0 }]` — Meta rejects anything else |
| LINK_CLICKS / LANDING_PAGE_VIEWS | `[{ event_type: "CLICK_THROUGH", window_days: 1 }, { event_type: "VIEW_THROUGH", window_days: 0 }]` |

**ENGAGED_VIDEO_VIEW** (optional, video ads only): Add `{ event_type: "ENGAGED_VIDEO_VIEW", window_days: 1 }` to attribution_spec for video creatives. Valid window_days: 0 (none) or 1.
**CLICK_THROUGH** window_days: 1 or 7. **VIEW_THROUGH**: 0 or 1.

### Bid Amount Rules

| Campaign Bid Strategy | What to Do |
|----------------------|------------|
| Not set / LOWEST_COST_WITHOUT_CAP | Do NOT set bid_amount |
| COST_CAP | MUST set bid_amount — ask user for target cost per result |
| LOWEST_COST_WITH_BID_CAP | MUST set bid_amount — ask user for max bid |
| LOWEST_COST_WITH_MIN_ROAS | MUST set bid_constraints with roas_average_floor — ask user for target ROAS |

---

## Output After Creation

Show the user:
Give simple crisp summary of created adsets.

## Error Handling

Transient Meta API errors (code 2 "Please retry your request later", network errors) are automatically retried up to 2 times with backoff. No action needed from the LLM.

| Error | Action |
|-------|--------|
| "You can only set an ad set budget or a campaign budget" | Parent campaign is CBO. Remove `daily_budget` and `lifetime_budget` from ad set. |
| "pixel isn't eligible for value optimisation" | Pixel doesn't have enough varied purchase values. Retry with `optimization_goal=OFFSITE_CONVERSIONS` and `custom_event_type=PURCHASE` instead. |
| "Dynamic creative ad sets allow for one active ad at most" | Ad set needs `is_dynamic_creative: true` to use `asset_feed_spec` creatives. Re-create ad set with the flag set. |
| "Only dynamic creative ads can be created as the ad set is a dynamic creative ad set" | The ad set has `is_dynamic_creative: true` but the ad used flat fields. Use `asset_feed_spec` format for DCO ad sets. |

## Call the Tool

Pass `adset_configs` as a 1-element array. Never call the tool multiple times — batch all ad sets in one call.
