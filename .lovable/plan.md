

# Plan: Site Settings — Complete CMS Keys with Descriptions

## Problem
Site Settings admin page এ শুধু 4টা পুরনো key আছে (`promo_ticker`, `ticker_pairs`, `hero_stats`, `scam_alert_banner`)। কিন্তু Homepage এর 9টা section আলাদা আলাদা CMS key use করে — সেগুলো admin page এ নেই। তাই বোঝা যায় না কোন key কী করে।

## Solution
`SiteSettingsAdmin.tsx` এর `defaultSettings` object এ সব missing CMS key যোগ করবো, প্রতিটার সাথে label/description দিয়ে। এতে admin panel এ সব key দেখা যাবে সঠিক example data সহ।

## All CMS Keys (mapped to Homepage sections)

| # | CMS Key | Homepage Section | Editable Fields |
|---|---------|-----------------|-----------------|
| 1 | `promo_ticker` | Top promo bar | Array of promo text strings |
| 2 | `ticker_pairs` | Top & Bottom ticker bars | Array of `{pair, price, change, up}` |
| 3 | `hero_section` | Hero (main banner) | `headline`, `subheadline`, `search_placeholders[]`, `eyebrow_items[]`, `stats[]` |
| 4 | `broker_trust_hub` | Broker listing section | `section_title`, `broker_count`, `prop_firm_categories[]` |
| 5 | `scam_alert_section` | Scam alerts section | `section_title`, `cta_text`, `display_count` |
| 6 | `signal_channel` | Signal channel CTA | `title`, `description`, `cta_primary`, `cta_secondary` |
| 7 | `signal_hub` | Signal groups listing | `section_title`, `cta_text`, `display_count` |
| 8 | `forecast_section` | Market forecasts | `section_title` |
| 9 | `how_it_works` | How it works steps | `section_title`, `cta_text`, `steps[]` |
| 10 | `community_reviews` | Reviews carousel | `section_title`, `display_count` |
| 11 | `broker_join_section` | Broker CTA section | `title`, `description`, `benefits[]`, `cta_text` |
| 12 | `hero_stats` | (legacy — hero uses hero_section now) | Keep for backward compat |
| 13 | `scam_alert_banner` | (legacy banner text) | Keep for backward compat |

## Changes — 1 file

### `src/pages/admin/SiteSettingsAdmin.tsx`
- Replace `defaultSettings` with all 13 keys, each with full example JSON
- Add a description/label for each key (shown above the textarea) explaining what it controls and where it appears on the homepage
- Group keys by section with visual separators (e.g., "🏠 Homepage Sections", "📊 Tickers", "⚙️ Legacy")

## Technical Detail
Each card will show:
1. Key name (mono font, e.g. `hero_section`)
2. Description text (e.g. "Controls the main hero banner — headline, search placeholders, rotating eyebrow items, and bottom stats")
3. JSON textarea with full example data pre-filled
4. Save button

