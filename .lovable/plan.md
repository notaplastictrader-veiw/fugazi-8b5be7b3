## Goal
Match times from the AI football API are unreliable (tz issues), so stop showing time/countdown on upcoming prediction cards. Only show a LIVE badge when we can confirm the match is actually live, and update settled results from a verifiable source.

## Changes

### 1. `src/components/sports/PredictionCard.tsx` — strip time/countdown UI

Remove all time-dependent UI from the card since we can't trust `match_date`:

- Remove the `formatMatchTime()` line under the title (line 167-169).
- Remove the bottom date/time row (line 204-210), keeping only the result line for past picks:
  ```tsx
  {isPast && (
    <div className="flex items-center justify-end text-[10px] text-muted-foreground">
      <span className="font-semibold text-foreground">Result: {p.result}</span>
    </div>
  )}
  ```
- Remove the "STARTS IN", "in Xh Ym", "Awaiting result" badges (lines 148-162). These all depend on `match_date`.
- Keep the LIVE badge (lines 143-147) **only if** the source actually flags the match as live. Since we can't verify timing, only show it when the API exposes a live status flag — otherwise hide it. (For now: drop the time-based `phase.kind === "live"` trigger; we'll add it back only when the data layer provides a real `isLive` signal.)
- Remove the `useEffect`/`useState` ticker, `getPhase()`, `formatMatchTime()`, `MatchPhase`, `LIVE_WINDOW_MS` — all dead code after the above.
- Keep: sport badge, ROI badge, CORRECT/WRONG badge, teams, pick, confidence, risk warning, analyst note.

Net effect: upcoming cards show no date/time at all. Past cards show only the result.

### 2. `src/hooks/useSportsSchedule.ts` — pass through `isLive` if present

Add an optional `isLive?: boolean` to `AIPrediction` so future API integrations can flag it. No behavior change yet (the edge function doesn't currently emit it).

### 3. `src/pages/Sports.tsx` — propagate `isLive` into `Prediction`

When mapping `aiPredictions` → `aiAsPredictions`, forward `isLive` as a new optional field on the Prediction type. Update `Prediction` interface in `PredictionCard.tsx` to include `isLive?: boolean`, and gate the LIVE badge on `p.isLive === true`.

### 4. Update settled results

Run a SELECT against `sports_predictions` where `result <> ''` ordered by `match_date desc` to list current settled picks, then cross-check finished scores from the football-prediction RapidAPI endpoint already used by `get-sports-data` (or a public source like flashscore/api-football free tier). For any mismatched `is_correct`, queue an UPDATE migration to correct them.

This is a one-time data fix done after plan approval — not a code change.

## Files
- `src/components/sports/PredictionCard.tsx` — strip time UI, gate LIVE on real flag
- `src/hooks/useSportsSchedule.ts` — add optional `isLive` field
- `src/pages/Sports.tsx` — forward `isLive` in mapping
- DB: targeted UPDATEs to `sports_predictions.is_correct` / `result` after verification

## Notes
- No more "Yesterday", "Awaiting result", or wrong countdowns.
- LIVE badge stays dormant until the data source actually marks a match live — safer than guessing.
- Cached payload clears in ~10 min or via the existing Refresh button.
