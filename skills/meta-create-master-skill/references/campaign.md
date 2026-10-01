<!-- Synced from GoMarble server skill: prompts/skills/meta/create/campaign -->

> **In Claude.** This methodology is GoMarble's own, kept in sync with the GoMarble connector.
> - Where this says changes appear as approval cards or rows: in Claude, call the propose tool with `mode: "dryrun"` first. That validates the change without touching the account. Show the user each proposed change (entity, current value, new value), and only after an explicit yes call the same tool with `mode: "live"` and just the approved `operation_ids`.
> - Where this says to call `user_input`: that tool exists only in GoMarble's own app. Ask the user the same question in chat instead. Where it says not to call `user_input`, don't ask — decide from the data.

# Meta Ads - Create Campaign

## This skill defines the `campaign` SLOT of the launch call
The whole launch — campaign, ad set, and ads — is ONE call to `facebook_propose_create_campaign_structure`. This skill covers the `campaign` object of that call. Include the slot only when creating a NEW campaign; to attach new children to an existing campaign pass top-level `campaign_id` instead (the two are mutually exclusive).

## CRITICAL: NEVER give up on empty accounts
If the user asks to "launch creatives" or "create a campaign" and `account_structure` is empty — this means it's a new/fresh account. Do NOT stop, ask for an adset_id, or say "I can't find existing structure." Proceed with creating everything from scratch: Campaign → Ad Set → Ad+Creative. The full flow MUST complete.

## user_input Rules

Do NOT call `user_input` for campaign creation. Auto-detect and auto-configure ALL fields, then fill the `campaign` slot of the single `facebook_propose_create_campaign_structure` launch call. The user can review and edit everything in the approval UI.

**Auto-configure ALL fields silently:**

| Field | Fixed Value | Source |
|-------|------------|--------|
| `name` | Auto-generate | Follow existing naming convention from Step 4 (e.g., "[Brand] \| [Product] \| [Goal] \| [Date]"). If no pattern, generate from product/context + objective. |
| `budget_type` | Auto-detect | CBO if most existing campaigns have campaign-level budgets, ABO otherwise. Default to CBO if no existing campaigns. |
| `daily_budget` | Auto-detect or ASK | Midpoint of detected budget range from Step 3. **If no existing campaigns with budgets found → ASK the user for budget.** NEVER invent a number. |
| `objective` | `OUTCOME_SALES` | V1 only supports Sales — server rejects anything else |
| `status` | `ACTIVE` | Default — campaign goes live as soon as an active ad set + ad is attached |
| `special_ad_categories` | `[]` | Must be empty array, never string `"NONE"` |
| `currency_code` | From `facebook_get_details_of_ad_account` → `currency` | Required for budget validation — extract silently |
| `buying_type` | Do NOT set | Defaults to AUCTION |
| `bid_strategy` | Do NOT set — leave undefined | Meta defaults to LOWEST_COST_WITHOUT_CAP (Highest Volume). NEVER set this field unless the user EXPLICITLY requests a specific bid strategy. |
| `start_time` | Do NOT set | Meta defaults to now |
| `end_time` | Only set if `lifetime_budget` chosen | Must be >24h after start_time |
| `spend_cap` | Do NOT set | Only set if user explicitly asks |

**Workflow:** Call `facebook_get_details_of_ad_account` FIRST → **check `account_status` is 1 (ACTIVE) — if not, STOP: the launch is rejected until the billing/status issue is fixed in Ads Manager** → extract `currency`, detect ABO/CBO pattern, detect budget range, detect naming convention → build the `campaign` slot with all auto-configured values (the launch call is made once the `adset` and `ads` slots are ready too). Do NOT call `user_input`. Do NOT show a summary before proposing — the user reviews everything in the approval UI.

