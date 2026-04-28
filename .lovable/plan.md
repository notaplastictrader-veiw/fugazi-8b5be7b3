# Show Match Start Time on Prediction Cards

## Problem
On `/sports`, prediction cards currently show only a status badge (countdown, LIVE, or "Awaiting result"). When a card is in the "Awaiting result" state, users cannot see when the match was actually scheduled to start. The kickoff date/time should be visible on every card.

## Goal
Display the formatted match start date + time (e.g. `Sat, 2 May · 21:00`) on every prediction card, in the user's local timezone, alongside the existing status badge.

## Changes

### `src/components/sports/PredictionCard.tsx`
1. Add a small helper `formatMatchTime(date)` that returns a short, localized string like:
   - Same day: `Today · 21:00`
   - Tomorrow: `Tomorrow · 21:00`
   - Otherwise: `Sat, 2 May · 21:00`
   Uses `Intl.DateTimeFormat` with the browser locale; falls back to `TBD` for invalid dates.

2. Render the formatted time as a subtle line directly under the title (`p.title`), using muted foreground + mono font to match existing typography:
   ```
   <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
     <Clock className="w-3 h-3" /> {formatMatchTime(matchTime)}
   </p>
   ```

3. The existing status badge (countdown / LIVE / Awaiting result) remains unchanged in the top-right corner. So users now see both:
   - **When** the match starts (always visible, under the title)
   - **Current state** (badge in header)

## Out of scope
- No changes to `Sports.tsx`, top-up logic, or DB.
- No timezone selector — uses the browser locale.

## Files
- `src/components/sports/PredictionCard.tsx` (edit)
