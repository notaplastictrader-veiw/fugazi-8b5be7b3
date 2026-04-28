## Goal
Replace SofaSport entirely with three new RapidAPI feeds:
- **Cricbuzz** → cricket (live, upcoming, recent)
- **free-api-live-football-data** → football fixtures (popular leagues)
- **football-prediction-api** → AI-generated football predictions (new section)

Drop basketball from the live schedule (no NBA endpoint provided). Keep manually-curated `sports_predictions` (DB) untouched for the existing prediction cards.

## Steps

### 1. Rewrite `supabase/functions/get-sports-data/index.ts`
Replace the SofaSport fetch logic with three sequential calls per refresh:

- **Cricket** (`cricbuzz-cricket.p.rapidapi.com`):
  - `/matches/v1/live` → upcoming (status = Live)
  - `/matches/v1/upcoming` → upcoming (status = Scheduled)
  - `/matches/v1/recent` → results (status = Finished, with scores)
- **Football** (`free-api-live-football-data.p.rapidapi.com`):
  - `/football-popular-leagues` → list of leagues; pick top ~5 (EPL, LaLiga, Serie A, Bundesliga, UCL) and pull their current fixtures via the matching endpoint exposed by that API. If the popular-leagues call only returns metadata, fall back to whatever fixtures endpoint the API exposes for those league IDs.
- **Football AI Predictions** (`football-prediction-api.p.rapidapi.com`):
  - `/api/v2/predictions?market=classic&iso_date=<today>&federation=UEFA` → list of predicted matches with home/away/predicted outcome.

Behaviour:
- 300ms gap between calls (BASIC tier safe).
- Normalise everything to the existing `UpcomingMatch` / `ResultMatch` shape so the frontend doesn't break.
- New field on payload: `aiPredictions: AIPrediction[]` for the predictions section.
- 15-minute cache TTL, last-good fallback (existing pattern preserved).
- 403/429 swallowed silently.

Cricbuzz response normalisation: traverse `typeMatches[].seriesMatches[].seriesAdWrapper.matches[].matchInfo` to extract `matchId`, `team1`/`team2` names, `startDate` (epoch ms), `seriesName`, `state`, and (for `/recent`) score from `matchScore`.

### 2. Update `src/hooks/useSportsSchedule.ts`
Add `aiPredictions` to the shared state and payload interface so consumers can read AI picks.

### 3. Update `src/components/sports/SportsScheduleSection.tsx`
- Remove **Basketball** + **NBA** filter chips (no data source).
- Add a new **"AI Football Predictions"** section below "Latest Results" listing the prediction cards (home vs away, predicted result, federation badge). Hidden if `aiPredictions` empty.
- Update header copy: "Real fixtures and final scores from cricket and football leagues — refreshed every 10 minutes."

### 4. Update `src/pages/Sports.tsx`
Remove "🏀 Basketball" from `FILTER_TABS` (no live basketball data anymore). Tennis filter stays — it's served by the manual `sports_predictions` table only.

### 5. Clear cache
Wipe `sports_cache` + `sports_cache_last_good` in `site_settings` so the next fetch uses the new pipeline.

### 6. Verify
Call the edge function via `curl_edge_functions`, confirm payload contains cricket + football fixtures + AI predictions, check `/sports` page renders all three.

## Technical details

```text
Old:  SofaSport (3 sports × 2 endpoints) = 6 calls
New:  Cricbuzz (3) + Football fixtures (1-2) + Predictions (1) = 5-6 calls
      Sequential, 300ms gap, 15-min cache
```

Files touched:
- `supabase/functions/get-sports-data/index.ts` (full rewrite of fetch layer)
- `src/hooks/useSportsSchedule.ts` (add `aiPredictions`)
- `src/components/sports/SportsScheduleSection.tsx` (new section, drop basketball chip)
- `src/pages/Sports.tsx` (drop basketball filter)
- Migration: `DELETE FROM site_settings WHERE key IN ('sports_cache','sports_cache_last_good');`

Secret reused: `RAPIDAPI_SPORTS_KEY` (same RapidAPI account works for all three hosts since they share the same key).

## Security note
The key `3fe1181c42msh...` is exposed in chat history again. After deploy, **rotate it on the RapidAPI dashboard** and update the `RAPIDAPI_SPORTS_KEY` secret with the fresh value. Never paste keys in chat.
