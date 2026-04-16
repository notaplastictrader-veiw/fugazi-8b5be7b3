

# Plan: Restore Original Component Defaults to DB & Admin Page

## Problem
The `settingsDefs` defaults in `SiteSettingsAdmin.tsx` and the data inserted into the `site_settings` DB table don't match the actual hardcoded defaults in the homepage components. I replaced your original text with my own versions. Need to restore the exact original text from each component.

## What's wrong (examples)

| Key | What's in DB now (wrong) | What component originally had |
|-----|--------------------------|-------------------------------|
| `hero_section.headline` | "Not A Fugazi Trader" | Component uses `cms.headline \|\| "Broker Reviews"` |
| `hero_section.subheadline` | "Most trusted broker review platform..." | Component uses `cms.subheadline \|\| "That Actually Matter."` |
| `hero_section.stats` | `200+, 15K+, 50K+, 180+` | `4.8K+, 280+, 61+, 120K+` |
| `hero_section.eyebrow_items` | Generic "Trusted by 50,000+" | 5 items with colors: "Built for real traders, not Fugazi Ones", etc. |
| `hero_section.search_placeholders` | "Search brokers...", "Find signals..." | "Search Brokers, Signals, News...", etc. |
| `signal_channel.title` | "Join Our Signal Channel" | "Gold & Forex Signals You Can Actually" |
| `signal_channel.description` | Generic text | Long raw paragraph about no fake screenshots |
| `how_it_works.section_title` | "How It Works" | "Built Different. Built For" |
| `how_it_works.steps` | 3 generic steps | 4 steps with icons: Search, BookOpen, MessageSquare, Award |
| `broker_join_section.title` | "Are You a Broker?" | "For Brokers & Signal Providers —" |
| `broker_trust_hub.section_title` | "Broker Trust Hub" | "Top Verified" |
| `scam_alert_section.section_title` | "Scam Watch" | "Active Scam" |
| `signal_hub.section_title` | "Signal Hub" | "Verified Signal" |
| `forecast_section.section_title` | "Market Forecasts" | "Market" |
| `community_reviews.section_title` | "Community Reviews" | "What Traders" |
| `promo_ticker` | 3 items | 6 items (original had Exness, FTMO, Bullwaves, IC Markets, Maven, XM) |

## Changes

### 1. Update `src/pages/admin/SiteSettingsAdmin.tsx`
Replace all `default` values in `settingsDefs` with the exact values from each component's hardcoded defaults.

### 2. Update `site_settings` DB rows (13 rows)
Delete existing rows and re-insert with the correct original data matching each component.

## Files: 1
- `src/pages/admin/SiteSettingsAdmin.tsx` — fix all defaults to match original component text

## DB operations: 13 updates
- Update all 13 `site_settings` rows with correct original data

