---
name: meta-create-ad-with-creative
description: "Use when creating a Meta ad with its creative in one shot. Auto-detect landing page/CTA/UTM, creative analysis for copy, object_story_spec vs asset_feed_spec, text length guardrails, video thumbnail auto-gen. Loaded after the create master skill."
---
# Meta Ads - Create Ad with Creative

## CRITICAL: Do NOT combine with other creation steps
Each creation step (campaign → ad set → ad+creative) has its own separate flow. The ad+creative step happens AFTER campaign and ad set have been created and executed.

## Branch decision (read FIRST)

If the user mentions any of: "catalog ad", "DPA", "dynamic product ad", "shopping ad", "product feed ad", "product catalog" → jump to **Catalog Ad Flow** at the bottom. That flow has its own steps and uses `template_data` instead of uploaded creative assets.

Everything else (single image, single video, multi-asset) → standard flow below.

## user_input Rules

ONLY ask for 1 thing: creative asset upload. NOTHING ELSE.

Do NOT ask for primary_text, headline, landing_page_url, ad_name, creative_name, CTA, or any other field. Auto-detect and auto-generate ALL other fields. The user reviews and edits everything in the approval UI.

**Whenever you must ask the user to pick an ID (page, product set, catalog, etc.), use `user_input` with `type: "select"` — `value` = id, `label` = human-readable name. Never list IDs in chat text and ask the user to type one back.**

### user_input — 1 field only (creative asset)

| # | Field name | type | required | accept |
|---|-----------|------|----------|--------|
| 1 | `creative_assets` | file_upload | true | image/jpeg, image/png, image/gif, video/mp4, video/quicktime |

That's it. No other fields. If you add any other field to user_input, you are doing it wrong.

### ONE exception: Facebook Page selection

If the account has **multiple Facebook Pages** AND existing ads don't clearly indicate which one to use, ask the user via a second `user_input` with a `select` field:

| # | Field name | type | required | options |
|---|-----------|------|----------|---------|
| 1 | `facebook_page` | select | true | `[{ label: "Page Name 1", value: "page_id_1" }, …]` |

For single-page accounts, skip this entirely.

---

## CRITICAL: NEVER give up — always complete the full flow

When the user asks to "launch creatives" or "create ads", you MUST complete the FULL creation flow: Campaign → Ad Set → Ad+Creative.

**If `account_structure` is empty (new account with no existing campaigns/adsets/ads):**
- Do NOT stop and ask "give me an adset_id" or "tell me what to do"
- Do NOT say "I can't find existing structure"
- CREATE everything from scratch automatically (campaign → ad set → ad+creative)
- For budget: ask (no data to infer from)
- For landing page: infer from brand/context, or ask if you can't infer
- For text: auto-generate from creative analysis
- For everything else: use standard defaults

**If the user provides creatives/images in their message:**
- Treat the attached images as the creative assets — do NOT ask for upload again via `user_input`
- Skip Step 1 (user already provided assets) and go straight to Step 2

---

## Unsupported Creative Types (Hard Block — Do NOT Attempt)

If the user requests any of these, **stop immediately**, explain the limitation, and ask for a standard image or video instead.

| Unsupported Type | Why it's blocked | What to ask for instead |
|---|---|---|
| **Carousel ads** | Multi-card carousel (`child_attachments`) requires a separate creation path not yet implemented | Single image or video |
| **Ads from existing Facebook/Instagram posts** | Boosting/converting a post requires the `object_story_id` flow, not supported here | Standalone image or video upload |
| **Ads duplicated from existing ads** | Duplicating an existing ad (copy creative config, clone structure) is not supported | Fresh image or video upload |

### Enforcement Rules

1. **NEVER attempt** to construct a carousel (`child_attachments`), post-based (`object_story_id`), or duplicate ad flow even if you think you can infer the required parameters.
2. **If the user uploads multiple images intending a carousel** → do NOT default to carousel. Inform them carousels are not supported and ask which single image to use.
3. **If the user says "boost this post" or "use my existing post"** → respond: *"Boosting existing posts isn't supported in the current flow. Please upload a standalone image or video and I'll create a new ad with it."*
4. **If the user says "copy that ad" or "use the same creative as [ad name]"** → respond: *"Duplicating existing ads isn't supported here. Please upload a fresh creative asset to proceed."*

---

## Complete Workflow (follow in exact order)

