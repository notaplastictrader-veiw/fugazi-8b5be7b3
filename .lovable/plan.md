## Keno design alada hocche

XM `brokers.long_review` JSON e top-level keys gulo holo:
```
quick_verdict, regulation, geo_availability, spreads_accounts_fees,
deposits_withdrawals, platforms, pros_cons, final_verdict
```

Kintu `LongReview.tsx` ar `BrokerDetail.tsx` (Overview tab) Exness/Bullwaves er canonical schema porhe:
```
{
  verdict: { tldr, best_for, not_ideal_for, trust_score, star_rating, bottom_line, trust_breakdown },
  at_a_glance: { regulation, min_deposit, max_leverage, ... },
  geo: { accepted, excluded },
  sections: [ { id, heading, body, table?, bullets?, ... } ],   ← array
  affiliate_cta: { label, url, friction_reducers },
  trustpilot: { rating, reviews },
  faq: [...],
  reading_time_minutes, word_count
}
```

Tar fole:
1. **Overview tab** — `broker.long_review.verdict.tldr` nai, tai scannable hero scorecard render hoy na, "Our Verdict" fallback (plain card) dekhay.
2. **Full Review tab** — `LongReview` component `data.sections || []` porhe; XM-er section_count = 0, tai full review **completely empty**. TOC, "At a glance", table, geo block — kichuI render hoy na.

## Fix

Ekta SQL `UPDATE` diye XM-er `long_review` JSON canonical schema te re-shape kora — kono code/component bodlabe na. Form theke deya shob content (8 sections, pros/cons, $30 bonus, regulation list, account types, deposits etc.) protected — sudhu key naming + structure shift.

### Notun structure (XM)

- `verdict` — quick_verdict theke tldr/summary/best_for/not_ideal_for/bottom_line/star_rating=4.2/trust_score=8.2/trust_breakdown
- `at_a_glance` — regulation (CySEC/ASIC/IFSC/DFSA), min_deposit `$5`, max_leverage `1:1000`, avg_spread_eurusd `1.6 / 0.6 Ultra Low`, withdrawal_speed, platforms (MT4/MT5/XM App/WebTrader), islamic_account, deposit_methods
- `geo` — accepted/excluded list (Bangladesh/India/Pakistan/MENA accepted; US/Canada/Israel/Iran excluded)
- `sections[]` — 8 ta object, prottek tar `id`, `heading`, `body`, optional `table`/`bullets`/`for`/`not_for`:
  1. `quick-verdict` — "Is XM Worth It in 2026?"
  2. `regulation-safety` — multi-entity license table (ASIC/CySEC/IFSC/DFSA + entity routing)
  3. `geo-availability` — accepted/excluded note + practical_note
  4. `spreads-accounts-fees` — 4-row account table (Micro $5 / Standard $5 / Ultra Low $50 / Shares $10K) + commissions/swap row
  5. `deposits-withdrawals` — payment method table (Card / Skrill / Neteller / Bank Wire / Crypto USDT) min + speed + fee
  6. `platforms-tools` — MT4 / MT5 / XM App / WebTrader + copy-trading note
  7. `pros-cons` — bullets from pros_cons block, also mirrored to top-level `pros`/`cons` already
  8. `final-verdict` — bottom_line + closing editorial note
- `affiliate_cta` — `{ label: "Open XM Account", url: <broker.website_url>, friction_reducers: ["$5 minimum", "MT4/MT5", "Swap-free available", "$30 no-deposit bonus (select regions)"] }`
- `trustpilot` — rating/reviews from form (if provided)
- `faq` — FAQ items from form
- `reading_time_minutes`, `word_count`

### Mapping source

Shob content already DB te ache — XM `long_review` er existing top-level keys (`quick_verdict`, `regulation`, etc.) theke direct map kora hobe. Kono notun copy lekha hocche na, sudhu structure shift.

## Touched

- `brokers` table — 1 row UPDATE, sudhu `long_review` column.
- Kono code file change na (component already canonical schema follow kore).
- Migration na, sudhu `supabase--insert` (UPDATE) tool.

Approve korle build mode e migration query likhbo.
