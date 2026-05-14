## Goal
Clean up homepage broker card display so values are short and uniform. Full details remain on the broker review page.

## Changes — single file: `src/components/sections/BrokerTrustHub.tsx`

Add three small pure formatting helpers at the top of the file (no data changes, display-only):

1. **`formatSpread(value)`** — strip units/labels, keep first number only.
   - `"0.3 pips (Standard), 0.0 pips (Raw/Zero)"` → `"0.3"`
   - `"1.6 pips"` → `"1.6"`
   - `"0.02 pips"` → `"0.02"`
   - Fallback: original value if no number found.

2. **`formatLeverage(value)`** — keep only the highest `1:N` ratio (or `Unlimited`).
   - `"Unlimited (Pro), 1:2000 (Standard)"` → `"Unlimited"`
   - `"1:500"` → `"1:500"`
   - `"1:1000"` → `"1:1000"`
   - Logic: if contains "unlimited" (case-insensitive) → `"Unlimited"`; else find all `1:\d+` matches, return the one with the largest N.

3. **`formatRegulator(value)`** — keep only the short code before any `(` or `—`/`-`.
   - `"FCA (UK) — 730729"` → `"FCA"`
   - `"CySEC (Cyprus) — 178/12"` → `"CySEC"`
   - `"FSCA (South Africa)"` → `"FSCA"`
   - Logic: split on `(`, `—`, `-`, take first token, trim.

## Apply at render sites

- **BrokerCard** (lines ~83 and ~104):
  - Regulator chips: render `formatRegulator(r)` instead of `r`. Keep the existing 3-chip cap + `+N more`.
  - Avg Spread cell: `{formatSpread(broker.avg_spread)}`
  - Leverage cell: `{formatLeverage(broker.leverage)}`
  - Min Deposit cell: leave as-is (already short).

- **PropFirmCard** (lines ~167 and ~187):
  - Regulator chips: `formatRegulator(r)`.
  - Leverage cell: `{formatLeverage(firm.leverage)}`.
  - Account Size / Start From: leave as-is.

## Out of scope
- No DB updates — full strings stay intact in Supabase, just trimmed at display.
- No changes to Brokers listing page or Broker detail page.
- No new components or libraries.
