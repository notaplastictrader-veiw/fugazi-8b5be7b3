

## Calendar improvements — 4 enhancements + auto-refresh resilience

You're asking for four upgrades to `/calendar`. Three of them (filters, timezone selector, click-to-open modal) are already built and live — I'll verify and polish. The fourth (smarter duplicate detection) is new. Plus you want it to "work after refresh" — I'll fix the cache-empty case so the page shows data even when the JBlanked free-tier quota is exhausted at refresh time.

## What's already done (verified in current code)

1. ✅ **Click-to-open modal** — `EventDetailModal.tsx` shows full description, Actual/Forecast/Previous table, ML badge, Forex Factory link. Wired via `setSelected(e)` on row click.
2. ✅ **Currency + category-style filters** — sticky filter bar with Impact (All/High/Med/Low), Currency (All + 8 majors), and Range (Today/Tomorrow/This Week). Updates instantly via `useMemo`.
3. ✅ **Timezone selector** — UTC ↔ Local toggle, persisted in `localStorage` under `naft-calendar-tz`.

## What's new in this plan

### 1. Smarter duplicate detection (title-keyword normalization)

Current logic: `event_date + lowercase(name)` — misses near-duplicates like:
- `"Non-Farm Payrolls"` vs `"NFP"` vs `"Nonfarm Payrolls (NFP)"`
- `"CPI m/m"` vs `"CPI MoM"` vs `"Consumer Price Index MoM"`

New logic in `Calendar.tsx`'s merge step:
- Build a **normalized signature** per event: lowercase → strip parentheses → remove punctuation → collapse whitespace → drop stopwords (`the, and, of, m/m, y/y, q/q, mom, yoy, qoq`) → expand common acronyms (`nfp → nonfarm payrolls`, `cpi → consumer price index`, `gdp → gross domestic product`, `pmi → purchasing managers index`, `boe → bank of england`, `boj → bank of japan`, `ecb → european central bank`, `fomc → federal open market committee`, `rba → reserve bank of australia`, `boc → bank of canada`, `snb → swiss national bank`, `rbnz → reserve bank of new zealand`)
- Sort the resulting words alphabetically → join → take first 5 keyword tokens
- Final dedupe key: `${event_date}::${currency}::${signature}`
- Manual DB events still win on collision (they're inserted first into the seen-set)

### 2. Add a "Category" filter row

Right now there's no category filter — JBlanked returns categories like `economic`, `central_bank`, `inflation`, `employment`, `gdp`, `manufacturing`, `consumer`, `housing`. I'll add a horizontally-scrollable pill row under the currency row with: All / Central Bank / Inflation / Employment / GDP / Manufacturing / Consumer / Housing / Other. Mapped from the raw category string with a small lookup table.

### 3. Refresh resilience — keep showing data after browser refresh even when API is dead

Right now the hook fetches on mount, and if JBlanked is out of credits + cache is empty, page shows "feed temporarily unavailable". On refresh nothing improves until the daily quota resets.

Fix in the edge function:
- **Stale-while-error fallback**: persist the **last successful payload** in `site_settings.calendar_cache_last_good` (separate from the TTL cache). When the upstream JBlanked call fails AND the live cache is expired, return the last-good payload with a `stale: true` flag (up to 7 days old).
- **Cache survives refresh** because it's in DB, not memory. So once the daily fetch succeeds, every subsequent browser refresh for the next ~24h shows that data instantly with zero API calls.
- **Manual DB events always shown** — the page already merges `calendar_events` (from DB, admin-published) on top of API events, so even if the live feed is fully dead, manually-added events render fine.

Add a small "stale data" badge in the header when `stale: true` so users know.

### 4. Polish on the existing pieces (small)

- **Filter bar** stays sticky; add the new Category row beneath Currency
- **Modal**: add the event's normalized category as a small pill next to currency
- **Timezone selector**: keep current toggle, no changes
- **Empty state**: when filters return zero rows but the underlying feed has data, show "No events match your filters — clear filters" with a clear button

## Files touched

```text
edit  supabase/functions/get-economic-calendar/index.ts
        - Write last-good payload to site_settings.calendar_cache_last_good on every successful fetch
        - On upstream failure + expired cache, return last-good with stale: true

edit  src/hooks/useEconomicCalendar.ts
        - Surface `stale: boolean` in the returned shape

edit  src/pages/Calendar.tsx
        - Replace dedupe logic with normalized-keyword signature
        - Add Category filter row in sticky bar
        - Show "Showing cached data" badge when stale
        - "Clear filters" button in empty state

edit  src/components/calendar/EventDetailModal.tsx
        - Add category pill next to currency
```

No DB migration needed — `site_settings` already supports arbitrary keys.

## Technical notes

- **Normalized signature is pure client-side** — no edge function changes needed for dedupe; runs in the same `useMemo` that merges `dbEvents + liveEvents`
- **Stale-while-error pattern** is the standard way to survive provider outages on a free tier; cost is one extra `site_settings` upsert per successful fetch (negligible)
- **No 10-min cache change** — still 12h to respect JBlanked free tier; flip `CACHE_TTL_MS` later if you upgrade the plan
- **No new secrets, no new dependencies, no breaking changes** to admin panel or homepage widget

## What you'll see when this ships

- Refresh `/calendar` after the JBlanked quota resets once → page loads instantly forever after, even after browser refresh, even after quota dies again
- Duplicate "NFP" / "Non-Farm Payrolls" / "Nonfarm Payrolls (NFP)" entries collapse into one
- New Category filter row to slice the list by event type
- Cleaner empty state with "Clear filters" CTA
- Small "Showing cached data" badge appears only when serving stale fallback