### Phase 1: Gather Information

**Step 1: Ask user for creative asset**
Call `user_input` with ONLY `creative_assets` (file_upload). Wait for the upload.

**Step 2: Run these 2 calls IN PARALLEL immediately after getting the asset:**

| Call | Purpose |
|------|---------|
| `facebook_analyze_ad_creative_by_id_or_url` with `assetUrl` + `fastMode: true` | Get `text_hook`, `key_message`, `visual_hook`, `call_to_action`, `product_featured` |
| `facebook_get_details_of_ad_account` with `act_id` | Get `account_structure.ads` for landing page URLs, CTAs, UTM patterns, **and page_id from existing ads** |

**Step 2b: Resolve Facebook Page and Instagram BEFORE proposing (CRITICAL)**

⚠️ **BOTH `page_id` AND `instagram_user_id` are REQUIRED in every `creative_config`.** The server rejects any config missing either — there is NO server-side auto-detection or backfill. Resolve both before calling propose.

Follow this EXACT resolution chain. Do NOT skip steps.

1. **Existing ads** (`account_structure.ads[].creative`): extract `page_id` and `instagram_user_id`. One unique `page_id` → use it. Multiple → ask via `user_input` select showing page names.
2. **If no existing ads or no page_id found** → call `facebook_page_list`. Exactly 1 page → use it. Multiple → ask via select.
3. **If `facebook_page_list` returns 0 results** → call `facebook_list_ads` to get a recent ad ID, then `facebook_get_ad_creative_details` → extract both.
4. **ABSOLUTE RULE**: You are FORBIDDEN from calling `user_input` to ask for `page_id` or `facebook_page` until ALL THREE steps above have been attempted and returned zero results. Skipping any step is a critical error.
5. **Always pass both in the propose call**: set `creative_config.page_id` AND `creative_config.instagram_user_id`. Missing either → error 601.

For `instagram_user_id`: try existing ads → page's linked IG (via `facebook_page_list` or page details) → ask the user only as a last resort.

### Phase 2: Auto-Generate Everything (no user interaction)

**Step 3: Extract landing page URL**
From `account_structure.ads`, look at active ads — pick the most common destination URL.
- **Empty account** → infer from account/brand name (e.g., `https://www.{brand}.com`). If you can't infer, ASK once via `user_input` with a single `landing_page_url` text field. Do NOT give up.

**Step 4: Extract CTA pattern**
- Most common `call_to_action.type` across active ads (usually `SHOP_NOW` for Sales)
- Creative analysis suggests educational content → use `LEARN_MORE`

**Step 5: Extract UTM pattern**
- From `account_structure.ads` or `facebook_get_ad_creative_details` — `url_tags` pattern from top-spending active ads
- No existing ads → leave empty

**Step 6: Auto-generate text from creative analysis**
Build primary texts and headlines per the **Quality Framework** at the end of this skill.

⚠️ **MANDATORY: Always generate exactly 3 headlines and 4 primary texts per ad.** Every ad uses `creative_asset_groups_spec` so Meta tests all 12 combinations (4 × 3) and optimizes delivery. Single-text ads waste optimization opportunity.

- **4 Primary texts** (max 125 chars each): each must use a **different hook archetype** (Relatability, Confession, Contrast, Curiosity, Bold Claim, Imperative). Hook → Proof → CTA. Reader-first voice. Source from `key_message`, `text_hook`.
- **3 Headlines** (max 40 chars each): each must use a **different angle** (benefit-in-time, built-for-audience, action-without-pain). Sharp specific promise. No emoji.
- **Ad name**: first headline + format. **Creative name**: first headline + CTA.
- **User-provided text verbatim in conversation** → use as one variation; generate the rest.

**Step 7: Creative format — ALWAYS use Flexible Ads (`creative_asset_groups_spec`)**

This is the default for ALL ads — single image, single video, or multiple assets. Never use flat fields for ad creation. Does NOT require `is_dynamic_creative` on the ad set; standard ad sets work.

