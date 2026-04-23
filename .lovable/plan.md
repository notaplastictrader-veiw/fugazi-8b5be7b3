

## Live Price Ticker — TwelveData Integration

Replace the static `tickerPairs` fallback in `TickerBar` and `BottomTicker` with live prices from TwelveData, refreshed every 60 seconds, served from a cached edge function so we stay within free-tier limits.

## Architecture

```text
Browser (TickerBar / BottomTicker)
        ↓ every 60s
Edge Function: get-live-prices
        ↓ checks cache (Postgres site_settings.ticker_cache)
        ↓ if cache > 60s old → fetch TwelveData batch endpoint
        ↓ else → return cached payload
TwelveData /quote?symbol=EUR/USD,GBP/USD,...&apikey=***
```

**Why server-side fetch (not client direct):**
- Hides API key (32-char secret stays server-only)
- Single shared cache across all visitors → 1 API call serves 1000s of users
- Stays well inside TwelveData free tier (800 calls/day → we use ~1,440/day worst case but cache reduces to ~1,440 batch calls = 1,440 symbol-set fetches; one batch counts as 8 credits, so ~11,520 credits/day — still fine on free 800/day **only if we cache aggressively**, see note below)

**Cache strategy:** edge function reads `site_settings.ticker_cache` (a JSONB row holding `{prices, fetched_at}`). If `fetched_at` < 60s ago → return as-is. Else → call TwelveData, write cache, return. This means **regardless of how many users browse the site, TwelveData gets max 1 call per 60s = 1,440/day**. ✅ Safe on free plan.

## Symbol mapping (TwelveData format)

| Display | TwelveData symbol | Type |
|---|---|---|
| XAU/USD | `XAU/USD` | forex |
| EUR/USD | `EUR/USD` | forex |
| GBP/USD | `GBP/USD` | forex |
| USD/JPY | `USD/JPY` | forex |
| BTC/USD | `BTC/USD` | crypto |
| NASDAQ | `IXIC` | index |
| OIL | `WTI/USD` (or `USOIL`) | commodity |
| ETH/USD | `ETH/USD` | crypto |

Single batch call: `GET https://api.twelvedata.com/quote?symbol=XAU/USD,EUR/USD,GBP/USD,USD/JPY,BTC/USD,IXIC,WTI/USD,ETH/USD&apikey=***`

Returns `{ "EUR/USD": { "close": "1.0847", "percent_change": "-0.12", ... }, ... }`

## Steps

### 1. Store API key as runtime secret
Add `TWELVEDATA_API_KEY` = `1184e3b19d4b40eea6f84554a2c55268` via the secrets tool. Available to edge functions only.

### 2. Edge function `get-live-prices`
- Path: `supabase/functions/get-live-prices/index.ts`
- Public (no JWT required) — anyone can read prices
- CORS enabled for browser calls
- Logic:
  1. Read `site_settings.ticker_cache`
  2. If `fetched_at` within last 55s → return cached `prices` array
  3. Else → fetch TwelveData batch, transform to `{pair, price, change, up}[]`, write cache row, return
  4. On TwelveData failure → return last cached value (graceful degrade); if no cache ever, return static fallback

### 3. Database
- Insert seed row into `site_settings` with `key='ticker_cache'` and empty initial value (so the function's upsert works cleanly)
- No new tables, no migration file needed beyond a one-line insert

### 4. Frontend hook `useLivePrices`
- New file: `src/hooks/useLivePrices.ts`
- Calls `supabase.functions.invoke('get-live-prices')` on mount
- `setInterval` re-fetch every 60s
- Returns `{ pairs, loading, lastUpdated }`
- Falls back to static `tickerPairs` from `src/data/brokers.ts` if function ever fails

### 5. Wire into existing tickers
- `src/components/sections/TickerBar.tsx` — replace the `site_settings.ticker_pairs` fetch with `useLivePrices()`
- `src/components/sections/BottomTicker.tsx` — same swap
- Add a tiny green pulse-dot before the first item so users see "LIVE" visually
- Keep existing scrolling animation untouched

### 6. Visual polish
- Add `LIVE` chip on the left of the ticker (pulse-dot animation already exists in CSS)
- Show subtle red/green color on `change` (already in code — keep)
- If `loading` and no cache → show static fallback instantly (no flash)

## Files touched

| File | Action |
|---|---|
| `supabase/functions/get-live-prices/index.ts` | **new** — TwelveData fetch + cache |
| `src/hooks/useLivePrices.ts` | **new** — client hook with 60s polling |
| `src/components/sections/TickerBar.tsx` | edit — use new hook, add LIVE chip |
| `src/components/sections/BottomTicker.tsx` | edit — use new hook |
| `site_settings` table | one-row insert for `ticker_cache` key |
| Secret `TWELVEDATA_API_KEY` | added via secrets tool |

## After deploy you'll see

- Real EUR/USD, BTC, gold, etc. prices in both top and bottom tickers
- Auto-refresh every 60s
- "LIVE" pulse-dot indicator
- Zero risk of API key exposure
- Zero risk of TwelveData rate-limit (max 1,440 calls/day shared across all visitors)

## Out of scope
- Historical sparkline charts per pair (separate feature)
- WebSocket streaming (TwelveData free plan is REST only — would need paid tier)
- Per-user customizable ticker symbols (admin-editable list — can add later by hooking into `site_settings.ticker_symbols`)
- TradingView widget embed (alternative path if you ever want full charts)

