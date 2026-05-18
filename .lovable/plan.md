## Problem

On `/brokers/exness#overview` the Trust Score Breakdown shows four sub-scores whose weighted sum is **9.1**, but the Overall Trust Score row prints **8.1** (because it shows `broker.score`, not the weighted average). The user wants Overall to stay 8.1 and the four bars to reconcile to it.

Current rows (Exness):

| Row | Score | Weight |
|---|---|---|
| Regulation | 10.0 | 30% |
| User Reviews | 8.2 | 25% |
| Withdrawal Speed | 8.1 | 25% |
| Complaint History | 10.0 | 20% |
| Weighted sum | **9.075** | |
| Overall displayed | **8.1** | |

## Cause

`src/pages/BrokerDetail.tsx` lines ~1213–1232 compute each sub-score from a different raw signal (license count × 2.5, stars × 2, score + instant bonus, 10 − complaints × 0.3). The bottom row prints `broker.score` independently, so the math drifts whenever the inputs don't happen to average to `broker.score`.

## Fix

Inside the existing IIFE (`src/pages/BrokerDetail.tsx` ~line 1213), after building the `items` array, normalise the four scores so their weighted average equals `broker.score`:

1. Parse each `weight` string (`"30%"` → `0.30`).
2. Compute `rawWeighted = Σ value × weight`.
3. If `rawWeighted > 0`, multiply each `value` by `factor = broker.score / rawWeighted`, then clamp to `[0, 10]` and round to 1 decimal.
4. Render unchanged — Overall row keeps showing `broker.score`.

Applied to both branches (`prop-firm` and the default broker branch) so the math reconciles for every broker, not just Exness.

For Exness this produces approximately:
- Regulation 8.9 · User Reviews 7.3 · Withdrawal 7.2 · Complaints 8.9
- Weighted ≈ 8.1 ✓

The hint text under each bar (license count, review count, processing time, complaint count) is not changed — it describes the underlying real-world signal; only the numeric score is rescaled so the breakdown reconciles to the overall.

## Technical surface

- Edit one IIFE in `src/pages/BrokerDetail.tsx` (~lines 1213–1251).
- No DB change, no design change, no new components.
- No other files touched.
