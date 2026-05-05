# Live Ticker — Rate Limit Fallback

## Goal
Jokhon TwelveData API rate limit shesh hoye jay (or upstream fail kore), ticker e stale/fallback price na dekhiye **"Updating soon…"** dekhabe. Limit reset hole automatically abar live price dekhabe.

## Problem
Edge function logs e dekha jacche shob symbol "Skipping … no data from upstream" — rate limit exhausted. Kintu frontend `useLivePrices` hook hardcoded `fallbackPairs` (brokers.ts) dekhacche, tai user mone kortese price update hocche na.

## Changes

### 1. `supabase/functions/get-live-prices/index.ts`
- Detect rate-limit specifically: TwelveData response e `code === 429` ba message `"run out of API credits"` / `"limit"` thakle return `{ prices: [], rate_limited: true, retry_after_ms: 60000 }`.
- General upstream fail → `{ prices: cached ?? [], rate_limited: false, upstream_failed: true }`.
- Cache hit (fresh) → unchanged.
- **No more FALLBACK static prices** returned to client when live data unavailable — empty array + flag.

### 2. `src/hooks/useLivePrices.ts`
- Add state: `rateLimited: boolean`, `stale: boolean`.
- Remove `fallbackPairs` as default — start with `pairs: []`, `rateLimited: false` until first fetch resolves.
- On response with `rate_limited: true` → set `rateLimited=true`, keep `pairs=[]`.
- On success → clear flag, set new prices.
- Backoff: when rate-limited, retry after 90s instead of 60s; on success resume normal 60s interval.

### 3. `src/components/sections/TickerBar.tsx` & `BottomTicker.tsx`
- Read `rateLimited` from hook.
- If `rateLimited` OR `pairs.length === 0`:
  - Replace ticker track with a single centered animated line: **"⏳ Updating soon — live prices resuming shortly…"** (mono, muted, subtle pulse).
  - Keep the LIVE chip but switch dot color to amber (`bg-yellow-500`) and label `"WAIT"`.
- Otherwise behave as before.

### 4. Small UX
- Tooltip on the LIVE/WAIT chip: "Live data temporarily unavailable. Auto-retry every 90s." when rate-limited.

## Out of scope
- No new API key, no provider swap.
- No DB changes.

## Files touched
- `supabase/functions/get-live-prices/index.ts`
- `src/hooks/useLivePrices.ts`
- `src/components/sections/TickerBar.tsx`
- `src/components/sections/BottomTicker.tsx`
