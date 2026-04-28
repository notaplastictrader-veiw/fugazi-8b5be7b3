## Goal

Remove the standalone "AI Football Predictions" section. Merge those predictions **into the existing Upcoming Matches grid** so they look exactly like your other upcoming match cards — just with a small "Our Pick" badge and odds inline. No "AI" label anywhere in the UI.

## What changes (UI)

- **Delete** the bottom "AI Football Predictions" block (header + Brain icon + 3-column grid + disclaimer).
- **Merge** football predictions into Upcoming as regular fixtures:
  - Each prediction becomes an `UpcomingMatch` with `sport: "Football"`, `league: <competition>`.
  - Inside the existing Upcoming card, add a subtle **"Our Pick"** row showing the predicted outcome (e.g. `1X`, `12`, `1`) and odds underneath in mono font — styled with `primary` color, same glass-card aesthetic.
- **Dedupe**: if a prediction's home+away match an upcoming fixture already returned by Cricbuzz/Football Data, attach the pick to the existing card instead of adding a duplicate.
- Remove the `Brain` icon import; add `Sparkles` (small, fits your minimal style) for the "Our Pick" row.

## File: `src/components/sports/SportsScheduleSection.tsx`

1. **`UpcomingCard`** — accept two new optional props: `pick?: string | null`, `odds?: string | null`. When `pick` is set, render a small bordered row above the date footer:
   ```
   ✨ Our Pick                            1X
   1: 2.55 · X: 3.54 · 2: 2.51 · ...
   ```
   Uses `bg-primary/5 border-primary/20`, mono font for odds, truncated with `title` tooltip for full odds.

2. **In the main component** — build a merged list before rendering:
   - Make a `Map<key, { pick, odds }>` from `aiPredictions`, keyed by a normalized `homeTeam|awayTeam` string.
   - For each existing upcoming fixture, look up the key and attach `pick`/`odds` if found; remove from the map.
   - Convert any remaining map entries (predictions with no matching fixture) into `UpcomingMatch` objects with `sport: "Football"`, `league: prediction.competition`, `status: "Scheduled"`, then prepend/append to upcoming.
   - Sort by date ascending so soonest kickoff is first.

3. **Remove** the entire "AI Football Predictions" JSX block (lines 402–419) and the `AIPredictionCard` component (lines 200–230) — both unused after merge.

4. Keep the existing sport/league filters working: predicted-only fixtures will pass the `Football` filter normally.

## Result

- One unified Upcoming Matches grid. Football fixtures with predictions show a small "Our Pick · 1X" badge and odds; everything else looks identical to before.
- No mention of "AI" in the UI — predictions are presented as your platform's own picks.
- Cricket/Football tabs and league chips continue to work as-is.
