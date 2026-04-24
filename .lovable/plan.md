

## Forex-Factory-style table view for `/calendar`

Your reference (Forex Factory) shows a **dense, single-table layout** grouped by date with columns: Date · Time · Currency · Impact · Event · Actual · Forecast · Previous. Mine is a card-stack with one event per row taking ~80px height — visually heavier, lower density, harder to scan.

I'll rebuild `/calendar` as a true table that mirrors Forex Factory's information density while keeping NAFT's dark theme, glass styling, and our extras (ML prediction, click-to-modal, category filter, timezone toggle, stale-cache badge).

## Layout — what changes

```text
BEFORE (now)                       AFTER (Forex-Factory style)
┌──────────────────┐               ┌── Fri Apr 25 ─────────────────────────────┐
│ ● NFP            │               │ Time   Cur  Imp   Event              A  F  P│
│   HIGH USD ML:↑  │               │ 6:00am GBP  ███   Retail Sales m/m   — 0.0 -0.4│
│   description... │               │ 8:00am CHF  ▓▓    SNB Chairman Speaks ...  │
│   12:30 USD F P A│               │ 8:00am EUR  ░░    German ifo          85.7 86.4│
└──────────────────┘               │12:30pm CAD  ▓▓    Core Retail m/m    0.8  0.8│
~80px tall per event               └────────────────────────────────────────────┘
                                   ~36px tall per event = 2x density
```

### New table structure
- **One table per date**, with a sticky date header bar (e.g. "Fri Apr 25") in primary color
- **Compact rows** (~36px tall) instead of cards
- **Columns:** Time · Currency · Impact · Event · Actual · Forecast · Previous · ML
- **Impact column:** colored block (red=high, orange=medium, yellow=low) — like Forex Factory's "folder" icons but using our theme
- **Currency column:** small mono pill (e.g. `USD`)
- **Event column:** name + tiny description below if present (truncated)
- **Actual / Forecast / Previous:** right-aligned numeric columns, color-coded (actual beats forecast = green, miss = red)
- **ML column:** tiny badge (↑ Bullish / ↓ Bearish / – Neutral) only if present
- **Row hover:** lift + primary border-left accent + cursor pointer
- **Click row → opens existing `EventDetailModal`** (no change to modal)

### Visual styling (NAFT theme, not Forex Factory's blue)
- Wrap each date's table in a `glass-card rounded-xl overflow-hidden`
- Date header strip: `bg-primary/10 text-primary` band across the top
- Column header row: `bg-secondary/40` with mono uppercase tiny labels
- Zebra rows: `even:bg-secondary/20`
- Border-left accent on `<tr>` based on impact (4px colored bar like current cards)
- Mobile: collapse to stacked card view (current layout) below `md:` breakpoint — table only on tablet+

### Filter bar (unchanged — keeping all existing controls)
- Range pills (Today / Tomorrow / This Week)
- Timezone toggle (UTC / Local)
- Impact pills (All / High / Med / Low)
- Currency pills (All + 8 majors)
- Category pills (All / Central Bank / Inflation / etc.)
- Clear filters button
- Stale-data badge

### Other improvements
- **Wider container:** `max-w-5xl` → `max-w-6xl` so the table breathes
- **Date header sticks** below the filter bar when scrolling within a date group
- **Skeleton loader** matches new table shape
- **Empty state** unchanged

## Files touched

```text
edit  src/pages/Calendar.tsx
        - Replace card-list render block with table-per-date layout
        - Add responsive switch: table on md+, stacked cards on mobile
        - Add color logic for Actual vs Forecast comparison
        - Bump container from max-w-5xl to max-w-6xl
        - Keep all filters, hooks, modal, dedupe, timezone logic identical
```

No changes to `EventDetailModal`, `useEconomicCalendar`, `calendarDedupe`, edge function, DB, or admin panel.

## Technical notes
- Pure render-layer refactor — no data, hook, or function-signature changes
- Table uses semantic `<table>` for accessibility + better dense layout than CSS grid
- Mobile breakpoint (`md:`) keeps current touch-friendly cards on phones; tables only on screens ≥768px
- Actual-vs-forecast color logic: numeric parse where possible, fallback to neutral if non-numeric
- All existing filters, sorting, grouping, dedupe, ML badges, stale fallback continue to work

## What you'll see
- Same data, same filters, same modal — but presented at ~2x density in a clean Forex-Factory-style table
- Each day gets its own bordered glass panel with a colored header strip
- Rows are scannable: time → currency → impact bar → event → numbers
- Mobile users still get the comfortable card view they have today

