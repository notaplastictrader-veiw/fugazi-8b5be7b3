# Broker Data Fix + Card Display Update

## Goal
6 ta broker er leverage/min deposit data live site theke Firecrawl diye verify kore correct kora, ar homepage/listing card a "Max Leverage" ar "Min Deposit" clearly show kora.

## Scope

### Part 1 — Data verification & fix (6 brokers)
Firecrawl scrape diye prottek broker er official site theke verify korbo:

| Broker | Current | To verify |
|---|---|---|
| AvaTrade | 1:30 | Max leverage (offshore entity) + min deposit |
| Capital.com | 1:30 | Max leverage (SCB Bahamas) + min deposit |
| FOREX.com | 1:30 | Max leverage (Cayman) + min deposit |
| FxPro | 1:30 | Max leverage (Bahamas) + min deposit |
| IG | 1:30 | Max international leverage + min deposit |
| Markets.com | 1:30 | Max leverage (offshore) + min deposit |

Each broker er jonno scrape kore actual published max leverage + min deposit nibo, tarpor `brokers` table update korbo via insert tool. Format: "Up to 1:500" (clearly indicate offshore max, not retail).

### Part 2 — Card UI update
Homepage broker card + listing card a:
- **Max Leverage** field — already ace, kintu label clear kore "Max Leverage" likhbo (ekhon shudhu "1:100" ace, confusing)
- **Min Deposit** field — visible kore add korbo (jodi already na thake)

Files likely affected:
- `src/components/BrokerCard.tsx` (or similar — need to confirm during exploration)
- Homepage broker section component

### Part 3 — Duplicate cleanup (optional, ask before deleting)
- `interactive-brokers` vs `ib` duplicate
- `bullwaves` vs `bullwaves-1776493644406` duplicate

## Technical approach
1. Read current `BrokerCard` component to see how leverage/min_deposit are rendered
2. Run Firecrawl scrape on each of the 6 broker URLs (use `/leverage` or `/account-types` paths) — server-side via edge function or one-off script
3. Update `brokers` table rows with verified values
4. Update card component to add clear labels + min deposit row

## Out of scope
- Other 91 brokers (already validated as correct in previous review)
- Prop firms
- Any business logic beyond data correction + card display

## Questions before I start
1. Card a "Min Deposit" already ki show hocche, na notun add korte hobe? (Ami component ta porte hobe confirm korar jonno)
2. Duplicate broker (IBKR, Bullwaves) delete korbo ki na ei loop a, na alada step a?
