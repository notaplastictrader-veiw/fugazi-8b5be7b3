## Goal

Move the live football AI predictions out of the "Upcoming Matches" grid (where I previously injected them with the small "Our Pick" badge) and surface them inside the rich **"Upcoming Predictions"** section on `/sports` — using the exact same `PredictionCard` style shown in your screenshot (sport badge, league/round, OUR PICK, CONFIDENCE %, risk warning, insight tip, date).

## Changes

### 1. `src/pages/Sports.tsx`
- Pull `aiPredictions` from the existing `useSportsSchedule()` hook (already imported).
- Map each `AIPrediction` into the `Prediction` shape consumed by `PredictionCard`:
  - `sport`: `"football"`
  - `title`: `competition` (e.g. "Premier League — Matchday 32") with `federation` fallback
  - `team_a` / `team_b`: `homeTeam` / `awayTeam`
  - `match_date`: `date`
  - `prediction`: `prediction` (e.g. "Home Win")
  - `confidence`: derived from the implied probability of `odds` when available; otherwise a sensible default (e.g. 60). Capped 50–85 so risk/ROI badges render meaningfully.
  - `analyst_note`: short auto-generated line including odds, e.g. `"Market: 1X2 · Odds ${odds}"`.
  - `result: ""`, `is_correct: null` (these are upcoming).
- Deduplicate against DB `predictions` by normalized `homeTeam|awayTeam|date(day)` so admin-curated picks always win over the API.
- Merge AI picks into the `predictions` array used for filtering — so they show up under both "All Sports" and the "⚽ Football" tab inside **Upcoming Predictions**, sorted by `match_date` ascending.

### 2. `src/components/sports/SportsScheduleSection.tsx`
- Remove the "Our Pick" overlay added previously to `UpcomingCard` and the standalone-injection logic (`mergedUpcoming`, `pickByMatch`, `predictionKey`).
- Restore `UpcomingCard` to its original simple fixture style and render only `upcoming` matches in the grid.
- Drop the now-unused `aiPredictions` import / `Sparkles` icon.

### 3. No backend changes
- `get-sports-data` edge function already returns `aiPredictions` correctly. No edits needed there.

## Result

The football AI picks will appear as full prediction cards inside **Upcoming Predictions** — same card style as Alcaraz vs Sinner, Celtics vs Heat, etc. — with sport badge "⚽ FOOTBALL", confidence %, risk warning, odds-based insight, and date/time. The "Upcoming Matches" grid below stays clean as fixtures only.