| Scenario | Correct Approach | Format |
|---|---|---|
| **Single image** | 1 Flexible Ad: 1 image + 4 primary texts + 3 headlines | `creative_asset_groups_spec` |
| **Single video** | 1 Flexible Ad: 1 video + 4 primary texts + 3 headlines | `creative_asset_groups_spec` |
| **Multiple images/videos for same ad** | 1 Flexible Ad: N images/videos + 4 primary texts + 3 headlines | `creative_asset_groups_spec` |
| **Different images each needing own ad** | Separate ads — each still uses `creative_asset_groups_spec` with 3 headlines + 4 primary texts | `creative_asset_groups_spec` |
| Placement-specific assets (same ad, different crop sizes) | **1 ad** using `asset_feed_spec` with `asset_customization_rules` | `asset_feed_spec` (exception) |

**DO NOT use flat fields** (`primary_text`, `headline` in `creative_config`) for ad creation. The only exception is placement-specific asset customization rules.

**Step 8: Handle placement assets** (only if user customized placements)
If the file upload result includes a `placements` object:
- Pass as `placement_assets` param
- Use `asset_feed_spec` with `asset_customization_rules` in `creative_config`
- Use EXACT URLs from placements — do NOT fabricate
- If NO `placements` object → use `creative_asset_groups_spec` with original URL

### Phase 3: Propose Directly

**Step 9: Call `facebook_propose_create_ad_with_creative` immediately**
Do NOT show a summary in chat. Do NOT ask for confirmation. The user reviews and edits everything in the approval UI.

**CRITICAL: Batch ALL ads in a SINGLE call.** Pass all of them as multiple items in the `ad_with_creative_configs` array — do NOT call the tool N times. One call with N items, not N separate calls. Each item gets its own approval card.

**Every ad MUST use `creative_asset_groups_spec` with exactly 4 primary texts and 3 headlines.** Each primary text uses a different hook archetype; each headline a different angle. Do NOT use flat fields. For multiple ads, vary the text variations per ad — do NOT reuse the same copy.

---

## Auto-Configure Reference (all silent — do NOT ask user)

| Field | Value | Source |
|-------|-------|--------|
| `name` (ad) | Auto-generate | first headline + format |
| `creative_config.name` | Auto-generate | first headline + CTA |
| `creative_asset_groups_spec.groups[0].texts` (primary_text) | **4 variations** (≤125 chars, different hook archetypes) | Creative analysis `key_message` / `text_hook` |
| `creative_asset_groups_spec.groups[0].texts` (headline) | **3 variations** (≤40 chars, different angles) | Creative analysis `text_hook` / `visual_hook` |
| `landing_page_url` | Auto-detect | Most common URL from active ads, or infer from brand |
| `page_id` | **REQUIRED** | Resolution chain: (1) existing ads → (2) `facebook_page_list` → (3) `facebook_list_ads` + `facebook_get_ad_creative_details` → (4) ask user. Server rejects if missing. |
| `instagram_user_id` | **REQUIRED** | Existing ads → page's linked IG → ask user. Server rejects if missing. |
| `cta_type` | Detected or `SHOP_NOW` | Existing ad patterns |
| `url_tags` | Detected UTM pattern | Existing ad patterns |
| `adset_id` | From prior step | `new_adset_id` from ad set execution |
| `status` | `PAUSED` | Safety default |

---

## Guardrails

### Text Length
| Field | Limit | Action |
|-------|-------|--------|
| Primary text | > 125 chars | **BLOCK** — shorten before proposing |
| Headline | > 40 chars | **BLOCK** — shorten before proposing |

### Image/Video Specs
| Format | Recommended Size | Max Size | Formats |
|--------|-----------------|----------|---------|
| Single Image | 1080x1080 (1:1) or 1200x628 (1.91:1) | 8 MB | JPG, PNG, GIF |
| Single Video | 1080x1080 (1:1) or 1080x1350 (4:5) | 200 MB | MP4, MOV |

---

## Creative Structure Reference

### Flat format (DEPRECATED — do NOT use for ad creation)

Flat fields (`primary_text`, `headline` directly in `creative_config`) are kept only for backward compatibility with EXISTING ads. For new ad creation, always use `creative_asset_groups_spec`. When using `creative_asset_groups_spec`, `creative_config` only needs `name`, `page_id`, and `instagram_user_id` — do NOT include flat fields or `asset_feed_spec` in `creative_config`.

### creative_asset_groups_spec — Flexible Ads (MANDATORY for all ad creation)

Meta tests all 12 combinations (4 primary texts × 3 headlines) and optimizes delivery. Does NOT require `is_dynamic_creative` on the ad set.

