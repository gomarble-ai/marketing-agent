<!-- Synced from GoMarble server skill: prompts/skills/google_ads/create/asset -->

# Google Ads — Create / Update Asset

Tools: `google_ads_propose_create_asset`, `google_ads_propose_update_asset`, `google_ads_propose_update_pmax_asset_group`. Tool schemas describe shape; this skill covers the business rules.

## What this covers
- **Sitelinks** — link text + final URL, attached at customer / campaign / ad-group scope
- **Structured snippets** — header + values, attached at scope
- **Images** — uploaded image + image_field_type, attached at scope
- **PMax asset group updates** — separate tool for PMax-specific entity and asset-link changes

## V1 Capability Surface (non-schema)

- **Sitelink description rule:** if `description1` is set, `description2` is also required (and vice versa). Single-description sitelinks reject.
- **Structured snippet header:** must be one of Google's canonical English headers (Brands, Models, Services, Types, Styles, Featured Hotels, etc.). Custom headers reject.
- **Image validation:** the propose tool performs a bounded GET, validates public DNS and every redirect, MIME, file size, and dimensions before queueing.
- **Image field-type ↔ scope:** `AD_IMAGE` is only valid at `ad_group` scope. Other `image_field_type` values are valid at customer / campaign / ad_group scope.

## Status Convention (link statuses)

- New asset links default to `ENABLED`.
- Update can flip between `ENABLED` and `PAUSED` via `link_changes[]`. No removal.
- **`AUTOMATICALLY_CREATED` link statuses cannot be flipped** — they're managed by Google's auto-asset system. Propose tool rejects up front; surface that to the user.

## IMAGE Asset Immutability

IMAGE asset content (the binary, the name) cannot be updated post-create. To "replace" an image, create a new image asset and detach the old asset-group relationship. Do not propose name or content edits on an existing IMAGE asset.

## PMax Asset Group Updates

The PMax tool only applies to campaigns with `advertising_channel_type = PERFORMANCE_MAX`. If the user asks to use it on a Search campaign, reject and route to `references/asset.md` instead.

PMax updates are delta-based. Put each addition or removal in `new_state.asset_changes[]`; do not send top-level `headlines`, `long_headlines`, `descriptions`, image lists, or video lists. For `ADD`, provide `field_type` plus exactly one supported source (`text`, `image_url`, `youtube_video_id`, or `asset_resource_name`). For `REMOVE`, provide the exact `asset_group_asset_resource_name` returned by the current-state query. The server creates new image/text/video assets when needed and changes their asset-group relationships atomically.

## Error Handling

| `error_code` | Common trigger | Fix |
|---|---|---|
| 601 | Snippet header non-canonical, sitelink description1/2 mismatch, invalid PMax `asset_changes`, image URL/MIME/size/dimension validation | Read `validation_errors[]` |
| 403 | URL on a denied domain, asset-name dupe under same scope, IMAGE content-edit attempt, Google policy rejection | Surface |

## Output After Execution

> Done. Attached sitelink "<link_text>" to campaign `<campaign_name>` (asset id `<id>`).
