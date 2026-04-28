## Goal
Rotate the leaked RapidAPI key, throttle requests to fit BASIC tier limits, and confirm `/sports` displays live SofaSport data.

## Context
- BASIC tier on SofaSport allows the endpoints you tested, but recent edge logs show **HTTP 429 (rate limit)** on nearly every call. We're firing **9 parallel requests** (3 sports × 3 endpoints) per refresh, which BASIC can't sustain.
- One endpoint also returned **403 (cricket inverse, basketball inverse)** — those specific paths likely aren't in BASIC for every sport, so we should treat 403s as "skip silently."
- The key you pasted is now exposed in chat history → must be rotated.

## Steps

### 1. Update `RAPIDAPI_SPORTS_KEY` secret
Replace with the new key you pasted (then please **revoke that key on RapidAPI** and generate a fresh one — sharing it in chat exposes it).

### 2. Rewrite `supabase/functions/get-sports-data/index.ts` to respect BASIC limits
- **Sequential, not parallel** fetches with a small delay between calls (≈250ms) to stay under the per-second cap.
- **Drop the `/inverse` (yesterday results) calls** — they 403 on cricket/basketball and double our request count. Results will be derived from finished matches inside today's scheduled feed instead.
- **Live endpoint stays**, but failures (403/429) are swallowed without polluting logs.
- **Cache TTL bumped from 5 min → 15 min** so the function rarely re-hits the upstream (BASIC daily cap is small).
- Request count drops from **9 → 6 per refresh** (3 live + 3 today), serialized.

### 3. Clear stale cache
Wipe the `sports_cache` row so the next page load triggers a real fetch with the new key + new shape.

### 4. Verify
Call the edge function via curl, check logs are clean (no 429s), confirm `/sports` page renders today's football/cricket/basketball matches.

## Technical details

```text
Old flow:  refresh → 9 parallel calls → 429 storm → empty payload
New flow:  refresh → 6 sequential calls (250ms gap) → cache 15min → render
```

Files touched:
- `supabase/functions/get-sports-data/index.ts` (rewrite fetch loop, drop inverse, longer TTL)
- Migration: `DELETE FROM site_settings WHERE key IN ('sports_cache','sports_cache_last_good');`
- Secret: `RAPIDAPI_SPORTS_KEY` → new value

## Security note
The key `3fe1181c42msh...` is now in chat history. After I update the secret, **rotate it on RapidAPI dashboard** (Apps → Security → Regenerate) and resend only via the secret prompt — never paste keys in chat.