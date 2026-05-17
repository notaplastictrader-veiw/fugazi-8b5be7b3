## Exness review — region + data cleanup

### 1. Replace "Bangladesh" wording → "Asia"

Search Exness `long_review` (summary, tldr, sections body, best_for, not_ideal_for, where-exness-accepts-clients section) and replace BD/Bangladesh-primary phrasing with **Asia** (broader region). Bangladesh stays only as one named example among India/Vietnam/Thailand/UAE — never as the headline market.

### 2. Deposits & Withdrawals section (`sections[id=deposits-withdrawals]`)

Current section still ships bKash/Nagad/Rocket rows and blank min/processing/fee cells. Rewrite the in-section table to **5 common, complete rows** (no blanks):


| Method                             | Min Deposit | Processing        | Fee                      |
| ---------------------------------- | ----------- | ----------------- | ------------------------ |
| Bank Transfer / Wire               | $100        | 1–3 business days | 0% (bank fees may apply) |
| Visa / Mastercard (Credit & Debit) | $10         | Instant–30 min    | 0%                       |
| Internet Banking (local)           | $50         | Instant–1 hour    | 0%                       |
| Crypto (BTC, USDT)                 | $10         | 10–60 min         | 0%                       |
| E-wallets (Skrill / Neteller)      | $50         | Instant           | 0%                       |


Rules: merge credit + debit into one Visa/Mastercard row; never leave a cell blank — use `0%` if free, `N/A` if unknown. Drop bKash / Nagad / Rocket / Bangladesh-only methods. Also write the same rows into `brokers.payment_method_details` (currently `[]`) so the structured D&W panel on `BrokerDetail.tsx` renders the same data.

### 3. Avg spread — single source of truth = **0.7–1.0 pips**

User wants the headline number on the top scorecard to match the overview narrative + homepage card. Update every surface:

- `brokers.avg_spread` → `0.7–1.0 pips`
- `long_review.at_a_glance.avg_spread_eurusd` → `0.7–1.0 pips`
- Any hard-coded "from 0.1 pip" / "from 0.0" text inside `spreads-fees-accounts` section copy → rewrite around the 0.7–1.0 pip Standard-account headline, mention Raw 0.0 + commission only as a secondary detail
- Homepage broker card pulls from `avg_spread`, so it updates automatically

### 4. Trust score breakdown math

Current breakdown sums to 8.125 → rounds to 8.1, but the four shown sub-scores (8.0 / 8.5 / 8.0 / 8.0) only feel right if weights are visible. Two fixes:

- Keep `trust_score = 8.1`, `star_rating = 4.1`
- Update each `trust_breakdown` entry to include a `weight` field, and append a `weighted` line in the UI so the math is transparent:
  - Regulation 8.0 × 30%
  - User Reviews 8.5 × 25%
  - Withdrawal Speed 8.0 × 25%
  - Complaint History 8.0 × 20%
  - = **8.125 → 8.1 / 10**
- `LongReview.tsx` Trust Score card: render `weight` chip next to each row and a "Weighted total = 8.1" footer line so the calculation actually reconciles for the reader.

### 5. Customer Support — remove  Telegram

### 6. Verdict copy — drop BD wording

- `best_for`: "Active traders across **Asia, MENA and Africa** — low minimum deposit, fast crypto / e-wallet withdrawals, tight raw spreads."
- `not_ideal_for`: unchanged (already generic).
- `summary` / `tldr`: replace "Thailand, Vietnam, and the Gulf" enumerations with "Asia and MENA" + keep one country example only.

---

## Technical surface

- **Single `supabase--insert` UPDATE** on `brokers` where `slug='exness'`:
  - `avg_spread`, `payment_method_details`
  - `long_review` (verdict, at_a_glance, deposits-withdrawals section body, spreads-fees-accounts copy, support block, where-exness-accepts-clients section)
- **Code edits**:
  - `src/components/broker/LongReview.tsx` — render `weight` chip + weighted total footer in Trust Score card (data-driven, no hard-coded values)
  - `src/pages/BrokerDetail.tsx` — ensure the D&W structured table reads from `payment_method_details` and shows `N/A` for missing cells; surface support_channels including Telegram

No schema changes. No homepage card changes (it auto-updates from `avg_spread`).