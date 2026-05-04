## Goal

Add a "This Week's Important News" board to `/calendar`, styled like the uploaded reference image but branded with the NAFT candlestick logo (no Bullwaves). It pulls from the same `useEconomicCalendar()` data already used on the page.

## Where it goes

New component `src/components/calendar/WeekNewsBoard.tsx`, mounted at the top of `src/pages/Calendar.tsx` (above the existing filters/list), so the existing detailed calendar UI stays intact.

## Visual structure (matches reference)

```
┌─────────────────────────────────────────────────────┐
│                  [NAFT logo]                        │
│                                                     │
│   ┌───────────────────────────────────────────┐     │
│   │   This Week's Important News              │     │
│   │   (Mon DD – Fri DD)                       │     │
│   │   *All times in UTC                       │     │
│   └───────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────┤
│  MON   │  TUE   │  WED   │  THU   │  FRI           │  ← primary-colored band
│  04 May│  05 May│  06 May│  07 May│  08 May        │
├────────┼────────┼────────┼────────┼────────────────┤
│ [card] │ [card] │ [card] │ [card] │ [card]         │
│ [card] │ [card] │ [card] │        │ [card]         │
└────────┴────────┴────────┴────────┴────────────────┘
```

Each event card:
- Top row: `HH:MM` (Space Mono) on the left, country flag emoji on the right
- Below: event title (2-line clamp), small muted currency code
- "All day" label for events without a time (e.g., bank holidays)

Branding:
- Logo at the top: `/images/naft-candlestick-dark-lime.svg` (theme-aware: swap to `naft-candlestick-light-green.svg` / `naft-candlestick-dark-red.svg` based on `useTheme()`, matching existing pattern in `Navbar.tsx`)
- Header card uses `glass-card` class, rounded-2xl, with grunge/space-mono accents
- Day band uses `bg-primary text-primary-foreground` with `font-display` (Barlow Condensed) — fits the 3-theme system
- Event cards use `bg-card border border-border rounded-xl`, hover lifts to `border-primary/40`

## Data + filtering

Reuse `useEconomicCalendar()` (already imported on Calendar.tsx). Filter to:
- Current week: Monday → Friday in UTC (using `new Date()` and aligning to ISO week)
- Impact: `high` and `medium` only (the "important news" framing)
- Sort within each day by `event_time` ascending; null times ("All day") shown first

Currency → flag emoji map (USD 🇺🇸, EUR 🇪🇺, GBP 🇬🇧, JPY 🇯🇵, AUD 🇦🇺, CAD 🇨🇦, CHF 🇨🇭, NZD 🇳🇿, CNY 🇨🇳) defined inline in the component.

If a day has no events, show a small muted "—" placeholder so columns stay visually balanced.

Clicking a card opens the existing `EventDetailModal` (lift selected-event state to Calendar.tsx via a callback prop, or handle locally inside the new component using its own modal instance).

## Responsive

- Desktop (≥md): 5-column grid (Mon–Fri)
- Tablet (sm–md): horizontal scroll, 5 columns of fixed `min-w-[180px]`
- Mobile (<sm): single column, day headers become section dividers stacked vertically

## Files

- **Create** `src/components/calendar/WeekNewsBoard.tsx` — the board + flag map + week-range helper
- **Edit** `src/pages/Calendar.tsx` — import and render `<WeekNewsBoard />` near the top of the page (after `<SEO />`, before the existing filters), and reuse the same `setSelected` to open the existing modal

No new dependencies, no DB changes, no edge function changes.

## Out of scope

- Bullwaves logo will not appear anywhere
- No new admin UI; events continue to flow from the existing `get-economic-calendar` edge function
- No layout changes to the existing filters/event list below
