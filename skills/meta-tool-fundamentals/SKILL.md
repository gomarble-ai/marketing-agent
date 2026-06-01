---
name: meta-tool-fundamentals
description: "Foundation tool reference for any Meta (Facebook/Instagram) Ads task — Marketing API quirks, common entity relationships, currency in cents. Used internally when working with Meta tools."
---
# Meta Ads - Tool Fundamentals

How to use Meta Ads tools effectively, plus the canonical metric definitions used across all Meta skills. Auto-loaded with every Meta skill request.

## Insights Query Optimization

When using `facebook_get_adaccount_insights`:

**Level selection** — use the highest level that answers the question:
- `account` — total spend, overall ROAS, account-level metrics
- `campaign` — compare campaign performance
- `adset` — analyze targeting/audience performance
- `ad` — individual ad performance, creative analysis

**Field selection** — request only what's needed:
- Basic: `spend`, `impressions`, `clicks`, `ctr`, `cpm`, `cpc`
- With conversions: add `conversions`, `conversion_values`, `purchase_roas`
- With names: add `campaign_name`/`adset_name`/`ad_name` matching the level
- For video: add `video_play_actions`, `video_thruplay_watched_actions`

**Default filtering**: Always apply `filtering=[{"field":"impressions","operator":"GREATER_THAN","value":0}]` unless user wants non-delivered entities.

**Active entity filtering (CRITICAL)**: When analyzing current performance, ALWAYS add an `effective_status` filter to exclude paused/deleted entities. The insights API returns data for ANY entity that had spend in the date range, even if it is now inactive.
- Ad sets: `{"field":"adset.effective_status","operator":"IN","value":["ACTIVE"]}`
- Ads: `{"field":"ad.effective_status","operator":"IN","value":["ACTIVE"]}`
- Campaigns: `{"field":"campaign.effective_status","operator":"IN","value":["ACTIVE"]}`

Combine with impressions filter: `filtering=[{"field":"impressions","operator":"GREATER_THAN","value":0},{"field":"adset.effective_status","operator":"IN","value":["ACTIVE"]}]`

Only omit the `effective_status` filter when the user explicitly asks for historical or paused entity data.

**Default sorting**: Use `sort='spend_descending'` unless user specifies otherwise.

**Breakdowns**: Only include when specifically requested. Each breakdown multiplies result rows exponentially. Available: `age`, `gender`, `country`, `region`, `publisher_platform`, `platform_position`, `device_platform`, `user_segment_key`.

**Creative fatigue analysis**: Use `time_increment='1'` for daily trend data.

## Purchase De-Duplication (CRITICAL)

Facebook returns overlapping purchase action_types: `omni_purchase`, `purchase`, `offsite_conversion.fb_pixel_purchase`, `onsite_web_purchase`, `web_in_store_purchase`, `app_custom_event.fb_mobile_purchase`.

**Rule**: Use ONLY ONE. Check `omni_purchase` first; if absent, fall back to `purchase`. NEVER sum multiple types — this double-counts revenue and inflates ROAS.

## Pagination (CRITICAL)
Ad-level insights paginate at 25 results per page. When the response contains `paging.next`, you MUST use `facebook_fetch_pagination_url` to fetch ALL remaining pages before performing any analysis. Analyzing only page 1 produces wrong ad counts, wrong totals, and wrong CPAs.

**Rule**: Never present ad counts, per-ad-set breakdowns, or CPA calculations until you have fetched every page. Cross-check: if an ad set appears to have only 1 ad, verify by checking if there are more pages.

## Currency
All Meta budget values are in **cents** (integer). $50 = 5000. Always divide by 100 when displaying to users. Confirm account currency from `facebook_get_details_of_ad_account` before presenting monetary values — never assume USD.

## Account Context
Always call `facebook_get_details_of_ad_account` first. It returns:
- Account currency (for correct monetary display)
- `account_structure` with top 10 spending ads, their campaigns and ad sets
- Use this to find entity IDs and understand what's running before deeper analysis

## Async Insights
If `facebook_get_adaccount_insights` fails with "reduce the amount of data", use `facebook_get_async_adaccount_insights` instead. Same parameters, handles large datasets asynchronously.

## Filtering Guide
- **Status (most important)**: `{"field":"adset.effective_status","operator":"IN","value":["ACTIVE"]}`
- Name matching: `{"field":"campaign.name","operator":"CONTAIN","value":"brand"}`
- Performance threshold: `{"field":"spend","operator":"GREATER_THAN","value":100}`
- Multiple filters combine as AND conditions
- Use `CONTAIN`/`NOT_CONTAIN` for text, `GREATER_THAN`/`LESS_THAN` for numbers, `IN`/`NOT_IN` for multiple values

**Standard filter combo for current performance analysis**:
```json
[
  {"field": "impressions", "operator": "GREATER_THAN", "value": 0},
  {"field": "adset.effective_status", "operator": "IN", "value": ["ACTIVE"]}
]
```

