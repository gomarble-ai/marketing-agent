---
name: google-ads-search-execution
description: "Use when making changes to Google Ads Search campaigns: tool parameters for bid adjustments, budget changes, negation, query isolation."
---
# Google Ads Search — Execution Rules

Tool parameters and processes for implementing search campaign changes. Load this after completing analysis with `search-analysis`.

## Bid Adjustments

**When to increase bids (5–10%)**:
- ALL must be true: majority Q1 queries, CPA ≤ target, Rank Pressure = HIGH

**Keyword-level bid change**:
```json
{
  "customer_id": "<CUSTOMER_ID>",
  "entity_type": "keyword",
  "entity_id": "<KEYWORD_ID>",
  "parent_id": "<AD_GROUP_ID>",
  "updates": { "cpc_bid_micros": "<CURRENT_BID * 1.05 to 1.10>" }
}
```

**Ad group-level bid change**:
```json
{
  "customer_id": "<CUSTOMER_ID>",
  "entity_type": "ad_group",
  "entity_id": "<AD_GROUP_ID>",
  "parent_id": "<CAMPAIGN_ID>",
  "updates": { "cpc_bid_micros": "<CURRENT_BID * 1.05 to 1.10>" }
}
```

Tool: `google_ads_update_entity`

## Budget Adjustments

**When to increase budget (10–20%)**:
- ALL must be true: CPA stable, Q1–Q3 spend share ≥ 60%, Budget Pressure = HIGH

```json
{
  "customer_id": "<CUSTOMER_ID>",
  "entity_type": "campaign_budget",
  "entity_id": "<BUDGET_ID>",
  "updates": { "amount_micros": "<CURRENT_BUDGET * 1.10 to 1.20>" }
}
```

Tool: `google_ads_update_entity`

## Query Negation

**Immediate negation (Q5)**: free, cheap, diy, how to, job, salary, course, pdf, meaning, used, repair.

**Conditional negation (Q4)**: Cost ≥ 1× target CPA AND conversions = 0, OR CPA ≥ 1.5× target.

Action: Add terms to shared negative keyword list at campaign or account level.

## Query Isolation (Q1)

When Q1 queries are mixed with Q2–Q5 and CPA on Q1 is below target but overall CPA is above target:

1. Identify top Q1 queries sorted by conversions
2. Create new campaign or ad group for isolated Q1 terms
3. Add Q1 queries as **Exact match** keywords in the new structure
4. Add the same terms as **negatives** in the original campaigns to prevent overlap
5. Set budget independently for the isolated campaign
