## Problem

On `/sports`, the **Upcoming Predictions** section is showing 4 cards instead of 6, and those cards (Arsenal vs Man City, Mumbai Indians vs CSK, Celtics vs Heat, Alcaraz vs Sinner) are the **seeded demo rows** in `sports_predictions` — not real data. The user wants:

1. Demo/sample rows removed from the database so only real picks remain.
2. All sport sections to show **6 cards** by default (not 4).
3. Stats bar (Total / Settled / Correct / Win Rate) to update accordingly.

## What I found

DB query confirms `sports_predictions` currently holds 6 rows, all created on `2026-04-17`, all matching the screenshot — these are the original seed inserts (4 upcoming with `is_correct = NULL`, 2 settled: La Liga draw + KKR win). The live edge function `get-sports-data` already provides real fixtures + AI predictions and feeds the `SportsScheduleSection` below.

`POPULAR_LIMIT` is `4` in `src/pages/Sports.tsx` and `6` in `src/components/sports/SportsScheduleSection.tsx`.

## Plan

### 1. Remove seeded demo predictions (database migration)

Delete the 6 hardcoded rows by ID so the "Upcoming Predictions" / stats sections only reflect real picks added through the admin panel:

```sql
DELETE FROM public.sports_predictions
WHERE id IN (
  '55f0a479-4a61-45a9-a9bc-3ff6beeaf7d8', -- Alcaraz vs Sinner
  '6764d2ea-44aa-4589-9de6-681da8794c4e', -- Celtics vs Heat
  'd9e608ba-81a8-4170-bcd9-5bde1942c1ec', -- Mumbai vs CSK
  'd0fd2caa-c918-485f-a83a-e114d3c8f627', -- Arsenal vs Man City
  '9f6afde4-2b82-47ed-a602-e8476aef32e4', -- Real Madrid vs Barcelona (settled)
  '334565b3-dc30-446b-a772-411c11c474ca'  -- RCB vs KKR (settled)
);
```

After this, until an admin posts real picks via `/admin/sports`, the Upcoming Predictions section will gracefully show the existing empty state ("No upcoming predictions yet. Check the live results below.") and the live `SportsScheduleSection` below will continue to show **real fixtures and results** from Cricbuzz / football APIs.

### 2. Change Upcoming Predictions card limit from 4 to 6

In `src/pages/Sports.tsx`:
- Change `const POPULAR_LIMIT = 4` to `const POPULAR_LIMIT = 6`.

This aligns it with `SportsScheduleSection` (which already uses 6) so every section consistently shows 6 cards before "View all".

### 3. Stats bar — no code change needed

The stats already derive from real DB rows (`predictions.length`, settled, correct, winRate). After deleting the demos, all four stat tiles will read `0` / `—` until real picks are added — which is the correct behavior the user asked for ("eta jeno auto calculate kore").

## Files Edited

- `src/pages/Sports.tsx` — `POPULAR_LIMIT` 4 → 6
- New SQL migration — delete the 6 demo `sports_predictions` rows

## Notes

- The `SportsScheduleSection` ("Upcoming Matches" + "Latest Results") below is fed by the real `get-sports-data` edge function and is unaffected — it will continue showing live fixtures with proper popular-team filtering at 6 per section.
- Once an admin adds real predictions through `/admin/sports`, they'll appear in the top section and the stats will auto-update.
