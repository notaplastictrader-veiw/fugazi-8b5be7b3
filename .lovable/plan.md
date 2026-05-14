## Goal
Homepage broker cards (BrokerTrustHub) currently break visually when a broker has many regulators (e.g. Exness — 7 chips) or long spread/leverage strings (e.g. "0.3 pips (Standard), 0.0 pips (Raw/Zero)"). Make cards uniform and clean.

## Changes (single file: `src/components/sections/BrokerTrustHub.tsx`)

### 1. Cap regulation chips
- Show **max 3** regulator chips inline.
- If more, append a compact `+N more` chip linking to `/brokers/{slug}` (full review page).
- Wrap chips in a single-line container (`flex-nowrap overflow-hidden`) so the header height stays consistent.
- Apply same logic to both `BrokerCard` (line ~83) and the prop-firm card block (line ~167).

### 2. Truncate long stat values
- For `avg_spread`, `leverage`, `min_deposit` cells (line ~103-107):
  - Force single-line: `truncate` + `title={value}` for hover tooltip.
  - Reduce font to `text-xs` when value length > 10 chars (or just always `text-xs` for safety).
- This prevents the 4-line wrap seen on Exness card.

### 3. Optional polish
- Add `min-h-0` to the inner content wrapper so the score bar + footer always sit at a predictable height.
- Card itself: keep current padding; no layout-grid changes.

## Result
- Exness card: shows `FCA · CySEC · FSCA  +4 more` and one-line stats.
- Cards across the homepage row align in height regardless of regulator count or stat verbosity.
- Full details remain available one click away on the broker detail page.

## Out of scope
- No data/schema changes.
- No changes to `Brokers.tsx` listing page (different layout, can be done later if needed).
- No new components.
