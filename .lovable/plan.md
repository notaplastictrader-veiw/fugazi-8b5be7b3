

## Economic Calendar v2 — full spec build

You've given a detailed spec with 10-min cache, ML predictions modal, homepage widget, timezone toggle, filters, duplicate detection, etc. I'll build all of it, but one constraint must be addressed first.

## ⚠️ Critical conflict: 10-min cache vs JBlanked free tier

Your spec requires **10-minute cache refresh** with **>95% cache hit ratio**. JBlanked's free plan is hard-capped at **1 request per day** — so a 10-min cache will fail after the first refresh of the day with a quota error.

**Two ways forward — pick one:**

- **A. Keep free tier, use 12-hour cache** (recommended for now). Calendar refreshes twice a day. Spec compliance: everything except the 10-min refresh interval. Cache hit ratio still >99%.
- **B. Upgrade JBlanked to a paid plan** ($X/mo, 1 credit per call). Then 10-min cache works exactly as specified. Tell me when you've upgraded and I'll flip the TTL.

I'll build with **Option A (12-hour cache)** unless you say otherwise — code is structured so flipping `CACHE_TTL_MS` to 10 min is a one-line change later.

## What gets built

### 1. Edge function `get-economic-calendar` (rewrite)
- **Source:** `https://www.jblanked.com/news/api/forex-factory/calendar/week/` with `Authorization: Api-Key` header
- **Cache:** 12 h TTL in `site_settings.calendar_cache` (configurable constant)
- **ML predictions (bonus):** also call `/news/api/machine_learning/{currency}/` for the 8 majors in parallel, store under `site_settings.calendar_ml_cache`. Same 12 h TTL. If quota fails, skip silently and serve calendar without ML.
- **Normalize fields** to expected shape: `id, name, date (ISO UTC), currency, impact, actual, forecast, previous, category, description, ml_prediction?: "Bullish"|"Bearish"|"Neutral"`
- **Duplicate detection:** stable id `jb-${currency}-${YYYYMMDD}-${slug(name)}` so the same event across refreshes always has the same id (no flicker)
- **Failure mode:** return last cached events on upstream error (already in current code)

### 2. Hook `useEconomicCalendar` (extend)
- Already exists; expand returned shape to include `ml_prediction` per event
- Subscribers pattern stays (single fetch shared across mounts → no duplicate network calls)

### 3. `/calendar` page (rebuild)
Replace current page with the spec layout:
- **Header:** title, subtitle, "Updated X min ago"
- **Filter bar (sticky):**
  - Impact: All / High / Medium / Low (existing)
  - Currency: All + 8 majors (USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD)
  - Date range: Today / Tomorrow / This Week
  - Timezone toggle: UTC / Local (persisted in `localStorage`)
- **Event list:** grouped by date, sticky date headers (existing pattern), high-impact events get a red left-border accent
- **Click event → modal** showing:
  - Full description, currency, impact
  - Actual / Forecast / Previous in a clean table
  - ML prediction badge (Bullish green / Bearish red / Neutral grey) if available
  - "View on Forex Factory" link (built from event slug if possible, else hide)
- **Empty / error states:** clean fallback messages
- **No layout shift** on filter change: skeleton placeholder retains height

### 4. Homepage widget (new)
- New component `HomepageCalendarWidget.tsx` placed in `src/pages/Index.tsx` between `ForecastSection` and `LatestForexNews`
- Shows **today's top 3 high-impact events** only
- Compact card row, "View full calendar →" link to `/calendar`
- Uses the same `useEconomicCalendar` hook (zero extra network cost — shared cache)
- Hides entirely if no high-impact events today (no empty box)

### 5. Admin override stays
`CalendarAdmin.tsx` and merge logic on `/calendar` unchanged — manually published events still win on duplicate (same date + title).

### 6. Performance
- **Single shared fetch** across page + widget via the existing subscribers pattern
- **No client-side polling** beyond the 12 h interval (negligible)
- **Code split:** `/calendar` already lazy-loaded via `React.lazy`
- Skeleton loaders prevent CLS

## Technical notes

- Edge function uses **service role** to read/write `site_settings` (already in current code)
- ML endpoint is per-currency, so we'll fan out 8 parallel `fetch` calls inside the edge function on cache miss — counts as 8+1 = 9 credits per refresh on a paid plan, **or 1 day of free quota burned in one shot**. On free tier, ML will only populate the first time the cache rebuilds each day; subsequent rebuilds skip ML.
- Timezone: store events' `date` as ISO UTC. Convert client-side using `Intl.DateTimeFormat` with the user's timezone or `"UTC"` based on toggle.
- API key stays in `JBLANKED_API_KEY` secret (already configured) — never reaches client.

## Files touched

```text
edit  supabase/functions/get-economic-calendar/index.ts   (rewrite — add ML fan-out, stable ids)
edit  src/hooks/useEconomicCalendar.ts                    (add ml_prediction field)
edit  src/pages/Calendar.tsx                              (filters, modal, timezone)
new   src/components/calendar/EventDetailModal.tsx        (modal w/ ML badge)
new   src/components/sections/HomepageCalendarWidget.tsx  (top-3 high-impact widget)
edit  src/pages/Index.tsx                                 (insert widget)
sql   DELETE FROM site_settings WHERE key IN ('calendar_cache','calendar_ml_cache');
```

## Confirm before I build

1. **Cache interval:** Option A (12 h, free tier) or B (10 min, you upgrade JBlanked first)?
2. **ML predictions:** include them (uses extra free-tier credits) or skip for now?
3. **Homepage widget placement:** between Forecasts and News (recommended) — or somewhere else?

