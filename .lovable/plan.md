

## Fix the calendar's "weird" look — placeholder zeros + low-impact noise

Two real bugs from the screenshot you shared:

### Bug 1 — Fake "0" actuals showing in red
JBlanked returns `0` (number) as a placeholder for events that haven't released yet. Our edge function converts it to the string `"0"`, then the table renders it as `0` and `compareColor()` sees `0 < forecast` → paints it **red**. So every unreleased event looks like a "miss" in red.

**Fix in `supabase/functions/get-economic-calendar/index.ts`:** treat `0` (number or string) on `Actual` as "not yet released" and store as empty string `""` — same way we already treat null/empty. The UI then shows `—` correctly. Only release the change for `Actual`; `Forecast`/`Previous` of `0` are legitimate values and stay as-is.

### Bug 2 — "Everything is LOW impact" wall of noise
Out of ~140 events this week, ~116 are JBlanked-tagged low impact (consumer surveys, regional reports, speeches). They drown out the 14 high + 10 medium that actually matter. Forex Factory hides them by default — we should too.

**Fix in `src/pages/Calendar.tsx`:**
- **Change default `impactFilter` from `"all"` → `"high"`** so the page opens showing only the events that actually move markets
- Re-label the pill: `"All Impact"` → `"All"`, add a new pill `"High + Medium"` that filters to `impact in [high, medium]`, and make **`High + Medium`** the new default
- Pills order: `High + Medium · High · Medium · Low · All`
- This makes the calendar instantly look like Forex Factory's default red/orange-folder view

### Bug 3 — Misleading red on actual when it's actually a placeholder
After Bug 1's fix, `e.actual` will be `""` for unreleased events → renders `—` in muted color, no false-miss highlight. Belt-and-suspenders: also guard `compareColor()` to skip coloring when `actual` parses to `0` AND no time has passed (event in future). Cheaper version: just trust the empty-string fix from Bug 1.

### Bonus polish (cheap wins from your screenshot)
- **Sticky date header offset** is wrong — it was set to `top-[260px]` (assuming 4 filter rows). Filter bar is now ~180px from layout top; bump to `top-[180px]` so the date band doesn't jump weirdly when scrolling
- **"TODAY" red overlay row** in your screenshot — that's a hover state bleeding through because `bg-primary/5` on hover + `border-l-destructive` together look like a selection. Tweak hover from `bg-primary/5` to `bg-secondary/30` so high-impact rows don't flash red on hover

## Files touched

```text
edit  supabase/functions/get-economic-calendar/index.ts
        - In normalize(): when Actual is 0 / "0" / null / "", store as "" (empty)
        - Forecast/Previous keep current behavior (0 is valid)
        - Bumps cache version implicitly via fresh write

edit  src/pages/Calendar.tsx
        - Default impactFilter: "all" → "high_med" (new value)
        - Add "high_med" filter logic: e.impact in ["high","medium"]
        - Reorder/rename impact pills: High + Med · High · Medium · Low · All
        - Sticky top offsets: 260px → 180px (date headers)
        - Hover row: bg-primary/5 → bg-secondary/30
```

No DB migration. No hook change. No modal change. Cached events from before the fix will continue to show "0" until the next 12h cache refresh, OR the user can hit refresh to force-clear by clearing the cache row. I'll include a one-time cache invalidation by writing a sentinel into `site_settings.calendar_cache` (set `events: []`) so the next page load triggers a fresh JBlanked fetch — only if quota allows. If quota is exhausted, last-good fallback kicks in.

## What you'll see when this ships
- Page opens to a clean view: only the high + medium impact events (NFP, CPI, central bank, GDP) — not 116 low-noise rows
- Unreleased events show `—` in the Actual column instead of a red `0`
- Date headers stick correctly under the filter bar
- High-impact rows don't flash red on hover