**Example: 1 image ad** (Relatability + Confession + Curiosity + Imperative hooks)
```json
{
  "creative_config": {
    "name": "Flexible Ad Creative",
    "page_id": "PAGE_ID",
    "instagram_user_id": "IG_ID"
  },
  "creative_asset_groups_spec": {
    "groups": [{
      "images": [{ "url": "CDN_URL_OF_IMAGE" }],
      "texts": [
        { "text": "Tired of a brittle beard? Aloe & Shea stops breakage.", "text_type": "primary_text" },
        { "text": "I used to hide my beard. Then I found Aloe & Shea.", "text_type": "primary_text" },
        { "text": "Why do most beard oils fail? Because they skip Shea.", "text_type": "primary_text" },
        { "text": "Say goodbye to brittle! Aloe & Shea restores softness.", "text_type": "primary_text" },
        { "text": "Stronger Beard in 7 Days", "text_type": "headline" },
        { "text": "Built for Beards That Break", "text_type": "headline" },
        { "text": "Say Goodbye to Brittle", "text_type": "headline" }
      ],
      "call_to_action": { "type": "SHOP_NOW", "value": { "link": "https://example.com" } }
    }]
  }
}
```

**Example: 1 video ad** (Relatability + Confession + Curiosity + Bold Claim hooks)
```json
{
  "creative_config": {
    "name": "Video Flexible Ad",
    "page_id": "PAGE_ID",
    "instagram_user_id": "IG_ID"
  },
  "creative_asset_groups_spec": {
    "groups": [{
      "videos": [{ "video_url": "CDN_URL_OF_VIDEO" }],
      "texts": [
        { "text": "Tired of a brittle beard? Aloe & Shea stops breakage.", "text_type": "primary_text" },
        { "text": "I used to hide my beard. Then I found Aloe & Shea.", "text_type": "primary_text" },
        { "text": "The hidden reason your beard keeps breaking.", "text_type": "primary_text" },
        { "text": "WARNING: Most beard oils skip the one ingredient that matters.", "text_type": "primary_text" },
        { "text": "Stronger Beard in 7 Days", "text_type": "headline" },
        { "text": "Built for Beards That Break", "text_type": "headline" },
        { "text": "Stop Breakage at the Root", "text_type": "headline" }
      ],
      "call_to_action": { "type": "SHOP_NOW", "value": { "link": "https://example.com" } }
    }]
  }
}
```

**Example: Multiple images** (Meta auto-selects per impression; Contrast hook variant)
```json
{
  "creative_config": {
    "name": "Multi-Image Flexible Ad",
    "page_id": "PAGE_ID",
    "instagram_user_id": "IG_ID"
  },
  "creative_asset_groups_spec": {
    "groups": [{
      "images": [
        { "url": "CDN_URL_IMAGE_1" },
        { "url": "CDN_URL_IMAGE_2" }
      ],
      "texts": [
        { "text": "Tired of a brittle beard? Aloe & Shea stops breakage.", "text_type": "primary_text" },
        { "text": "I used to hide my beard. Then I found Aloe & Shea.", "text_type": "primary_text" },
        { "text": "Old oil vs new formula — the difference is night and day.", "text_type": "primary_text" },
        { "text": "Say goodbye to brittle! Aloe & Shea restores softness.", "text_type": "primary_text" },
        { "text": "Stronger Beard in 7 Days", "text_type": "headline" },
        { "text": "Built for Beards That Break", "text_type": "headline" },
        { "text": "Say Goodbye to Brittle", "text_type": "headline" }
      ],
      "call_to_action": { "type": "SHOP_NOW", "value": { "link": "https://example.com" } }
    }]
  }
}
```

**Rules:**
- Each group requires: at least 1 image or video, `texts` array, `call_to_action` with `type` and `value.link`
- Each text entry requires `text` and `text_type` ("primary_text", "headline", or "description")
- Per-group limits: primary_text ≤ 5, headline ≤ 5, description ≤ 5, images ≤ 10, videos ≤ 10
- Character limits: primary_text ≤ 125, headline ≤ 40
- **No `is_dynamic_creative` needed** — works with any standard ad set
- Cannot be combined with `asset_feed_spec`

### asset_feed_spec — Legacy DCO or placement-specific assets

For multiple text variations, prefer `creative_asset_groups_spec` above. Only use `asset_feed_spec` for placement-specific asset customization rules or if you specifically need DCO.

