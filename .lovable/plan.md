

# Restore Demo/Fallback Cards on All Homepage Sections

## সমস্যা
Database এ data নেই তাই homepage এর সব section খালি দেখাচ্ছে। আগে static demo data ছিল।

## সমাধান
প্রতিটি section এ hardcoded fallback data add করবো। DB তে data থাকলে সেটা দেখাবে, না থাকলে demo cards দেখাবে।

## Files & Changes

| File | Change |
|------|--------|
| `src/components/sections/BrokerTrustHub.tsx` | Fallback brokers (Exness, IC Markets, XM, Pepperstone, Quotex) + prop firm (FTMO) from `src/data/brokers.ts` |
| `src/components/sections/ScamAlertSection.tsx` | Fallback scam alerts (TradeWave, GoldFX Pro, CryptoEdge) from `src/data/reviews.ts` |
| `src/components/sections/SignalHub.tsx` | Fallback signal groups (Gold Pulse, Asia FX, Prop Killer) from `src/data/signals.ts` |
| `src/components/sections/ForecastSection.tsx` | Fallback forecasts (XAU/USD, EUR/USD, GBP/USD, Gold, BTC) from `src/data/forecasts.ts` |
| `src/components/sections/CommunityReviews.tsx` | Fallback reviews (6-8 reviews) from `src/data/reviews.ts` |

## Pattern
```typescript
const fallbackData = [ /* demo items with fake IDs */ ];
// After Supabase fetch:
const displayData = dbData.length > 0 ? dbData : fallbackData;
```

DB তে real data add করলে demo automatically replace হয়ে যাবে।

