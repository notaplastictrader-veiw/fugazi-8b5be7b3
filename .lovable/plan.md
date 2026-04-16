

# Plan: Populate Database + Remove Bangla from Admin UI

## What's happening now
- The `site_settings` table is **completely empty** — no rows at all
- All homepage sections use `useSiteSettings()` hook which falls back to hardcoded defaults when DB has no data
- The SiteSettingsAdmin page has Bangla descriptions — needs English

## Two things to do

### 1. Insert all 13 CMS keys into `site_settings` table
Using the database insert tool, populate each key with the exact data structure each component expects. This way you can edit/delete/modify from admin and see changes on the homepage.

**Keys and what they control:**

| Key | What it does on the homepage |
|-----|-----|
| `promo_ticker` | Top scrolling promo bar messages |
| `ticker_pairs` | Top & bottom price ticker bars (XAU/USD, EUR/USD, etc.) |
| `hero_section` | Main hero banner — headline, subheadline, search placeholders, eyebrow rotating texts, bottom stats |
| `broker_trust_hub` | Broker listing section title & display count |
| `scam_alert_section` | Scam alerts section title, display count, CTA button text |
| `signal_channel` | Signal channel CTA — title, description, button texts |
| `signal_hub` | Signal groups listing — title, display count, CTA text |
| `forecast_section` | Market forecast section title & category tabs |
| `how_it_works` | Step-by-step guide — steps with icons, titles, descriptions |
| `community_reviews` | Reviews carousel section title & display count |
| `broker_join_section` | Broker partnership CTA — title, description, benefits list, button text |
| `hero_stats` | (Legacy) old stats format — kept for backward compatibility |
| `scam_alert_banner` | (Legacy) single scam warning text |

### 2. Replace all Bangla text in SiteSettingsAdmin.tsx with English
Every `description` field in `settingsDefs` array and the page header/subtitle will be changed to English.

## Files changed: 1
- `src/pages/admin/SiteSettingsAdmin.tsx` — All Bangla descriptions → English

## Database inserts: 13 rows
- Insert 13 rows into `site_settings` table with proper JSON values matching what each component expects

## Difference: "Global Settings" vs "Homepage Sections"
- **Global Settings** = things that affect the whole site (ticker bars, promo bar, legacy keys)
- **Homepage Sections** = content blocks on the homepage (hero, broker hub, scam watch, signals, forecasts, how it works, reviews, broker CTA)

Both live in the same `site_settings` table — the grouping is just for organization in the admin UI.

