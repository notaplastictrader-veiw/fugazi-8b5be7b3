

## Replace TradingEconomics with JBlanked News API

Your current calendar feed uses TradingEconomics' guest endpoint, which started returning **HTTP 410 (Gone)** today (see edge function logs). JBlanked is a solid replacement — better data quality, 8 major currencies, multiple sources (MQL5, Forex Factory, FxStreet), and richer fields (Outcome, Strength, Quality).

## ⚠️ Critical free-tier constraint

The JBlanked docs say:

> Due to a huge increase in traffic, **free API usage has decreased to 1 request per day.**

Premium use costs 1 credit per call. So we must cache aggressively — **once-per-day refresh** on free tier. This is fine because the calendar doesn't change minute-to-minute.

## What JBlanked offers (3 APIs)

| API | What it does | Use for your site |
|---|---|---|
| **Calendar** | Today / This Week / Date Range events from MQL5, Forex Factory, FxStreet. 8 currencies, impact levels, Outcome/Strength/Quality fields | ✅ Replace current calendar feed |
| **GPT** | AI sentiment analysis on news events & central-bank speeches | Optional — could enrich `/news` cards with AI sentiment badges |
| **Backtesting** | Historical impact data + ML predictions per event | Optional — niche, more for trading bots than your review platform |

**Recommendation:** Use **Calendar** now, skip GPT/Backtesting unless you want them later.

## Plan

### 1. Store API key as secret
Add `JBLANKED_API_KEY = 1xGelG27axaU2VzR3MDEpVCgmjiMlqGw` via the secrets tool. Never expose it client-side.

### 2. Rewrite `get-economic-calendar` edge function
- **Source:** `https://www.jblanked.com/news/api/forex-factory/calendar/week/` (Forex Factory = best-known, full week of events).
- **Auth:** `Authorization: Api-Key <key>` header.
- **Cache TTL:** bump from 15 min → **24 hours** to respect 1-req/day limit. Keep the existing `site_settings.calendar_cache` row.
- **Normalize** JBlanked fields to your existing `CalendarEvent` shape:
  - `Name` → `title`
  - `Currency` → `currency`
  - `Category` → `description`
  - `Impact` ("High"/"Medium"/"Low"/"None") → `impact` (lowercase, "none"→"low")
  - `Date` ("2024.02.08 15:30:00", **EST**) → split into `event_date` (UTC YYYY-MM-DD) + `event_time` (UTC HH:MM)
  - `Actual` / `Forecast` / `Previous` → `actual_value` / `forecast_value` / `previous_value`
  - Stable `id`: `jb-${currency}-${date}-${name-slug}`
- **Failure path:** if upstream fails or quota hit, return whatever's cached (current behavior already does this).

### 3. Update hook refresh interval
`src/hooks/useEconomicCalendar.ts`: change `REFRESH_MS` from 15 min → 12 hours (we still cache 24h on the server, but a soft client-side check at 12h is harmless). No other code changes — same shape, same merging on the `/calendar` page.

### 4. Clear stale cache
Run a one-line migration to delete the broken TradingEconomics cache row so the next page-load fetches fresh from JBlanked:
```sql
DELETE FROM site_settings WHERE key = 'calendar_cache';
```

### 5. Admin override unchanged
`CalendarAdmin.tsx` still works — manually-published `calendar_events` rows still take priority over live JBlanked events on duplicate (date+title), thanks to the existing merge logic on `/calendar`.

## What you get

- ✅ Live calendar working again (TradingEconomics is dead)
- ✅ 8 major currencies (USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD) — much better than guest TE
- ✅ One full week of events instead of 30 days of sparse data
- ✅ Stays free as long as we cache 24h
- ⚠️ If you later upgrade JBlanked to a paid plan, we can drop the cache to 15 min and add Today + GPT sentiment

## Optional future add-ons (not in this plan)

- **GPT sentiment badges** on news cards (1 credit per news event, paid only)
- **Backtesting impact scores** shown next to each calendar event
- Just say the word and I'll build either when you're ready.

