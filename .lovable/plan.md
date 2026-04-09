

# Prop Firm Card Redesign

## What changes
Replace the generic `BrokerCard` used for prop firms with a dedicated `PropFirmCard` component that shows prop-firm-specific fields matching the uploaded reference design.

## Card layout (matching reference image)
- **Name** (bold, left) + **Verified badge** (top-right)
- **Regulation tags** below name
- **3-column stats row**: replace "Avg Spread" with "Account Size" (`$5K–$400K`), keep "Leverage", replace "Min Deposit" with "Start From" (`$10`)
- **Additional row**: "Instant Funding" — Yes/No indicator
- **Trust Score** bar (same as broker card)
- **Stars + review count** + "Full review" link

## Data approach
Since the `brokers` table doesn't have `account_size` or `instant_funding` columns, and adding DB migrations for this is overkill right now, we'll use the existing fields creatively:
- `min_deposit` → displayed as "Start From"
- `avg_spread` → repurposed to store "Account Size" for prop firms (e.g., "$5K–$400K")
- `leverage` → kept as-is
- For "Instant Funding", derive from tags: if `tags` includes `"instant-funding"` → show "Yes", otherwise "No"

## File: `src/components/sections/BrokerTrustHub.tsx`

1. Create a new `PropFirmCard` component inside the file with:
   - Same glass-card styling as `BrokerCard`
   - Stats row: "Account Size" (from `avg_spread`), "Leverage", "Start From" (from `min_deposit`)
   - New row below stats: "Instant Funding" label with Yes (green) / No (muted) indicator based on `tags.includes("instant-funding")`
   - Trust score bar, stars, full review link — same as broker card
2. Replace `<BrokerCard>` with `<PropFirmCard>` in the prop firms grid (line 184)

No database changes needed.