## Metric Glossary

Canonical definitions used across all Meta skills. Workflow skills (`creative-analysis`, `performance-analysis`, `depth-of-analysis`) reference these — they do NOT redefine them.

### Direct Metrics (from API response)

| Metric | API Field | How to Extract |
|---|---|---|
| Spend | `spend` | Direct |
| CPM | `cpm` | Direct |
| CTR | `ctr` | Direct |
| Impressions | `impressions` | Direct |
| Clicks | `clicks` | Direct |
| Reach | `reach` | Direct |
| Frequency | `frequency` | Direct |
| Video Plays | `video_play_actions[0].value` | Initial impressions of the video |
| 3-Second Views | `actions` array, `action_type=video_view` | Hook engagement — NOT a separate field |
| ThruPlays | `video_thruplay_watched_actions[0].value` | 15s+ watch or completion |
| Purchases | `actions` array, `action_type=omni_purchase` (fallback `purchase`) | Use ONE only — see Purchase De-Duplication |
| Leads | `actions` array, `action_type=lead` | |
| Revenue | `action_values` array, `action_type=omni_purchase` | |
| Purchase ROAS | `purchase_roas` | Direct |

### Calculated Metrics

| Metric | Formula | Notes |
|---|---|---|
| Hook Rate | `(3-sec views / video plays) * 100` | Uses `actions[video_view]`, NOT `video_p25_watched_actions` |
| Hold Rate | `(thruplays / 3-sec views) * 100` | |
| Cost Per Purchase | `spend / actions[purchase].value` | |
| Cost Per Lead (CPL) | `spend / actions[lead].value` | |
| Cost Per Result (CPR) | `spend / actions[<custom_event>].value` | Use the SPECIFIC `custom_event_str` — never `conversions` totals |
| Conversion Rate (CVR) | `actions[<event>].value / clicks * 100` | |
| Budget Utilization | `spend / (daily_budget * days_in_period)` | Daily budget is in cents |
| Campaign Spend Share | `entity_spend / parent_total_spend` | For ad-set comparison; require ≥ 25% before comparing |
| Pareto Set | Sort ads by spend desc; cumulative spend ≤ 90% | These ads drive the majority of activity |

### Video Funnel
```
Video Plays → Hook Rate → 3-Second Views → Hold Rate → ThruPlays
```

### Account Type → Primary Conversion Metric (PCM)

Read `promoted_object.custom_event_type` from the ad set (`facebook_get_details_of_ad_account` returns it for top spenders; otherwise `facebook_get_adset_details`). NEVER infer from campaign or ad set names.

| `custom_event_type` | Account Type | PCM |
|---|---|---|
| `PURCHASE` | E-commerce | Purchase ROAS |
| `LEAD` | Lead Generation | Cost Per Lead |
| `COMPLETE_REGISTRATION` | Registration | Cost Per Registration |
| `OTHER` + `custom_event_str` | Custom Conversion | Cost Per Result for that specific event |

If `promoted_object` is missing → ASK the user. Never assume.
**Mixed accounts**: group ad sets by `custom_event_type` and apply each group's PCM separately.

### Performance Benchmarks

| Metric | Good | Average | Poor |
|---|---|---|---|
| Hook Rate | ≥ 40% | 26–39% | < 25% |
| Hold Rate | > Account Avg + 25% | ≈ Account Avg | < Account Avg |
| CTR | ≥ 1.25% | 0.65 – 1.24% | < 0.65% |
| CPM variance vs Pareto avg | ≤ 20% | 20 – 60% | > 60% |
| PCM variance vs Pareto avg | Above avg | ± 20% | > 30% below |
| Budget utilization | ≥ 85% | — | < 85% |
| Min ad-set spend share for comparison | ≥ 25% of campaign | — | — |

For Hold Rate, compute `account_avg_hold_rate` from a 90-day account-level pull (`facebook_get_adaccount_insights` at `level="account"` with `date_preset="last_90d"` and the video fields) before applying.

### Diagnostic Signals (definitions only — workflow lives in `depth-of-analysis`)

| Signal | Means |
|---|---|
| Frequency rising AND CTR falling over 14+ days | Creative fatigue |
| CBO with one ad set holding 80%+ of budget | Algorithm working as intended — do NOT pause the dominant ad set on small-sample noise |
| High frequency alone (no CTR drop) | Not fatigue |
| Cost cap + rising CPM | Either delivery squeeze or audience saturation — separate before acting |

### Statistical Significance Floors

| Decision | Minimum signal |
|---|---|
| Per-ad-set performance judgment | 3–5 conversions / week |
| Per-segment recommendation (placement, age, device) | ≥ 100 impressions AND ≥ 3 conversions |
| Pause ad on high CPA | ≥ 3 conversions if non-zero, OR spend ≥ 2× ad-set CPA target if zero |
| Ad set learning phase exit | Spend ≥ 2× AOV OR 4× CPA, whichever is higher |
