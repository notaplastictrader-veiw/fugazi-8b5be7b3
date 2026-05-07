## Goal
Live price ticker এ "Updating soon / WAIT" rarely দেখা যাবে — TwelveData rate limit hit হবে না।

## Changes

### 1. `supabase/functions/get-live-prices/index.ts`
- `CACHE_TTL_MS`: **55_000 → 300_000** (5 min server cache)
- `RATE_LIMIT_BACKOFF_MS`: **90_000 → 300_000** (rate limit hit হলে 5 min wait, যাতে retry storm না হয়)

### 2. `src/hooks/useLivePrices.ts`
- `REFRESH_MS`: **60_000 → 300_000** (frontend ও 5 min interval এ refresh — server cache এর সাথে align)
- `RATE_LIMIT_RETRY_MS`: **90_000 → 300_000** (WAIT অবস্থায় 5 min পর retry)

## Result
- Daily upstream calls: ~288/day (free plan limit 800 — অনেক margin)
- Per minute: max 1 call, 8 credits — limit 8/min এর ঠিক ভিতরে
- User কখনো প্রায় WAIT দেখবে না; দেখলেও 5 min এ recover হবে
- Trade-off: prices সর্বোচ্চ 5 min পুরনো হতে পারে — ticker display এর জন্য acceptable

## Out of scope
- Last-known fallback display (এখন WAIT badge ই থাকবে, শুধু খুব rarely আসবে)
- Provider migration বা paid plan
- UI / wording changes