`asset_feed_spec` requires the parent ad set to have `is_dynamic_creative: true`. If the ad set doesn't have this flag, Meta rejects with error code 100.

**Rules:**
- Requires: `ad_formats`, at least 1 image/video, `bodies`, `titles`, `link_urls`
- Limits: bodies ≤ 5, titles ≤ 5, descriptions ≤ 5, images ≤ 10, videos ≤ 10, link_urls ≤ 5
- `asset_customization_rules`: min 2 rules, labels must match actual images/videos

### CDN Auto-Upload
- Images: `{ url: "CDN_URL" }` → auto-uploaded to `{ hash: "IMAGE_HASH" }` during execution
- Videos: `{ video_url: "CDN_URL" }` → auto-uploaded to `{ video_id: "ID" }` during execution

---

## Quality Framework (Step 6)

Address the reader, not the product. Primary text structure: **Hook → Proof → CTA** (125 chars). Line 1 must make the reader say "that's me"; never open with product name or "Introducing...". One emoji per line, max 3, none on proof line, none in headlines. Premium brands (existing winning ads have zero emojis) → drop emojis entirely.

**Hook archetypes** (use a different one per ad in batched variants):

| Archetype | When `text_hook` / `product_featured` signals... | Pattern |
|---|---|---|
| Relatability | pain words: "tired", "struggling", "frustrated" | "Tired of [pain]?" |
| Confession | personal-switch story | "I used to [pain]. Then I [switch]." |
| Contrast | "vs", "instead of", "better than" | "[Old] vs [new]" |
| Curiosity | "hidden", "secret", "why" | "The hidden reason [X]..." |
| Bold Claim | "most X fail", category-redefining product | "WARNING: [uncomfortable truth]" |
| Imperative | default fallback | "Say goodbye to [pain]!" |

**Headline (≤40 chars):** sharp promise, sentence case, no emoji. Templates: "[Benefit] in [time]" / "Built for [audience]" / "[Action] without [pain]".

**Example (118 chars):** "Tired of a brittle beard? Aloe & Shea stops breakage at the root. Ready for a fuller look?"

**Before calling propose, verify:** exactly 4 primary texts + 3 headlines · ≤125/≤40 chars · each primary text uses a different hook archetype · each headline uses a different angle · Line 1 is a hook (not product description) · one concrete proof (ingredient/feature/number) · reader-first voice · user-provided text kept as one variation.

---

## Catalog Ad Flow (DPA / catalog / product feed ads)

Routed here from the branch decision at the top. Catalog ads pull product images and metadata from a Meta product catalog at serve time — they do NOT use uploaded creative assets and do NOT use `creative_asset_groups_spec`.

### Step C1 — Pre-flight: scope + catalog availability

Call `facebook_list_product_catalogs(act_id)`.

- ✅ Success with catalogs → continue to Step C2.
- ❌ `(#100) Requires business_management permission to access the field` (or `Requires catalog_management permission`) → the tool response includes a reconnect URL. **Show that URL to the user verbatim, explain that catalog ads need updated Meta permissions, and STOP.** Do NOT retry. Do NOT attempt any fallback. The user must reconnect before catalog ads will work.
- ❌ `NO_BUSINESS` → the ad account isn't associated with a Meta Business Manager. Tell the user: *"Catalog ads require a Meta Business Manager. Please set one up at business.facebook.com and associate this ad account with it."* STOP.
- ❌ `total: 0` (business exists but no catalogs) → tell the user: *"This business has no product catalogs. Please create one in Meta Commerce Manager first."* STOP.

### Step C2 — Pick catalog + product set

- Multiple catalogs → ask via `user_input` select with `label` = catalog name (include `product_count` if useful), `value` = catalog id.
- Exactly 1 catalog → use it.
- Call `facebook_list_product_sets(catalog_id)`. One set → use it. Multiple → ask via select.
- Capture BOTH `id` (→ `product_set_id`) AND `name` (→ `product_set_name`) from the chosen product set.

### Step C3 — Resolve page + Instagram

Same resolution chain as standard Step 2b. Both `page_id` and `instagram_user_id` are required for catalog ads as well.

### Step C4 — Build the catalog creative

Catalog ads use `object_story_spec.template_data` — NOT `creative_asset_groups_spec`. Meta fills templates at serve time from each product's catalog row. Do NOT ask for creative asset upload — catalog ads pull images from the catalog automatically.

