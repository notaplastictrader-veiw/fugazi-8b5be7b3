

## Free economic calendar — options

You already have a `/calendar` page wired to a `calendar_events` Supabase table with admin CRUD (`CalendarAdmin.tsx`) and a falling-back static list. The question is what **free live data source** to use to populate it automatically (like we did for news with Finnhub).

## Free options compared

| Source | Free? | API key | Coverage | Notes |
|---|---|---|---|---|
| **TradingEconomics** | ✅ Guest key `guest:guest` | No signup | Limited to a few countries (US, MX, NZ, SE, TH) on guest | Easiest to start; upgrade later for full coverage |
| **Finnhub** `/calendar/economic` | ⚠️ Premium-only on free tier | Existing key | Full global coverage | Returns 403 on free plan — not usable without paid upgrade |
| **FMP (Financial Modeling Prep)** | ✅ 250 calls/day free | Signup required | Global | Good free tier, needs API key |
| **Investing.com / Forex Factory** | ❌ No public API | — | — | Scraping violates ToS — skip |
| **Manual via admin** | ✅ Already built | — | Whatever you add | Zero cost, zero automation |

## Recommendation

Two-step approach, same pattern as the news feed:

1. **TradingEconomics guest endpoint** as the live source — no signup, works immediately. Limited country coverage but covers major USD events. URL: `https://api.tradingeconomics.com/calendar?c=guest:guest&f=json`
2. **Keep the admin CRUD** as the override/supplement layer. Anything you add manually in `CalendarAdmin` takes priority and shows alongside live events.

If guest coverage feels too thin later, swap to **FMP free tier** (need to add `FMP_API_KEY` secret) for full global coverage at 250 calls/day — well within a 5-min cache budget.

## What I'd build (when you approve)

- New edge function `get-economic-calendar` — fetches TradingEconomics guest feed, normalizes to your `calendar_events` shape, caches 15 min in `site_settings.calendar_cache`.
- New hook `useEconomicCalendar` — same pattern as `useForexNews`.
- Update `/calendar` page — merge live events with published DB events (DB wins on duplicate by title+date), keep existing impact filter, group by date.
- Homepage: optional small "Today's events" widget if you want it (3 high-impact only) — let me know.

## Question for you

Which source do you want to start with?
- **A.** TradingEconomics guest (zero setup, limited countries) — recommended to start
- **B.** FMP free tier (full global, needs API key signup)
- **C.** Manual only — keep admin CRUD, no live feed

