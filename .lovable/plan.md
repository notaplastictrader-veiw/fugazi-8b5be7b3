## Scope

### 1. Remove "Button above" wording (code)
`src/pages/BrokerDetail.tsx` line 1290 — change `'Click "Open Account" Button above'` → `'Click "Open Account"'`. Applies to every non-prop broker.

### 2. Show bonus in the highlighted Open Account band (data)
Set on the Bullwaves row: `promo_label = '30% TRADEABLE BONUS'`. The existing `<OfferRail variant="wide">` already renders the label inside that band — no component change.

### 3. Bullwaves deposit & withdrawal methods (data)
Overwrite `payment_method_details` on the Bullwaves row to:
- Bank Wire — Min `$100` · Processing `3–5 business days` · Fee `Bank-stated`
- Crypto (USDT/BTC) — Min `$100` · Processing `24–48 hours` · Fee `0% (network fee may apply)`
- Cards (Visa/Master) — Min `$100` · Processing `24–48 hours` · Fee `0%`
- E-Wallets — Min `$100` · Processing `24–48 hours` · Fee `0%`

### 4. Account-types table in full review (data)
Inside `long_review.sections` → section `spreads-accounts-fees` → `table.rows`, update min deposits:
- Classic → `$100` (unchanged)
- VIP → `$3,000`
- ECN → `$5,000`

### 5. Seed one baseline review (data)
Insert one published review for Bullwaves so the header shows `(1 review)` instead of `(0 reviews) · 3.7★`:
- `author`: `NAFT Editorial`
- `role`: `editor`
- `rating`: `4`
- `content`: short neutral editorial note about Bullwaves trading conditions
- `status`: `published`
- `verified_account`: `false`

The `sync_broker_avg_rating` trigger will recompute `stars` and `review_count` automatically (header will move from 3.7★ to ~4.0★ — acceptable per chat).

## Files / data touched
- `src/pages/BrokerDetail.tsx` — 1 line.
- `brokers` table — UPDATE Bullwaves row (`promo_label`, `payment_method_details`, `long_review`).
- `reviews` table — INSERT 1 row.

No schema changes. No component changes other than the one-line copy fix.

Switch to build mode and approve to apply.