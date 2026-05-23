## Goal

Across the entire site, every broker/prop-firm card and the broker detail header must show **numbers only** for Avg Spread and Max Leverage — no descriptive words like "Fixed spreads from…", "Up to…", "all commission-free", etc.

Example (AvaTrade, current):
- Avg Spread: "Fixed spreads from 0.5 pips on EUR/USD; variable spreads from 0.6 pips; all commission-free"
- Max Leverage: "Up to 30:1"

After fix:
- Avg Spread: `0.5 pips` (number + unit only)
- Max Leverage: `1:30` (normalized ratio, largest if multiple)

## Approach

Centralize two pure formatters in `src/lib/utils.ts` (or a new `src/lib/brokerFormat.ts`) and replace every ad-hoc cleaner with them.

### `formatSpreadNumber(raw)`
- Strip everything; return the first numeric token followed by an optional unit `pips` / `pip` / `%`.
- Examples:
  - "Fixed spreads from 0.5 pips on EUR/USD; …" → `0.5 pips`
  - "0.02 pips" → `0.02 pips`
  - "1.6 pips" → `1.6 pips`
  - "$5K–$400K" (prop firms — keep as-is, no `pips` in source) → `$5K–$400K`
  - "N/A" / empty → `—`
- Regex: match the first `\d+(?:\.\d+)?` then look ahead for `pips?` or `%` within ~20 chars; otherwise return just the number; for prop-firm account-size ranges (contain `$` or `K`), passthrough.

### `formatLeverageNumber(raw)`
- Always output `1:N` (N = largest integer found).
- Examples:
  - "Up to 30:1" → `1:30`
  - "1:500" → `1:500`
  - "1:100, 1:500 (pro)" → `1:500`
  - "Unlimited" → `Unlimited`
  - "30:1" → `1:30` (swap)
  - empty → `—`
- Regex: find all `\d+\s*:\s*\d+` pairs (or `1:\d+` / `\d+:1`), normalize so the side that equals 1 is on the left, take max of the other side. If no ratio found, extract first integer and render `1:N`.

## Files to update

1. **Create** `src/lib/brokerFormat.ts` — export `formatSpreadNumber`, `formatLeverageNumber`.
2. `src/pages/BrokerDetail.tsx` — replace inline `cleanSpread` / `cleanLeverage` (lines 446–461) with the new helpers; also use them in the account-types table (line ~1067/1073) and in the description string (line ~1051, 402).
3. `src/components/broker/BrokerCard.tsx` — replace existing `formatSpread` / `formatLeverage` with re-exports of the new helpers (keeps all current imports working). `BrokerTrustHub.tsx` already imports `formatLeverage` from here so it auto-benefits.
4. `src/pages/PropFirms.tsx` (line 115) — wrap `broker.leverage` and `broker.avg_spread` in the new helpers.
5. `src/pages/Compare.tsx` & `src/pages/CompareVs.tsx` — format the `avg_spread` and `leverage` cells via the new helpers (the comparison logic `parseSpread` already extracts numbers, just the displayed value needs cleaning).
6. `src/components/match/MatchResults.tsx` (lines 98, 164) — apply `formatSpreadNumber` to `avg_spread`.

No DB changes, no business logic change — purely a presentation cleanup. Raw values stay intact in DB and in the `title` tooltip on hover.

## QA checklist

- AvaTrade `/brokers/avatrade` header → `0.5 pips` and `1:30`.
- Exness card → `0.1 pips` and `1:Unlimited` (or `Unlimited`).
- IC Markets card → `0.02 pips` and `1:500`.
- Prop firm card (FTMO) → leverage `1:100`, "spread" column keeps account-size range as-is.
- Compare page rows show short numeric values.
