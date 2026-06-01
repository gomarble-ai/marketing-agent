---
name: google-ads-create-asset
description: "Use when creating Google Ads assets (sitelinks, callouts, structured snippets, images). Loaded after the create master skill."
---
# Google Ads — Create / Update Asset

Tools: `google_ads_propose_create_asset`, `google_ads_propose_update_asset`, `google_ads_propose_update_pmax_asset_group`. Tool schemas describe shape; this skill covers the business rules.

## What this covers
- **Sitelinks** — link text + final URL, attached at customer / campaign / ad-group scope
- **Structured snippets** — header + values, attached at scope
- **Images** — uploaded image + image_field_type, attached at scope
- **PMax asset group updates** — separate tool for PMax-specific link/status flips

## V1 Capability Surface (non-schema)

- **Sitelink description rule:** if `description1` is set, `description2` is also required (and vice versa). Single-description sitelinks reject.
- **Structured snippet header:** must be one of Google's canonical English headers (Brands, Models, Services, Types, Styles, Featured Hotels, etc.). Custom headers reject.
- **Image content-type:** the propose tool runs an HTTP HEAD on `image_url` before queueing — non-200, non-`image/*`, or unreachable URLs are rejected at validation, not at execute time.
- **Image field-type ↔ scope:** `AD_IMAGE` is only valid at `ad_group` scope. Other `image_field_type` values are valid at customer / campaign / ad_group scope.

## Status Convention (link statuses)

- New asset links default to `ENABLED`.
- Update can flip between `ENABLED` and `PAUSED` via `link_changes[]`. No removal.
- **`AUTOMATICALLY_CREATED` link statuses cannot be flipped** — they're managed by Google's auto-asset system. Propose tool rejects up front; surface that to the user.

## IMAGE Asset Immutability

IMAGE asset content (the binary, the name) cannot be updated post-create. To "replace" an image, create a new image asset and detach (pause) the old one. Do not propose name or content edits on an existing IMAGE asset.

## PMax Asset Group Updates

The PMax tool only applies to campaigns with `advertising_channel_type = PERFORMANCE_MAX`. If the user asks to use it on a Search campaign, reject and route to `google-ads-create-asset` instead.

Headline / long-headline / description updates on a PMax asset group are full-replacement — provide the complete final list.

## Error Handling

| `error_code` | Common trigger | Fix |
|---|---|---|
| 601 | Snippet header non-canonical, sitelink description1/2 mismatch, AD_IMAGE outside ad_group scope, image URL fails HEAD probe | Read `validation_errors[]` |
| 403 | URL on a denied domain, asset-name dupe under same scope, IMAGE content-edit attempt | Surface |

## Output After Execution

> Done. Attached sitelink "<link_text>" to campaign `<campaign_name>` (asset id `<id>`).
