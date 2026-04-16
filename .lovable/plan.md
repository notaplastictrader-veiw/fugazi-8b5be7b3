

# Plan: Complete CMS Alignment + Populate Empty Tables

## Problem
1. **Signal groups, forecasts, and reviews tables are empty** (0 rows each) — frontend falls back to hardcoded data instead of DB data
2. **Many sections have hardcoded subtitles/descriptions** not editable from CMS — unlike Broker Trust Hub which is now fully editable

## Part 1: Insert Data into Empty Tables

### signal_groups table (3 rows)
| Name | Win Rate | Monthly | Avg R:R | Track Record | Members | Status |
|------|----------|---------|---------|--------------|---------|--------|
| Gold Pulse Signals | 81 | 35 | 1:2.4 | 14 months | 4,200 | published |
| Asia FX Scalpers | 84 | 48 | 1:1.8 | 22 months | 12,400 | published |
| Prop Killer Trades | 78 | 60+ | 1:3.1 | 9 months | 8,900 | published |

### forecasts table (5 rows)
| Pair | Direction | Potential | Category | Status |
|------|-----------|-----------|----------|--------|
| XAU/USD | bullish | HIGH | forex | published |
| EUR/USD | bearish | MED | forex | published |
| GBP/USD | bullish | HIGH | forex | published |
| Gold Spot | bullish | HIGH | gold | published |
| BTC/USD | bullish | HIGH | crypto | published |

### reviews table (8 rows)
All 8 fallback reviews (Tyler Mather, Wei Wen Chin, Claudio Pensa, etc.) with correct ratings, content, roles, and avatars — status: published.

## Part 2: Add Missing CMS Fields to Each Section

### What's hardcoded but should be editable:

| Section | Missing from CMS |
|---------|-----------------|
| Scam Alert | subtitle (hardcoded in component) |
| Signal Hub | subtitle "Every Telegram group listed..." |
| Signal Channel | bullet points list, tier features |
| Forecast | subtitle "Daily analysis. No paid promotions..." |
| Community Reviews | (already good) |
| Broker Join | subtitle "Reach 120,000+ real traders worldwide..." |

### Changes per section:

**ScamAlertSection.tsx** — read `cms.subtitle`
**SignalHub.tsx** — read `cms.subtitle`
**SignalChannel.tsx** — read `cms.features_list` for bullet points
**ForecastSection.tsx** — read `cms.subtitle`
**BrokerJoinSection.tsx** — read `cms.subtitle`

### SectionEditor.tsx — add subtitle fields to each section config

### site_settings DB — update each key with the new subtitle values

## Part 3: Fix audit_log Error
The network requests show `invalid input syntax for type uuid: "broker_trust_hub"` — the `record_id` column is UUID but code passes the settings key string. Fix the `logAuditAction` call in SectionEditor to pass the actual row UUID.

## Files Changed: 6
- `src/components/sections/ScamAlertSection.tsx` — read cms.subtitle
- `src/components/sections/SignalHub.tsx` — read cms.subtitle  
- `src/components/sections/SignalChannel.tsx` — read cms.features_list
- `src/components/sections/ForecastSection.tsx` — read cms.subtitle
- `src/components/sections/BrokerJoinSection.tsx` — read cms.subtitle
- `src/pages/admin/SectionEditor.tsx` — add subtitle fields + fix audit log UUID

## DB Operations
- INSERT 3 rows into `signal_groups`
- INSERT 5 rows into `forecasts`
- INSERT 8 rows into `reviews`
- UPDATE 5 rows in `site_settings` (add subtitle values)

