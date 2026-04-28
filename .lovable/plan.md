## Issues

1. **Only ~2 cards showing in Upcoming Predictions**, not 6. The "popular teams" filter narrows DB+AI predictions to a tiny subset (live AI football fixtures rarely contain whitelisted teams like Real Madrid / Arsenal), so even though `POPULAR_LIMIT = 6`, the visible list drops well below 6.
2. **Every upcoming card shows a red "🔴 LIVE" badge** because `PredictionCard` treats any match with `match_date <= now()` as live, even when the match hasn't actually kicked off (admin-entered times can be off, AI fixtures may be hours away). The user wants a **countdown** ("in 2h 15m", "Apr 30 · 8:00 PM") for future matches and only show LIVE during the actual match window.

## Plan

### 1. Top up "Popular" subset to always fill 6 cards (`src/pages/Sports.tsx`)

Change the upcoming-default logic so popular matches are shown first, and any remaining slots are filled with the rest of the upcoming matches:

```ts
const upcomingPopularAll = upcoming.filter((p) => isPopularMatch(p.team_a, p.team_b));
const popularIds = new Set(upcomingPopularAll.map((p) => p.id));
const upcomingRest = upcoming.filter((p) => !popularIds.has(p.id));
const upcomingDefault = [...upcomingPopularAll, ...upcomingRest];
const upcomingVisible = showAllUpcoming ? upcoming : upcomingDefault.slice(0, POPULAR_LIMIT);
```

Result: if there are 6+ upcoming predictions total, the section always shows 6, prioritizing popular teams. The "Popular Teams" subtitle will still appear when popular picks exist.

### 2. Replace "always-LIVE" badge with smart countdown (`src/components/sports/PredictionCard.tsx`)

Update the time/status logic:

- **Past (has result):** unchanged — show "Result: …".
- **Match in the future:** show a countdown badge instead of LIVE. Format:
  - `> 24h` → `in Xd Yh`
  - `1–24h` → `in Xh Ym`
  - `< 1h` → `in Xm Ys` (auto-ticking every second)
  - `< 5min` → orange "STARTING SOON"
- **Match started within the last ~3 hours, no result yet:** show pulsing red `🔴 LIVE`.
- **Match started > 3 hours ago, no result:** show muted "Awaiting result".

Add a `useEffect` + `setInterval(1000)` inside `PredictionCard` (or compute relative to a shared `Date.now()` re-render every second) so the countdown stays fresh without a full data refetch.

The bottom row keeps the absolute date/time for context: `Apr 30 · 02:00 AM`.

### Visual tokens

All badges use existing semantic tokens — `bg-destructive/20 text-destructive` (LIVE), `bg-accent/20 text-accent` (starting soon), `bg-secondary text-foreground border border-border` (countdown), `text-muted-foreground` (awaiting result) — no new colors.

## Files to Edit

- `src/pages/Sports.tsx` — replace `upcomingDefault` definition (4 lines around line 130).
- `src/components/sports/PredictionCard.tsx` — replace status badge block + bottom time row; add 1-second tick effect.

## Out of scope

- The bottom `SportsScheduleSection` already has a proper countdown (`formatCountdown`) on its `UpcomingCard`, so it's untouched.
