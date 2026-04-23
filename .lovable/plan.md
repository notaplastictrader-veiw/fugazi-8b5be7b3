

## Clean up Live Price Ticker — show only what TwelveData free plan supports

The ticker currently lists 8 symbols but the free plan doesn't return data for some of them (NASDAQ index `IXIC`, OIL `WTI/USD`). Right now those slots silently fall back to fake static prices, which is misleading. Fix: query the API for what's actually available and only show real live data.

## What changes

### 1. Edge function `supabase/functions/get-live-prices/index.ts`

- **Drop unsupported symbols** from the `SYMBOLS` array:
  - ❌ `NASDAQ` (IXIC) — index, not on free plan
  - ❌ `OIL` (WTI/USD) — commodity, not on free plan
- **Keep verified working symbols** (Forex + Crypto only on free plan):
  - ✅ XAU/USD (gold — works on free forex tier)
  - ✅ EUR/USD
  - ✅ GBP/USD
  - ✅ USD/JPY
  - ✅ AUD/USD (new — adds variety)
  - ✅ USD/CAD (new — adds variety)
  - ✅ BTC/USD
  - ✅ ETH/USD
- **Skip-on-error logic**: instead of silently inserting fake fallback prices when a symbol returns `status: "error"`, exclude that symbol from the response entirely so users only see real live data.
- Keep the 55-second cache, CORS, error handling, and graceful degrade-to-last-cache behavior unchanged.

### 2. Hook `src/hooks/useLivePrices.ts`

- Update the static `fallbackPairs` import to use a shorter local fallback (only the 8 above) so first paint matches what users will eventually see.
- No behavior change otherwise — still polls every 60s, still shares cache across components.

### 3. Static fallback in `src/data/brokers.ts`

- Update the `tickerPairs` export to match the new 8-symbol list so server-down fallback also looks consistent.

### 4. Verify after deploy

- Curl the edge function to confirm it returns 8 real live prices
- Confirm "NASDAQ" and "OIL" no longer appear in either ticker
- Confirm AUD/USD and USD/CAD show real values

## Files touched

| File | Change |
|---|---|
| `supabase/functions/get-live-prices/index.ts` | Replace SYMBOLS list, change fallback-on-error → skip-on-error |
| `src/hooks/useLivePrices.ts` | Update local fallback array |
| `src/data/brokers.ts` | Update `tickerPairs` export |

## Result

Both `TickerBar` (top) and `BottomTicker` (bottom) will display **8 real live forex + crypto prices**, all refreshing every 60s. No more fake static prices sneaking in for unsupported symbols.

## Out of scope

- Adding indices/commodities (would need TwelveData paid plan or a second provider like Yahoo Finance for free index data)
- Admin-editable ticker symbol list (still possible later via `site_settings`)

