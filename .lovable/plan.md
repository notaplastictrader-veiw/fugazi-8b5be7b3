## Bug found

Edge function returned today (Saturday):
```json
"forex_open": false
"EUR/USD" ... "closed": false   ← should be true!
```

Reason: cached forex pairs (stored before today's deploy) don't have a `type` field. The `stampClosed()` helper checks `p.type === "forex"`, so old cached entries slip through unmarked.

## Fix

In `supabase/functions/get-live-prices/index.ts`, infer `type` from the pair label inside `stampClosed`:

```ts
const FOREX_LABELS = new Set([
  "XAU/USD","EUR/USD","GBP/USD","USD/JPY","AUD/USD","USD/CAD",
]);
const inferType = (p: TickerPair): MarketKind =>
  p.type ?? (FOREX_LABELS.has(p.pair) ? "forex" : "crypto");

const stampClosed = (pairs: TickerPair[]): TickerPair[] =>
  pairs.map((p) => {
    const t = inferType(p);
    return t === "forex" && !forexOpen
      ? { ...p, type: t, closed: true, change: "CLOSED", up: false }
      : { ...p, type: t, closed: false };
  });
```

This also future-proofs the cache so even if it gets re-stored, every entry has `type` set.

## Files
- `supabase/functions/get-live-prices/index.ts`
