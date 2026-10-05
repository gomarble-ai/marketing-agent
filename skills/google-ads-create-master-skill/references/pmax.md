<!-- Synced from GoMarble server skill: prompts/skills/google_ads/create/pmax-skill -->

# Google Ads — Create Performance Max

Use `google_ads_propose_create_pmax_asset_group`. Do not put PMax into the Search `campaign_structure` tool: PMax uses `AssetGroup`, `Asset`, and `AssetGroupAsset` resources rather than Search ad groups and responsive search ads.

## Scope

This tool supports standard PMax for online sales or lead generation. It does not create Merchant Center retail/feed campaigns, listing-group filters, local-services PMax, or travel-goal PMax.

Each `asset_groups[]` item is independently approved and becomes one atomic `googleAds:mutate` request. Provide exactly one of:

- `campaign`: create a new PMax campaign and its first asset group.
- `campaign_id`: add an asset group to an existing PMax campaign.

Batch multiple asset groups in one call when useful. A failure in one item does not affect another item, but an individual item is all-or-nothing.

## Before proposing

1. Resolve the 10-digit customer ID and manager ID.
2. Call `google_ads_get_currency`; send `currency_code`, and express `daily_budget` and `target_cpa` in that currency.
3. For a new campaign, confirm the account has conversion tracking. PMax only supports `MAXIMIZE_CONVERSIONS` or `MAXIMIZE_CONVERSION_VALUE`; it cannot fall back to Maximize Clicks.
4. For an existing campaign, the tool verifies that it is PMax, is not removed, and that the supplied `brand_guidelines_enabled` matches the campaign.
5. Default both campaign and asset group to `PAUSED` unless the user explicitly asks to enable them.

## Required asset-group assets

- `headlines`: 3–15, maximum 30 characters each.
- `long_headlines`: 1–5, maximum 90 characters each.
- `descriptions`: 2–5, maximum 90 characters each, with at least one description at most 60 characters.
- `marketing_images`: 1–20 landscape 1.91:1 images, minimum 600×314; 1200×628 recommended.
- `square_marketing_images`: 1–20 square images, minimum 300×300; 1200×1200 recommended.
- `final_urls`: at least one HTTP(S) landing page.

Images must be JPEG, PNG, or GIF and at most 5 MB. An image entry uses exactly one source: `{image_url, name}` to create an asset, or `{asset_resource_name}` to reuse an asset belonging to the same customer. Google validates aspect ratio when the asset is linked, so pick images that exactly match the field type.

Optional: up to 20 `portrait_marketing_images` (4:5, minimum 480×600), up to 15 `youtube_videos` (at least 10 seconds), display paths, mobile URLs, and audience signals.

## Brand guidelines

Always set `brand_guidelines_enabled` explicitly.

For a new campaign, always provide exactly one `business_name` (maximum 25 characters) and 1–5 square `logo_images`.

- When true, brand assets are campaign-level `CampaignAsset` links. `LOGO` plus `LANDSCAPE_LOGO` has a combined maximum of five, and all brand links must be in the campaign-creation request.
- When false, brand assets are `AssetGroupAsset` links. Up to five square logos and up to 20 optional landscape logos are allowed.
- For an existing guidelines-enabled campaign, omit business name and logos; the campaign already owns its brand assets.
- For an existing guidelines-disabled campaign, provide business name and square logo because every new asset group needs them.

## Campaign fields

A new `campaign` requires name, one of `daily_budget` or `budget_id`, bidding strategy, non-empty geo targets, and status.

- `MAXIMIZE_CONVERSIONS`: optional `target_cpa`.
- `MAXIMIZE_CONVERSION_VALUE`: optional `target_roas` as a decimal ratio, for example `3.5` for 350%.
- `final_url_expansion_enabled` is optional; PMax defaults final URL expansion on. Set false only when the user wants to opt out.
- Languages default to English (`languageConstants/1000`).
- The channel is always `PERFORMANCE_MAX`; never set an advertising channel subtype.

## Example minimum launch

```json
{
  "customer_id": "1234567890",
  "currency_code": "USD",
  "asset_groups": [{
    "campaign": {
      "campaign_name": "PMax — Autumn",
      "daily_budget": 75,
      "bidding_strategy_type": "MAXIMIZE_CONVERSIONS",
      "geo_targets": ["United States"],
      "status": "PAUSED"
    },
    "brand_guidelines_enabled": true,
    "business_name": "Acme",
    "logo_images": [{"image_url": "https://cdn.example.com/logo.png", "name": "Acme logo"}],
    "name": "Autumn collection",
    "final_urls": ["https://example.com/autumn"],
    "status": "PAUSED",
    "headlines": ["Shop Autumn Styles", "New Acme Arrivals", "Fast Delivery"],
    "long_headlines": ["Discover the latest Acme autumn collection"],
    "descriptions": ["Shop the collection today.", "Quality styles delivered to your door."],
    "marketing_images": [{"image_url": "https://cdn.example.com/autumn-wide.jpg", "name": "Autumn wide"}],
    "square_marketing_images": [{"image_url": "https://cdn.example.com/autumn-square.jpg", "name": "Autumn square"}]
  }]
}
```

The runtime injects `operation_id`. Do not invent it. After approval, report both the campaign resource name (for a new campaign) and the asset-group resource name returned by execution.
