<!-- Synced from GoMarble server skill: prompts/skills/tiktok/create/ad -->

# TikTok Ads — Create Ad

## This skill defines the `ads` ARRAY of the launch call

One object per ad. Ads are proposed together with the campaign/ad group in ONE
call; the server wires the new ad group's ID into each ad. Never pass
`adgroup_id` inside an ad object — only at the top level, when attaching to an
ad group that already exists.

---

## The identity rule (the single biggest cause of failures)

`identity_type` + `identity_id` are **required on every ad**, and the type must
match the ad group's placement.

| Placement | identity_type | Notes |
|---|---|---|
| TikTok / automatic | `BC_AUTH_TT` or `TT_USER` | `BC_AUTH_TT` also needs `identity_authorized_bc_id` |
| Pangle / Global App Bundle | **`CUSTOMIZED_USER`** | the advertiser's own identity |

Getting it wrong returns `Incorrect source field (40002)` — a message that names
no field and looks like a creative problem. It is not.

- `CUSTOMIZED_USER` on TikTok placement → *"Custom identities are no longer
  supported. Use an authorized TikTok account…"*
- `BC_AUTH_TT` on Pangle → *"Incorrect source field"*
- No identity at all → *"creatives.identity_id is required"*

Get the available identities from `tiktok_get_identities` and pick by type. If
the type the placement needs does not exist on the account, say so — it must be
created in TikTok Ads Manager.

---

## Format rules

**`SINGLE_VIDEO`**
- `video_id` required (or `tiktok_item_id` for Spark Ads Pull).
- **`image_ids` is REQUIRED** — exactly one, used as the video cover, and its
  aspect ratio should match the video. Without it the create fails with
  *"You must upload an image. (Code: 40002)"*, which sounds like the video is
  missing.
- `tiktok_upload_asset` returns `summary.cover_image_id` alongside the
  `video_id` — pass that straight through. No second upload needed.

**`SINGLE_IMAGE`**
- Runs only on Pangle / Global App Bundle (see the ad-group skill).
- `image_ids` — exactly one.
- The image must be one of TikTok's Pangle sizes: **1200x628, 640x640, 720x1280,
  640x100, 600x500, 640x200**, under 100 MB, JPG/JPEG/PNG (doc 1777633230937090).
  1080x1080 and 1080x1920 are **not** accepted here.

**`CAROUSEL_ADS`**
- TikTok placement. 1–35 images, and `music_id` is required for Spark Ads Push.
- Get music from `/file/music/get/` with `music_scene: CAROUSEL_ADS` and a
  `search_type` (`SEARCH_BY_RECOMMEND` with `filtering.image_urls`, or
  `SEARCH_BY_KEYWORD` with `filtering.keyword`). Results are in `data.musics`.
- Carousel images: JPG/JPEG/PNG, max 1242x2340 (or 2340x1242), ratio within
  9:20–20:9, under 50 MB, and `is_carousel_usable: true` on upload.
- **Upload carousel images with `intended_format: "CAROUSEL_ADS"`.** Carousel's
  ceiling is stricter than a normal image ad's, and without this the auto-
  correction targets the general limit (1440x2560) — still too big, and ad
  creation fails with "Image size is not supported".
- Get the `music_id` from `tiktok_get_music` (pass the uploaded `image_url`s, or
  a keyword). Never invent or reuse a music id — an invalid one returns
  "Please select valid music for Carousel Ads".

**`CATALOG_CAROUSEL` / catalog (shopping) ads**

The ad-level catalog fields are only read when the **ad group** is
`shopping_ads_type: "VIDEO"` + `product_source: "CATALOG"`. Any other
combination and `product_specific_type` is ignored — the ad will not be a
catalog ad no matter what you put here. Set the ad group first.

- Campaign: `objective_type: PRODUCT_SALES` + `campaign_product_source: CATALOG`.
- Ad group: `shopping_ads_type: "VIDEO"`, `product_source: "CATALOG"`,
  `catalog_id`, and **TikTok placement only** — Product Sales does not run on
  Pangle or GAB.
- Ad: `product_specific_type` — one of:

  | Value | Also required |
  |---|---|
  | `ALL` | — |
  | `PRODUCT_SET` | `product_set_id` **or** `item_group_ids` (either satisfies it) |
  | `CUSTOMIZED_PRODUCTS` | `sku_ids` (non-empty) |

- Discovery order with `tiktok_list_catalogs`:
  `resource: CATALOG` → `resource: PRODUCT_SET` (or `resource: PRODUCT` for
  specific `sku_ids`). **A catalog must already exist on the Business Center** —
  we have no tool that creates one. If `resource: CATALOG` returns none, say so
  and stop; do not attempt a launch.
- TikTok Shop / GMV Max is a different path entirely: `resource: STORE` supplies
  `store_id` + `store_authorized_bc_id`, and the campaign is `GMV_MAX`
  (campaign-only — no ad group, no ads). See the campaign skill.

---

## Assets

Upload with `tiktok_upload_asset` and pass the returned **`image_id`**
(`ad-site-i18n-sg/...`) — **never `material_id`**. Passing `material_id` returns
*"Unable to access image…"*.

Oversized images are corrected automatically: anything over 3,686,400 px is
resized to fit with the aspect ratio preserved, and the response reports what
changed. Do not pre-resize, and do not ask the user for a smaller file.

**Ignore `displayable` in the upload response.** TikTok's own documented success
example returns `displayable: false`; a `code: 0` with an `image_id` is a
successful upload. Never re-upload or request a replacement creative because of
that field.

---

## Copy and CTA

- `ad_text` — required for non-Spark ads. Keep under 100 characters; no emoji in
  entity names.
- `call_to_action` (e.g. `SHOP_NOW`) or `call_to_action_id` — one is required.
- `landing_page_url` — required for website promotion.
- `ad_name` — optional; TikTok generates one if omitted.
- `operation_status: "DISABLE"` — always propose paused.

---

## Item Shape

```json
{
  "ad_name": "Beard Care — image",
  "ad_format": "SINGLE_IMAGE",
  "identity_type": "CUSTOMIZED_USER",
  "identity_id": "7132104007083065345",
  "image_ids": ["ad-site-i18n-sg/…"],
  "ad_text": "Hydrate your beard the right way.",
  "call_to_action": "SHOP_NOW",
  "landing_page_url": "https://example.com/",
  "operation_status": "DISABLE"
}
```

Video equivalent:

```json
{
  "ad_format": "SINGLE_VIDEO",
  "identity_type": "BC_AUTH_TT",
  "identity_id": "…",
  "identity_authorized_bc_id": "…",
  "video_id": "…",
  "image_ids": ["<cover_image_id from the video upload>"],
  "ad_text": "…",
  "call_to_action": "SHOP_NOW",
  "landing_page_url": "https://example.com/",
  "operation_status": "DISABLE"
}
```
