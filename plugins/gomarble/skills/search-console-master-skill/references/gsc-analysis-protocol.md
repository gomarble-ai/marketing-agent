<!-- Synced from GoMarble server skill: prompts/skills/search_console/gsc-analysis-protocol -->

# Organic Search Analysis Protocol (GSC)

**Source of truth:** All organic query, impression, CTR, and position data **MUST** come from **Google Search Console**. No synthetic keywords, no model-estimated demand, no substitutions.

---

## 1. Data Extraction (Mandatory, Multi-Dimensional)

**Tool:** Google Search Console  
**Report:** Search Analytics

**Dimensions:** Query, Page, Country, Device  
**Metrics:** Clicks, Impressions, CTR, Avg Position  
**Date ranges:** Last 28 days, Previous 28 days (for delta)

**If deltas are unavailable → stop.** Do not proceed with opportunity or trend analysis without period-over-period comparison.

---

## 2. Query Normalization (Important)

Before analysis, normalize queries:
- Lowercase
- Strip brand terms (store separately)
- Group close variants (plural/singular, word order)
- Map queries → canonical intent

**Why:** GSC query rows are noisy, not decision-ready.

---

## 3. Intent × Value Classification (Two Labels Per Query)

**A. Search Intent:** Informational | Commercial | Transactional | Navigational  

**B. Business Value:** High (directly tied to product/service) | Medium (adjacent/evaluative) | Low (awareness only)

**Forward only:** Commercial + Transactional + High/Medium value queries move forward. Others do not get opportunity scoring or recommendations.

---

## 4. Opportunity Scoring Model (Core)

Every qualifying query gets an **Opportunity Score**.

**Inputs (weighted):**
| Input | Weight |
|-------|--------|
| Impressions growth / decline | 30% |
| Current position gap | 25% |
| Business value | 25% |
| CTR underperformance | 20% |

**Position gap logic:**
- Pos 4–8 → High leverage (primary quick wins)
- Pos 9–15 → Medium leverage (on-page, internal links)
- Pos >15 → Low short-term leverage

This prevents wasting effort on page-4 keywords that are already visible.

---

## 5. Opportunity Buckets

**A. Revenue Capture (Highest Priority)**  
- Criteria: Commercial/Transactional, Position 4–8, CTR below SERP average  
- Actions: Title/meta rewrite; Rich snippet optimization; Intent-aligned landing page tweaks

**B. Ranking Lift (SEO Leverage)**  
- Criteria: High impressions, Position 9–15, Business value = High  
- Actions: On-page expansion; Internal link injection; Section-level optimization (not full rewrite)

**C. Demand Validation (Ads Feed)**  
- Criteria: Commercial intent, Impressions ≥ 100, CTR ≥ 2%  
- Actions: Send to Google Ads Keyword Planner; Test as Search Ads keyword. Especially valuable if CPC is high.

**D. Risk / Decline Detection**  
- Criteria: Clicks ↓ AND impressions ↓ across multiple queries to same page  
- Actions: Page-level diagnosis; Cannibalization check; SERP intent shift detection

---

## 6. Paid ↔ Organic Feedback Loop

**Organic → Paid:** If organic query has Commercial intent, High impressions, Low CTR → Ads can capture demand faster. Recommend testing in paid search.

**Paid → Organic:** If paid keyword has High CVR, High CPC → Organic investment reduces marginal CAC. Recommend SEO focus for that theme.

This is where analysis becomes cross-channel, not siloed.

---

## 7. Page-Level Intelligence

For each URL:
- Aggregate query performance
- Detect intent mismatch (page ranking for wrong intent)
- Flag pages with: High impressions + poor engagement; Multiple intents mixed together

**Actions:** Page split; Repositioning; Canonical correction

---

## Output Format (No Raw Tables, No CSV)

Use this structure per page/opportunity. Do not dump raw tables or CSV-style data.

**Page:** [URL path]  
**Primary Opportunity:** [Revenue Capture | Ranking Lift | Demand Validation | Risk/Decline]  
**Key Queries:**  
- [query 1] (Pos X.X, CTR X.X%)  
- [query 2] (Pos X.X, CTR X.X%)  

**Why this matters:** [1–2 sentences: intent + performance gap]  

**Recommended Actions:**  
1. [Specific action]  
2. [Specific action]  
3. [Optional: Test in paid / invest in organic]

**Example:**

**Page:** /google-ads-services  
**Primary Opportunity:** Revenue Capture  
**Key Queries:**  
- google ads agency for ecommerce (Pos 6.2, CTR 0.8%)  
- google ads management cost (Pos 7.1, CTR 1.1%)  

**Why this matters:** High commercial intent + underperforming SERP click share.  

**Recommended Actions:**  
1. Rewrite title to include pricing qualifier  
2. Add proof-based meta description  
3. Test keyword in paid search  

---

## Failure & Safety Rules

**If Search Console access is missing:**
- Do NOT infer keywords
- Do NOT estimate traffic
- Ask for access or stop

**If deltas (previous 28 days) are unavailable:** Do not report growth/decline or trend-based opportunities; state the limitation or stop.

**If no Commercial/Transactional + High/Medium value queries exist:** Say so clearly; do not fabricate or relabel intent to force opportunities.
