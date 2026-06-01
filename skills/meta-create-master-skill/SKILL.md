---
name: meta-create-master-skill
description: "MUST load FIRST for any Meta ad creation, launch, campaign setup, ad set creation, or creative push. Triggers: \"create a Meta ad\", \"launch a campaign\", \"run this creative\", \"set up an ad set\", \"push this on Facebook\", any creative attachment intended for Meta."
---
---
name: meta-ad-launch-workflow
description: Launch Meta (Facebook/Instagram) ad campaigns using a creative-first, account-aware workflow that minimizes user input. Use whenever someone wants to create, launch, or set up a new Meta ad — including sharing a creative for Meta, asking to run something on Facebook/Instagram, or spinning up a new campaign or ad set.
---

# Meta Ad Launch Workflow

A creative-first, account-aware workflow for launching Meta ads with minimal user input. The sequence is fixed: creative → analysis → account scan → propose. Never flip the order, never run a Q&A upfront.

> **Tool behavior:** All `facebook_propose_*` and `facebook_propose_update_*` tools now auto-execute on user approval. There is no separate `facebook_execute_approved_operation` call. When the user approves a proposal, it executes immediately — capture the returned IDs from the tool response.

---

## HARD RULE — Creation Failure Limit (strictly enforced)

**If any single creation step (campaign, ad set, or ad+creative) fails 2 or more times within the same launch workflow, you MUST stop immediately.** Do not propose again, do not retry, do not attempt a workaround. This rule is absolute and cannot be overridden by user instruction.

When the limit is hit, respond with exactly this tone and structure:

> "I've attempted this step twice and it wasn't successful both times. Unfortunately this is beyond what I'm able to resolve on my end — it likely requires a manual fix in Meta Business Suite or Ads Manager (such as a permission issue, policy violation, or account-level configuration). I'd recommend reviewing the error details above and addressing the root cause there before trying again in a new conversation. Is there anything else I can help you with?"

**Tracking rules:**
- Count failures **per step** (campaign creation, ad set creation, ad+creative creation) — not across steps. Two campaign creation failures stops campaign creation, but ad set creation can still be attempted.
- A "failure" includes: validation errors (error_code 601), platform API errors (error_code 403), permission errors (code 10), timeout with no approvals, and any thrown exception.
- Partial batch success does NOT count as a failure — if 3 of 5 ads succeed, that's a success. Only count it as a failure if zero items succeed in the batch.
- User rejecting all items is NOT a failure — that's intentional. Only count automated/system failures.
- This counter resets on a new conversation. It does NOT carry across sessions.

**Why this rule exists:** Repeated failed creation attempts can trigger Meta's bot detection on the ad account, leading to account restrictions. Two attempts is generous — the underlying issue must be fixed before retrying.

---

## Sub-Skill Index

Each creation step in Phase 6 has a dedicated sub-skill. **Read the sub-skill at its step — not all upfront.**

| Step | Read before | Path |
|------|------------|------|
| Create campaign | Calling `facebook_propose_create_campaign` | `meta-create-campaign` |
| Create ad set | Calling `facebook_propose_create_adset` | `meta-create-adset` |
| Create ad + creative | Calling `facebook_propose_create_ad_with_creative` | `meta-create-ad-with-creative` |

---

## Phase 1 — Get the Creative

The creative comes first. Always.

- If the user attached an image, video, or carousel — proceed to Phase 2.
- If they referenced an existing ad — pull it from the account and proceed.
- If nothing is attached — ask exactly one question: *"Share the creative, or point me to an existing ad to clone."* Nothing else. No objective, no budget, no audience questions.

---

## Phase 2 — Analyze the Creative

Extract the following before touching any account data:

- **Format** — image / video / carousel; aspect ratio
- **Hook style** — bold claim, UGC, problem-agitation, offer-led, curiosity
- **Value prop** — the core promise the viewer receives
- **CTA** — what action the creative drives (shop, sign up, learn more, get quote)
- **Audience signals** — demographic cues, lifestyle markers, occasion, problem context
- **Funnel stage** — TOF (cold awareness), MOF (consideration), BOF (offer / retargeting)
- **On-creative copy** — any text baked into the asset (to avoid redundancy in ad copy)

