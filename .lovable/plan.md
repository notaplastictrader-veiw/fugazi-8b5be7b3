## Prop firm header card — review + fix plan

Scope: only the top header card on `/brokers/:slug` for prop firms (BrokerDetail.tsx, lines ~456–576). No DB changes, no logic changes elsewhere.

### 1. Fix wrong stat values (FundedNext)
Currently pulling from broker fields meant for regular brokers, so it shows nonsense:
- ACCOUNT SIZE → `broker.avg_spread` = "Raw"  ❌  → should be **$2K – $200K**
- START FROM → `broker.min_deposit` = "$59"  ❌  → should be **$32.99**

Fix: for `isProp` brokers, ignore `avg_spread` / `min_deposit` and read prop-specific values. Two options:

- **A (quick):** hardcode FundedNext-correct strings in the `stats` array fallback (`"$2K – $200K"`, `"$32.99"`).
- **B (clean):** add per-broker prop overrides in `src/data/brokers.ts` (e.g. `account_size_range`, `challenge_start_price`, `profit_split`, `payout_speed`) and read them here. Recommended — same pattern will work for the other prop firms later.

### 2. Stats strip alignment (looks pushed right)
Right now the 5-tile strip sits **inside the left identity column**, so it starts after the 80px logo + gap. On the 1194px viewport it visually drifts right while the trust panel hugs the right edge.

Fix: move the stats strip **out of the identity column** so it spans the full width of the header card, sitting below both the identity block and the trust panel.

```text
Before                          After
┌──────────────┬──────────┐     ┌──────────────┬──────────┐
│ logo  name…  │  trust   │     │ logo  name…  │  trust   │
│       chips… │  panel   │     │       chips… │  panel   │
│       [stats strip]     │     │       claim  │  CTAs    │
│              │  CTAs    │     ├──────────────┴──────────┤
└──────────────┴──────────┘     │ [ stats strip full-w ]  │
                                └─────────────────────────┘
```
Result: stats are visually centered/left-aligned to the card edge, not shoved under the name column.

### 3. "On Demand" wording
Currently `PAYOUT SPEED: On Demand`. It's ambiguous (does it mean instant? request anytime?).

Options to pick from:
- **Same Day** — clearest for traders, matches industry copy
- **Within 24h** — concrete promise
- **Up to 4× / month** — frequency-based instead of speed
- Keep **On Demand** but add a tiny tooltip "Request payouts any time, processed same-day"

Will go with **"Same Day"** unless you prefer one of the others.

### 4. Optional small polish (only if you want)
- Stat strip currently has 5 columns crammed at `md:grid-cols-5`. With wider tiles after going full-width we can let each label breathe — same 5 columns but slightly larger numbers.
- "REGULATED BY: Regulated" looks empty — for prop firms, replace with the underlying broker label (e.g. "Liquidity by: Eightcap, GBE Brokers") or hide the row entirely.

### Question before I implement
Two choices to confirm:
1. Stat data source — **A (hardcode FundedNext)** or **B (per-broker fields in data file)**?
2. Payout wording — **Same Day**, **Within 24h**, **Up to 4×/month**, or **keep On Demand + tooltip**?

After you answer I'll do steps 1–3 in one pass (and 4 if you say yes).