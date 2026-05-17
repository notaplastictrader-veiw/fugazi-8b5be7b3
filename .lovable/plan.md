# Exness Review Refinements

## 1. Deposits & Withdrawals table (shorter, universal)

Update `long_review.at_a_glance.deposit_methods` and the D&W section table in the `brokers.exness` row to only 5 universal rows (drop bKash/Nagad/Rocket/Skrill/Neteller/Perfect Money/WebMoney specificity, no BD focus):


| Method                           | Min  | Processing        | Fee                      |
| -------------------------------- | ---- | ----------------- | ------------------------ |
| Bank Transfer (Wire)             | $100 | 1–3 business days | 0% (bank fees may apply) |
| Visa / Mastercard (Credit/Debit) | $10  | Instant–30 min    | 0%                       |
| Local Internet Banking           | $50  | Instant–1 hour    | 0%                       |
| Crypto (BTC, USDT)               | $10  | 10–60 min         | 0%                       |
| E-wallets (Skrill / Neteller)    | $50  | Instant           | 0%                       |


Fee shows `0%` if known free, `N/A` if unknown. Remove BD-first ordering — alphabetical/usage-based instead. Also update `verdict.best_for` / `not_ideal_for` to drop South Asia/BD wording → generic "emerging-market traders who need low min deposit and fast crypto withdrawals."Tier 1 (Core NAFT identity)

India  
Indonesia  
Vietnam  
UAE  
Thailand  
malaysia  
singapore  
Philippines  
Saudi Arabia  
South Africa  
Nigeria  
EgyptTier 2 (Support markets)

Pakistan  
Bangladesh  
Kenya  
Ghana  
Sri Lanka  
Jordan  
Kuwait  
Qatar  
Bahrain  
Oman

This sequence anchors with large high-volume markets first, then moves through MENA and Africa. Never lead with Pakistan or Bangladesh alone.

## 2. Trust Score Breakdown (math fix → 8.1)

Update `verdict.trust_score = 8.1`, `verdict.star_rating = 4.1`. Replace `trust_breakdown` with weighted entries:

- Regulation — 8.0/10 (weight 30%)
- User Reviews — 8.5/10 (weight 25%)
- Withdrawal Speed — 8.0/10 (weight 25%)
- Complaint History — 8.0/10 (weight 20%)

Weighted total = 8.0×0.30 + 8.5×0.25 + 8.0×0.25 + 8.0×0.20 = **8.125 → 8.1**.

Update every surface showing the score:

- `brokers.exness.score = 8.1`, `stars = 4.1`
- `BrokerDetail.tsx` overview scorecard → `NAFT 8.1/10`, rating `4.1/5`
- `StickyBrokerCTA.tsx` → `NAFT 8.1/10`
- `LongReview.tsx` verdict card → already reads from data, will pick up 8.1 automatically
- Seeded NAFT Editorial review `rating` stays 4 (integer column) — text unchanged

## 3. Bonus CTA copy

In `StickyBrokerCTA.tsx` (and any promo pill on overview), when broker has no active bonus campaign, replace "CLAIM 100% BONUS" with **"Bonus — No active offer"** (muted styling, no arrow icon, non-clickable or links to promotions page).

## 4. Avg spread consistency

Audit all surfaces showing spread for Exness so the value matches everywhere (currently "from 0.0 pip" in overview vs whatever's in long_review at_a_glance). Set canonical value: `**from 0.1 pip` (Raw Spread account)** in:

- `brokers.exness.spread` field
- `long_review.at_a_glance.avg_spread_eurusd`
- Overview 5-stat scorecard in `BrokerDetail.tsx`
- Any sticky/comparison surface

## 5. Sentiment sparkline → Pending state

In `SentimentSparkline.tsx`, when total reviews + complaints < 5 (reuse the same threshold as Broker Health), render a pending state instead of the red `-13.1` chart:

```
SENTIMENT · 14D                    PENDING
[muted flat dashed line placeholder]
Needs community signals (reviews + complaints) before we publish sentiment.
```

## 6. Withdrawal Proofs → 3-card carousel

In `WithdrawalProofGallery.tsx`, when more than 3 proofs exist, show only 3 at a time with horizontal swipe / prev-next pagination (reuse `CardCarousel` component pattern from `src/components/common/CardCarousel.tsx` if compatible, otherwise add lightweight prev/next arrows + page dots). Mobile = swipe gesture, desktop = arrow buttons. Keep the "Submit your payout" CTA and the demo banner.

---

## Technical surface map

- **DB update** (`supabase--insert` UPDATE on `brokers` where slug='exness'): `score`, `stars`, `spread`, `long_review` JSON (verdict + at_a_glance + D&W section + best_for copy)
- **Code edits**:
  - `src/components/broker/StickyBrokerCTA.tsx` — score 8.1, bonus fallback copy
  - `src/pages/BrokerDetail.tsx` — score 8.1, stars 4.1, spread display
  - `src/components/broker/SentimentSparkline.tsx` — pending state branch
  - `src/components/broker/WithdrawalProofGallery.tsx` — 3-up carousel
  - `LongReview.tsx` — no changes needed (data-driven)

No schema changes. No new tables.