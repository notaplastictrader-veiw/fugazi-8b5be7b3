

## Investigation
User says **Promotions** and **Sports** tabs CRUD-এ data empty দেখাচ্ছে। Network logs confirm: `promotions` table এবং `sports_predictions` table দুটোই DB-তে empty (`Response Body: []`)। কিন্তু frontend-এ static fallback data show হচ্ছে (`fallbackPromos` from `promotionsData.ts`, hardcoded predictions in `Sports.tsx`)।

## Root Cause
আগের phases-এ Education + Betting Sites-এর জন্য static data DB-তে seed করা হয়েছিল, কিন্তু Promotions আর Sports Predictions seed করা হয়নি। তাই admin tab-এ গিয়ে list খালি, যদিও frontend-এ fallback data দেখা যাচ্ছে।

## Plan

### 1. Seed Promotions data
`src/data/promotionsData.ts`-এ থাকা **`fallbackPromos`** array (~6-8 promotions: Exness 100% bonus, FTMO discount, XM no-deposit, IC Markets cashback, etc.) DB-র `promotions` table-এ INSERT করব with all fields:
- title, description, promo_type, bonus_amount, expiry_date, link_url, image_url, is_featured, status='published'

Note: `broker_id` nullable রাখব (FK reference পরে wire করা যাবে)।

### 2. Seed Sports Predictions data
`src/data/bettingSites.ts` বা separate predictions data check করে DB-র `sports_predictions` table-এ INSERT:
- title, sport, team_a, team_b, match_date, prediction, confidence, analyst_note, status='published'

যদি static predictions না থাকে, **5-6 realistic sample predictions** seed করব (football matches: Real Madrid vs Barcelona, Man City vs Liverpool; cricket: India vs Pakistan; basketball: Lakers vs Warriors)।

### 3. Wire frontend to DB (with fallback)
- **`Promotions.tsx`** — currently uses `fallbackPromos` directly. Add `useEffect` to fetch from `promotions` table; if empty, use static fallback.
- **`Sports.tsx`** — already fetches `betting_sites` from DB; add similar fetch for `sports_predictions` with static fallback.
- **`PromoTicker.tsx`** — already reads from `site_settings`, leave as is.

### 4. Files Changed (~3-4)
- 1 new migration: `seed_promotions_and_sports.sql`
- `src/pages/Promotions.tsx` — add DB fetch with fallback
- `src/pages/Sports.tsx` — add predictions DB fetch with fallback
- (Admin pages already CRUD-ready, no change needed)

## Out of Scope
- New fields/columns (existing schema is sufficient)
- Image upload (URL input থাকবে)
- Broker linking dropdown in admin (already exists in PromotionsAdmin)