```json
{
  "creative_config": {
    "name": "Catalog Ad - {ProductSetName}",
    "page_id": "PAGE_ID",
    "instagram_user_id": "IG_ID",
    "product_set_id": "PRODUCT_SET_ID",
    "product_set_name": "PRODUCT_SET_NAME",
    "object_story_spec": {
      "page_id": "PAGE_ID",
      "instagram_user_id": "IG_ID",
      "template_data": {
        "message": "Shop our {{product.name}} — now {{product.price}}",
        "link": "{{product.url}}",
        "name": "{{product.name}}",
        "description": "{{product.description}}",
        "call_to_action": { "type": "SHOP_NOW" }
      }
    }
  }
}
```

**Template variables available**: `{{product.name}}`, `{{product.price}}`, `{{product.url}}`, `{{product.description}}`, `{{product.brand}}`, `{{product.image[0].url}}`. Use them in `message`, `name`, `description`. The `link` field MUST be `{{product.url}}` so each card deep-links to its own PDP.

**Rules for catalog ads:**
- DO NOT include `image_url`, `video_url`, `headline`, `primary_text`, `landing_page_url`, or `creative_asset_groups_spec` — they conflict with `template_data` or are ignored.
- DO NOT generate 4×3 text variations — catalog ads use a single template_data block per ad.
- `product_set_name` is display-only; it's used by the approval UI alongside `product_set_id` so the user sees the human-readable name. It is not sent to Meta's Graph API.
- Default CTA is `SHOP_NOW`; switch to `LEARN_MORE` only if the creative analysis context suggests educational content.

### Step C5 — Propose

Same `facebook_propose_create_ad_with_creative` call. All catalog-specific fields (`product_set_id`, `product_set_name`, `template_data`) render as non-editable rows in the approval UI.

---

## Output After Full Creation Flow

Short crisp summary after the creation.

## Error Handling

Transient Meta API errors (code 2 "Please retry your request later", network errors) are automatically retried up to 2 times with backoff. No action needed from the LLM.

| Error | Action |
|-------|--------|
| `page_id is required in creative_config` (601) | LLM did not resolve page_id before calling. Follow the Step 2b resolution chain and retry. |
| `instagram_user_id is required in creative_config` (601) | LLM did not resolve instagram_user_id before calling. Follow the Step 2b resolution chain. |
| `Facebook Page {id} is not accessible` (601) | page_id is invalid or the connection lacks permission. Verify in Meta Business Suite or use `facebook_page_list` to find valid IDs. |
| `Instagram profile {id} is not accessible` (601) | instagram_user_id is invalid or unlinked. Verify the IG account is linked to the Facebook Page in Meta Business Suite. |
| `(#100) Requires business_management permission` / `Requires catalog_management permission` | Catalog-ads scope error. The tool response includes a reconnect URL — show it to the user verbatim and STOP. Do NOT retry until reconnect. |
| `NO_BUSINESS` (from `facebook_list_product_catalogs`) | Ad account not linked to a Meta Business Manager. Tell user to set one up at business.facebook.com. STOP. |
| `total: 0` catalogs (from `facebook_list_product_catalogs`) | No catalogs exist. Tell user to create one in Meta Commerce Manager. STOP. |
| `Dynamic creative ad sets allow for one active ad at most` | Parent ad set has `is_dynamic_creative: true` but you used `asset_feed_spec`. Use `creative_asset_groups_spec` instead — no DCO ad set needed. |
| `Only dynamic creative ads can be created as the ad set is a dynamic creative ad set` | The ad set has `is_dynamic_creative: true` but you sent flat fields. Use `asset_feed_spec` for DCO ad sets, or switch to `creative_asset_groups_spec` with a standard ad set. |
| `Cannot use both creative_asset_groups_spec and asset_feed_spec` | Pick one: `creative_asset_groups_spec` (preferred, no DCO needed) OR `asset_feed_spec` (legacy, needs DCO ad set). |
| `Please specify one of image_hash or image_url in the video_data` | Video thumbnail generation failed. Server auto-retries with Meta's thumbnails; if all fail, provide thumbnail image URL manually. |
| `An unexpected error has occurred. Please retry your request later` (code 2) | Auto-retried by the server. If persistent after retries, wait and try again. |
