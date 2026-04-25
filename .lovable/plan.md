## Sports page is empty — TheSportsDB API key is broken

The `/sports` page shows zero matches because the edge function `get-sports-data` is calling TheSportsDB with the public free key `1`, and **every one of the 6 endpoints is returning HTTP 404**. The function then throws `upstream_empty`, falls back to last-good cache (also empty/expired), and the UI gets `{ upcoming: [], results: [] }`.

I verified the actual cause: TheSportsDB has restricted free key `1` from the league fixture endpoints. Switching to the documented public test key `3` returns real EPL / IPL / NBA fixture data with HTTP 200 across all 6 calls.

## Fix

### 1. `supabase/functions/get-sports-data/index.ts`
- Change `const API_KEY = "1"` to `const API_KEY = "3"` (TheSportsDB's documented public test key, free, no signup).
- Keep everything else (parallel fetch, status mapping, score parsing, last-good fallback, 5-min cache) as-is — the architecture is fine, only the key is wrong.

### 2. Wipe stale sports cache
- Clear `site_settings.sports_cache` and `site_settings.sports_cache_last_good` so the next page load triggers a fresh fetch with the working key. Otherwise we'd serve the empty cached payload for up to 5 more minutes.

### 3. Verify
- Reload `/sports`. Upcoming Matches should populate with EPL fixtures (e.g. Blackpool vs Leyton Orient on 2026-04-25), IPL matches, and NBA games. Latest Results should show finished games with scores.

## What you'll see
- The "All / Football / Cricket / Basketball" filters will show real upcoming fixtures and recent finals
- "Updated just now" stays accurate, "CACHED DATA" badge disappears once fresh fetch lands
- No more silent 404s in edge function logs
