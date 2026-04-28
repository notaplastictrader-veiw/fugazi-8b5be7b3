## Goal

1. Show only **popular team** predictions/matches on the main `/sports` page with a "View All" CTA that opens the full list.
2. Apply the same trim-and-CTA pattern to all four feed sections.
3. Humanize the cryptic `12` / `1X` / `X2` market codes shown under "Our Pick".

## What "12" means

`12` is from the **1X2 / Double Chance** football market:
- `1` = Home win · `X` = Draw · `2` = Away win
- `1X` = Home **or** Draw
- `12` = Home **or** Away (no draw)
- `X2` = Draw **or** Away

Today the AI feed dumps the raw code into the card. We'll map it to a friendly label.

## Popular teams whitelist

Curated list (covers ~80% of user interest, easy to edit later):
- **Football:** Real Madrid, Barcelona, Manchester City, Manchester United, Arsenal, Liverpool, Chelsea, Tottenham, Bayern Munich, PSG, Juventus, Inter, AC Milan, Atletico Madrid
- **Cricket:** India, Pakistan, Australia, England, Mumbai Indians, Chennai Super Kings, RCB, KKR, Delhi Capitals, Rajasthan Royals
- **Basketball:** Lakers, Celtics, Warriors, Bulls, Heat, Nets, Knicks
- **Tennis:** Alcaraz, Sinner, Djokovic, Nadal, Federer, Swiatek, Sabalenka

A match is "popular" if **either team** matches (case-insensitive substring).

## Changes

### 1. `src/pages/Sports.tsx` — Upcoming Predictions & Past Results
- Add `popularTeams` constant + `isPopular(p)` helper.
- Compute `upcomingPopular = upcoming.filter(isPopular).slice(0, 4)` and `pastPopular = past.filter(isPopular).slice(0, 4)`. Fallback: if popular filter empties the list, show first 4 of the full list.
- Add local `showAllUpcoming` / `showAllPast` state. Default render uses the trimmed list; the CTA toggles to full.
- Add a **"View all (N)"** button below each grid using existing button styles (ghost, `text-primary`, arrow icon). Hides when there's nothing more to show.

### 2. `src/components/sports/SportsScheduleSection.tsx` — Upcoming Matches & Recent Results
- Same pattern: `popularUpcoming` + `popularResults`, default-trimmed to 6 cards each, "View all (N)" CTA toggles to the full filtered list (still capped at 12 as today).
- Reuse the same `popularTeams` list (extract to `src/lib/popularTeams.ts` so both files import it).

### 3. `src/components/sports/PredictionCard.tsx` — humanize market codes
- Add a small `formatPick(raw)` helper that:
  - Splits the predicted outcome on common separators.
  - Maps tokens: `1`→Home Win, `2`→Away Win, `X`→Draw, `1X`→Home or Draw, `12`→Home or Away (No Draw), `X2`→Draw or Away, `BTTS`→Both Teams to Score, `O2.5`/`U2.5`→Over/Under 2.5 Goals.
  - Falls back to the original string if no token matches.
- Apply to `p.prediction` before rendering and inside the analyst note's `Market: …` line.

### 4. New file `src/lib/popularTeams.ts`
- Exports `POPULAR_TEAMS: string[]` and `isPopularMatch(teamA, teamB): boolean` (lowercased substring match on either side).

## Result

- `/sports` loads with a focused feed: 4 popular Upcoming Predictions, 4 popular Past Results, 6 popular Upcoming Matches, 6 popular Recent Results — each with a "View all (N)" CTA to expand.
- "Our Pick" reads "Home or Away (No Draw)" instead of `12`, and the analyst note shows readable market names.