**EMPTY ACCOUNT (no existing campaigns/adsets/ads):** If `account_structure` returns empty (`campaigns: {}, adsets: {}, ads: {}`), this is a NEW account. Do NOT stop and ask the user what to do. Proceed with creation using these defaults:
- `budget_type`: CBO (simpler for new accounts)
- `daily_budget`: **ASK the user** — you have no data to infer from. Use `user_input` with a single `daily_budget` number field.
- `name`: Generate from context (e.g., product name, brand name, user's request). E.g., "GoMarble | Sales | Apr 2026"
- Everything else: use standard auto-configured values (OUTCOME_SALES, ACTIVE, etc.)

## Structure Default
Default structure: **1 Campaign → 1 Ad Set → Multiple Ads**
Only create multiple ad sets under one campaign if the user explicitly requests split testing or different audiences.

## Pre-Flight: Auto-Detect Everything

### Step 1: Get Account Details
Call `facebook_get_details_of_ad_account` with `act_id`.
Extract:
| Field | Where to Find | Use For |
|-------|--------------|---------|
| `currency` | Response root | `currency_code` param — REQUIRED |
| `account_structure.campaigns` | Response root | Detect ABO/CBO pattern, budget range, naming convention |
| `account_structure.adsets` | Response root | Check if ecommerce account (has PURCHASE events) |

### Step 2: Detect ABO vs CBO Pattern
From `account_structure.campaigns`:
- Most campaigns have `daily_budget` or `lifetime_budget` → pattern is **CBO**
- Most campaigns have no budget → pattern is **ABO**
- Suggest detected pattern, let user choose

### Step 3: Detect Budget Range
From `account_structure.campaigns`, active campaigns' budget amounts:
- Calculate typical daily budget range (median of existing active campaign budgets)
- If existing campaigns have budgets → use the median as the default
- **If NO existing campaigns have budgets → you MUST ask the user.** Do NOT invent a number. Use `user_input` with a single `daily_budget` number field to ask.

### Step 4: Detect Naming Convention
From `account_structure.campaigns`, look at existing campaign names:
- Identify common patterns (e.g., "[Brand] | [Product] | [Goal]", "[Product] - [Audience] - [Date]")
- Use the same convention for the suggested campaign name defaultValue

## Auto-Configure (silently — do NOT show or ask user)

| Field | Value | Why |
|-------|-------|-----|
| `objective` | `OUTCOME_SALES` | V1 only supports Sales — server rejects anything else |
| `special_ad_categories` | `[]` | MUST be an array — pass `[]` if none apply. NEVER pass the string `"NONE"`. Valid values: HOUSING, CREDIT, EMPLOYMENT, ISSUES_ELECTIONS_POLITICS, ONLINE_GAMBLING_AND_GAMING, FINANCIAL_PRODUCTS_SERVICES |
| `buying_type` | Do NOT set | Defaults to AUCTION — only set if user asks for RESERVED |
| `bid_strategy` | Do NOT set — leave undefined | Meta defaults to LOWEST_COST_WITHOUT_CAP (Highest Volume). NEVER set this field unless the user EXPLICITLY requests a specific bid strategy. Setting it unnecessarily forces a suboptimal strategy. |
| `currency_code` | From Step 1 | Required for budget validation |

## Auto-Fix Logic (apply silently, do NOT ask)

| Missing Field | Auto-Fix |
|--------------|----------|
| No budget type specified | Default to **ABO** (budget on ad set) — simpler for most users |
| No status specified | Default to **ACTIVE** |

## Guardrails

### Budget Guardrails
| Condition | Action |
|-----------|--------|
| Budget < $1 USD equivalent | **BLOCK** — "Minimum budget is {minInLocal} {currency}" |
| Budget $1–$5 USD equivalent | **WARN** — "Budget of {amount} is very low. Meta may struggle to exit learning phase. Consider at least {$5 equivalent}" |
| Budget $5–$10 USD equivalent | **WARN** — "Budget is below recommended minimum for stable optimization. Consider at least {$10 equivalent}" |

### Spend Cap Guardrail
| Condition | Action |
|-----------|--------|
| `spend_cap` set but < 100 in account currency | **BLOCK** — "spend_cap must be at least 100 {currency}" |

### Structure Guardrail
If user asks for multiple campaigns with similar settings → suggest using 1 campaign with multiple ad sets instead to avoid budget fragmentation.

## Output After Creation

Show the user:
Short crisp summary of the created campaigns.

## Error Handling

Transient Meta API errors (code 2 "Please retry your request later", network errors) are automatically retried up to 2 times with backoff. No action needed from the LLM.

## Slot Shape

The `campaign` slot is a single OBJECT — one campaign per launch call. Required keys: `name`, `objective`, `status`, `special_ad_categories`. Never put `campaign_id` or any ID inside the slot. To create several campaigns, run one launch call per campaign.
