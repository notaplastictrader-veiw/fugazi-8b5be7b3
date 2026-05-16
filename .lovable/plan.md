## Changes (UI-only, `src/pages/BrokerDetail.tsx`)

### 1. Stat tiles — clean numbers only

In the `stats` array (lines ~410-425):

- **Avg Spread**: extract just the first numeric value with unit (e.g., `0.3 pips`) from values like `"0.3 pips (Standard), 0.0 pips (Pro)"`. Helper: split on `,` / `(` and take the first chunk.
- **Leverage**: extract the highest `1:N` ratio (or `Unlimited`) from values like `"Unlimited (Pro), 1:2000 (Standard)"`. Helper: regex out all `1:\d+` and `Unlimited`, prefer `Unlimited`, else pick max number → display `Unlimited` or `1:2000`.

Full original strings remain available in the Trading Conditions / Account Types tab — only the tile shows a clean headline number.

### 2. Health Score compact line — explain what it means

Currently inside Trust Score panel: `⚡ 100 · Excellent` — meaningless to a first-time visitor.

Replace with a labelled, two-row mini-block (still compact, fits sidebar):

```
─────────────────────────
BROKER HEALTH       100/100
████████████████  Excellent
Based on complaints, scam alerts,
ratings & withdrawal proofs
─────────────────────────
```

- Top row: small uppercase label `BROKER HEALTH` (left) + score `100/100` + tier badge (`Excellent` / `Healthy` / `Watch` / `Risk`).
- Tiny progress bar.
- One-line caption in muted text: *"Based on complaints, scam alerts, ratings & withdrawal proofs"* — so visitors immediately understand inputs.
- Tooltip (`title=`) on the block with last-updated date for power users.

Implementation: instead of using `<BrokerHealthScore compact />` (which is a single pill), inline a small custom block in `BrokerDetail.tsx` sidebar so the caption stays visible without adding height to the global compact variant.

## Out of scope
- No DB or scoring logic changes
- No changes to admin Health Score full card
- Stats tile widths unchanged (still 5-up grid)
