## Swap sports data source to SofaSport (RapidAPI) + remove the bottom ticker

### What's wrong today
The `/sports` page uses TheSportsDB free key `3`, which only returns one demo English League 1 fixture (Blackpool vs Leyton Orient) for *every* league we query. Our edge function then mis-tags that same row as Premier League AND IPL AND NBA — so all live data on the page is wrong.

### What we'll do

**1. Replace the sports data source with SofaSport (RapidAPI)**
- Store the RapidAPI key as a project secret (`RAPIDAPI_SPORTS_KEY`) instead of hardcoding it.
- Rewrite the `get-sports-data` edge function to call SofaSport with three priority endpoints, in parallel, for football + cricket + basketball:
  - `GET /sport/{sport}/events/live` — live in-progress matches with current score
  - `GET /sport/{sport}/scheduled-events/{today}` — today's full fixture list
  - `GET /sport/{sport}/scheduled-events/{today}/inverse` — yesterday's results (with final scores)
- Map SofaSport's response shape into the existing `UpcomingMatch` / `ResultMatch` types so the front-end keeps working unchanged. Key fields: `event.tournament.name` → league, `homeTeam.name` / `awayTeam.name`, `homeScore.current` / `awayScore.current`, `startTimestamp` (unix seconds → ISO), `status.type` (`inprogress` → "Live", `finished` → "Finished", `notstarted` → "Scheduled").
- Keep the existing 5-minute cache + 24h stale-fallback pattern so we don't blow the RapidAPI quota.
- Clear the existing stale `sports_cache` row so the new shape takes effect immediately.

**2. Handle the "not subscribed" endpoint gracefully**
During testing, `/events/live` returned `"You are not subscribed to this API"` on the free RapidAPI plan, while `/scheduled-events/{date}` worked. The edge function will:
- Try live first, but if any single sport's live endpoint returns 403/`not subscribed`, silently skip it and rely only on the scheduled + inverse endpoints (today + yesterday).
- Log a one-line warning so you can see in the function logs whether the live tier is reachable.
- Surface a `liveAvailable: false` flag in the payload so the UI can hide the "Live now" badge if your plan doesn't include it.

**3. Add a sports section + recommend upgrading if needed**
If after deploy you still see no live matches, the fix is to upgrade the RapidAPI subscription on the SofaSport listing page (the BASIC tier usually unlocks live). I'll surface this as a console hint in the edge function logs, not a user-visible warning.

**4. Remove the bottom sports ticker**
- Delete `src/components/sports/SportsBottomTicker.tsx`.
- Remove its import + render from `src/pages/Sports.tsx`.
- Drop the `pb-32` extra padding back to `pb-16` since only the global price ticker remains at the bottom.

**5. Keep what's already working**
- Hand-curated `sports_predictions` and `betting_sites` (from your admin) stay exactly as they are — they're the only accurate content on the page right now.
- The "Refresh sports data" button keeps working; it'll now hit the new edge function.
- League filter chips, status pill, and countdown timers in `SportsScheduleSection` continue to work — they're driven by the typed payload which stays the same shape.

### Files touched

| File | Change |
|---|---|
| `supabase/functions/get-sports-data/index.ts` | Rewrite to call SofaSport via RapidAPI, with graceful live-tier fallback |
| `src/components/sports/SportsBottomTicker.tsx` | Delete |
| `src/pages/Sports.tsx` | Remove ticker import/render, reduce bottom padding |
| Supabase secret `RAPIDAPI_SPORTS_KEY` | Add via secrets tool |
| Supabase `site_settings` rows `sports_cache` + `sports_cache_last_good` | Reset to empty so new payload shape takes hold |

### What you'll see when this ships
- `/sports` page bottom ticker gone — only your global price ticker remains at the bottom.
- The live schedule section under your predictions shows real today/yesterday fixtures from SofaSport (multiple leagues, real team names, real scores).
- If your RapidAPI plan doesn't include the live endpoint yet, only the live badges hide — the rest still works.
- All your hand-curated predictions + betting sites unchanged.

### One thing to confirm before I deploy
The RapidAPI key you pasted in chat (`3fe1181c42msh...`) is currently visible in the conversation. I'll store it as a Supabase secret so it's not exposed in the codebase, but you should **rotate it on your RapidAPI dashboard right after** since it was sent in plain text — and paste the new one when prompted.