Output a 4–6 line readout of what you saw. Keep going — don't pause for confirmation.

---

## Phase 3 — Scan the Account

Pull everything needed to propose without asking. Synthesize into 1–2 lines — never dump raw data at the user.

Collect:
- Top 1–3 campaigns by performance (last 30 days) — objective, optimization event, bid strategy, geos, age range, placements
- Top performing creatives — format, hook style, copy length (what's already resonating)
- Active pixel(s)
- Connected Instagram account(s)
- Existing custom audiences and lookalikes

**If no active campaigns exist:** scan paused campaigns and paused ad sets. Use the most recently paused or historically best-performing paused campaign as the structural reference — treat it identically to an active top performer. Note it's paused in the Source column ("Paused reference: `<campaign>`"). Only fall back to cold-start defaults if the account has zero campaigns of any status.

**Synthesis output (1–2 lines max):** "Ref: `<campaign>` — Sales / Purchase / broad US 25–55 / $80/day / Advantage+ / ROAS 3.2x [paused]. Pixel `<n>`, IG `<handle>`."

---

## Phase 4 — Propose or Ask

After Phases 2 and 3, the configuration table should be mostly filled. Default to proposing. Only ask if something is genuinely undetermined.

**Propose directly — no question — when:**
- Funnel stage matches an existing top campaign type
- A single pixel and IG account exist
- A reusable audience is available (CA, LAL, or broad that's performing)
- Budget magnitude can be inferred from top performers
- Optimization is obvious from the objective

**Ask only when:**
- Multiple ad accounts exist and the right one is unclear
- Creative funnel stage could legitimately be TOF or BOF
- Brand-new account with no reference data and budget is unknown
- Multiple conflicting pixels with no clear top-campaign preference

When asking is unavoidable — batch into one turn, maximum 2 questions, use tappable options not open text.

**Targeting search:** When building audience targeting for the ad set, use `facebook_search_targeting` to find interest/behavior/demographic IDs:
- `search_type: "adinterest"` + `query` — free-text search (e.g., "yoga", "anime", "running shoes")
- `search_type: "adinterestsuggestion"` + `interest_list` — expand from existing interests
- `search_type: "adTargetingCategory"` + `class` — browse by category (interests, behaviors, demographics, life_events, income, industries, family_statuses, user_device, user_os, etc.)
- Always use the returned `id` and `name` in `targeting.flexible_spec[].interests/behaviors/etc.`

---

## Phase 5 — Propose Configuration

Before launching the proposal, show a configuration summary table:

| Field | Proposed value | Source |
|---|---|---|
| Objective | Sales | Mirrors top campaign |
| Optimization event | Purchase | Account default |
| Daily budget | $50 | Median of top 3 campaigns |
| Bid strategy | Highest volume | Mirrors top campaign |
| Audience | Broad, US/CA, 25–55 | Top campaign + creative signals |
| Placements | Advantage+ | Mirrors top campaign |
| Pixel | `<n>` | Active pixel |
| Instagram account | `<handle>` | Active IG |
| Primary text | `<drafted from value prop>` | Creative analysis |
| Headline | `<drafted from hook>` | Creative analysis |
| CTA button | Shop Now | Matches creative CTA |
| Schedule | Continuous, starts now | Default |

Then send the proposal. The proposal itself handles user confirmation — don't add a "shall I proceed?" message after it.

---

## Phase 6 — Execute & Enable

Execution order is strict: campaign → ad set → ad+creative. Each step is propose → approve (auto-executes). Never merge steps.

> **Reminder:** Proposals auto-execute on approval. Capture IDs from the tool response after each approval. Do not call a separate execute tool.

> **Reminder — failure limit:** If any step below fails twice (zero items succeed), stop the entire workflow. See the HARD RULE section above.

### 6.1 — Create Campaign
-> **Read `meta-create-campaign` now.**
Follow its workflow exactly. Propose campaign -> user approves -> executes automatically -> capture `new_campaign_id` from the tool response.

### 6.2 — Create Ad Set
-> **Read `meta-create-adset` now.**
Follow its workflow exactly. Propose ad set (using `new_campaign_id`) -> user approves -> executes automatically -> capture `new_adset_id` from the tool response.

### 6.3 — Create Ad + Creative
-> **Read `meta-create-ad-with-creative` now.**
Follow its workflow exactly. Propose all ads in ONE batched call (using `new_adset_id`) -> user approves -> executes automatically -> capture all `new_ad_id` values from the tool response.

Campaigns and ad sets are created as **ACTIVE**. Ads are created as **PAUSED** — they are the user's final gate before spending begins. After all creations succeed, enable only the ads.

---

### Enable Sequence — Enable ads (1 call)

Campaigns and ad sets are already ACTIVE. Only ads need enabling. Batch ALL ads into ONE `facebook_propose_update_ads` call:

```json
facebook_propose_update_ads({
  "act_id": "act_XXX",
  "ads": [
    {
      "ad_id": "<new_ad_id_1>",
      "current_state": { "status": "PAUSED" },
      "new_state": { "status": "ACTIVE" },
      "description": "Enable ad: <ad_name_1>",
      "thumbnail_url": "<thumbnail_url_1>",
      "campaign_id": "<new_campaign_id>",
      "campaign_name": "<campaign_name>",
      "adset_id": "<new_adset_id>",
      "adset_name": "<adset_name>",
      "ad_name": "<ad_name_1>"
    },
    {
      "ad_id": "<new_ad_id_2>",
      "current_state": { "status": "PAUSED" },
      "new_state": { "status": "ACTIVE" },
      "description": "Enable ad: <ad_name_2>",
      "thumbnail_url": "<thumbnail_url_2>",
      "campaign_id": "<new_campaign_id>",
      "campaign_name": "<campaign_name>",
      "adset_id": "<new_adset_id>",
      "adset_name": "<adset_name>",
      "ad_name": "<ad_name_2>"
    }
  ]
})
```
-> user approves each ad individually -> each executes automatically on approval

**CRITICAL: 5 ads = 1 call with 5 items in the ads array. NOT 5 separate calls.**

**Never skip the enable approval step.** The user must explicitly approve going live — even if they said "just launch it" earlier.

---

## Edge Cases

- **No active campaigns, paused exist:** Use best paused campaign as reference. Label source as "Paused ref" in the table.
- **No campaigns at all:** Cold-start defaults — $20/day, broad targeting, Advantage+ placements, objective from CTA. Flag once, briefly.
- **Multiple creatives at once:** One campaign, one ad set, multiple ads. If funnel stages clearly differ -> separate ad sets.
- **"Just launch it":** Fast version — one reference lookup, then propose. Never skip the scan.
- **Cloning an existing ad:** Pull structure, swap creative, only surface what's changing in the table.
- **Off-brand creative:** One sentence flag in the readout. Still propose.
- **"Launch it live" / "Make it active":** Campaigns and ad sets are created ACTIVE. Ads are always created PAUSED first — the enable step is the user's final gate before spending begins.

---

## Output Rules

Every response the user sees should be short and scannable. No walls of text.

- **Phase 2 readout:** 2–3 lines max. Format / Hook / Funnel stage / CTA. No headers.
- **Phase 3 synthesis:** 1–2 lines. Campaign name, key numbers, pixel, IG. Done.
- **Phase 4 (if asking):** One short message framing the question + tappable options. No preamble.
- **Phase 5:** Configuration table + proposal. No follow-up "shall I proceed?" message.
- **Phase 6 enable:** No extra message after proposing the enable. The approval cards are the confirmation. After execution, one line: "Live. Ads are now active under `<campaign>`."
- Never show raw API output. Never repeat information already shown in a previous phase.
