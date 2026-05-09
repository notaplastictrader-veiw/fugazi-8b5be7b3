## Problem

Live ticker e ajk (Saturday) o forex prices dekhachhe (EUR/USD, GBP/USD, XAU/USD, etc.) — kintu **forex market weekend e bondho thake** (Friday 22:00 UTC → Sunday 22:00 UTC). TwelveData API weekend e last Friday close return kore, fole UI "LIVE" dekhay but data actually frozen. Crypto (BTC, ETH) 24/7 open, oigulo thik ache.

## Fix

### 1. Market hours utility — `src/lib/marketHours.ts` (new)
```ts
export type MarketKind = "forex" | "crypto";

// Forex: Sun 22:00 UTC → Fri 22:00 UTC
export function isForexOpen(now = new Date()): boolean {
  const d = now.getUTCDay();   // 0=Sun .. 6=Sat
  const h = now.getUTCHours();
  if (d === 6) return false;                  // Saturday closed all day
  if (d === 0 && h < 22) return false;        // Sunday before 22:00 UTC
  if (d === 5 && h >= 22) return false;       // Friday after 22:00 UTC
  return true;
}
export const isCryptoOpen = () => true;
export function isMarketOpen(kind: MarketKind) {
  return kind === "crypto" ? true : isForexOpen();
}
```

### 2. Edge function — `supabase/functions/get-live-prices/index.ts`
- Tag each returned pair with its `type` ("forex" | "crypto")
- Add `forex_open: boolean` to response
- On weekends: still fetch crypto, skip forex API call (saves rate limit). Forex pairs returned with `closed: true` flag and the most recent Friday-close price (so user sees the last value).

### 3. Hook + UI — `useLivePrices.ts`, `TickerBar.tsx`
- Status chip: 3 states
  - **LIVE** (green pulse) — forex open
  - **CRYPTO ONLY** (amber) — weekend, only BTC/ETH live
  - **WAIT** (yellow) — rate-limited / fetch failed
- Forex pair items during weekend show greyed price + small "CLOSED" badge instead of % change
- Tooltip on chip: "Forex markets closed — resumes Sunday 22:00 UTC"

### 4. Optional polish
- Show countdown "Forex opens in 1d 4h" on hover

## Files
- `src/lib/marketHours.ts` (new)
- `supabase/functions/get-live-prices/index.ts`
- `src/hooks/useLivePrices.ts`
- `src/components/sections/TickerBar.tsx`
