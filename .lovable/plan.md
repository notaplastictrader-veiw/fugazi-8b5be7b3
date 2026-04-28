## Goal

1. **Auto-calculate stats** from real data only (no fake fallback inflating numbers).
2. **Remove the duplicate** between "Past Results" (DB predictions with results) and "Latest Results" (live API scoreline data) — keep one section.
3. **Remove the hardcoded fallback cards** so the page shows only real info.

## Current duplication

- `Past Results` (Sports.tsx) → admin-curated `sports_predictions` rows where `result` is filled. Shows verdict (CORRECT/WRONG), pick, confidence.
- `Latest Results` (SportsScheduleSection) → live API match results with actual scorelines. Shows scoreline + WON/LOST verdict by matching against same `sports_predictions`.

Both list "matches that already happened" → users see overlap. **Latest Results** has richer real-time data (live scores, ticking countdown, automatic verdict matching), so it wins.

## Changes

### 1. `src/pages/Sports.tsx`
- **Delete** the entire `fallbackPredictions` array (lines 18–25).
- Change `setPredictions(data && data.length > 0 ? data : fallbackPredictions)` → `setPredictions(data || [])`.
- **Delete** the entire "Past Results" block (lines 283–317) and remove `showAllPast` / `pastVisible` / `pastPopularAll` / `pastDefault` state and computations.
- Update the empty-state condition from `upcoming.length === 0 && past.length === 0` → `upcoming.length === 0` (Latest Results section below handles past matches).
- Stats bar (Total Picks / Correct / Accuracy) stays — already auto-calculated from `predictions.filter(p => p.is_correct !== null)`. With fallback removed, it now reflects only real DB picks (so today: 0/0/0 until admin adds verified picks). That's the correct behavior the user asked for.

### 2. No changes to `SportsScheduleSection.tsx`
- "Latest Results" stays as the single source of truth for past matches with live scorelines and verdict matching against admin picks.

## Result

- Stats auto-derive from real `sports_predictions` rows — no fake inflation.
- One "results" section on the page (Latest Results, scoreline-rich, live-data-driven) instead of two overlapping sections.
- Hardcoded sample cards gone; the page shows only real data from DB + live API feeds.