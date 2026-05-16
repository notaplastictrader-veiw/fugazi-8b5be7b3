## Goal
`BeforeYouDepositChecklist` ekhon shob broker er jonno "deposit" centric. Prop firm e user deposit kore na — challenge fee dey, rules follow kore, payout ney. Tai prop-firm er jonno alada 6-item checklist + alada heading dorkar.

## Changes

### 1. `src/components/broker/BeforeYouDepositChecklist.tsx`
- Notun optional prop: `variant?: "broker" | "prop-firm"` (default `"broker"`).
- Duita item array rakhbo: `brokerItems` (current 6) + notun `propFirmItems` (6):
  1. **Verify the firm's payout history** — Check 30-day withdrawal proof gallery + recent payout complaints. No proofs = walk away.
  2. **Read the full challenge rules before paying** — Daily loss, max drawdown, consistency rule, min trading days, news/EA/weekend restrictions. Ek line bhul holei account bust.
  3. **Start with the smallest account size** — $5k/$10k diye test koro firm er execution, slippage, dashboard, support. Boro account purer ager na.
  4. **Confirm the profit split + payout cycle** — 80/20 vs 90/10, bi-weekly vs monthly, min payout threshold, payout method (Deel/Rise/Wise/crypto) — sob T&Cs e likha ache kina.
  5. **Check the broker behind the firm** — Prop firm trades route hoy ek underlying broker er kache. Sei broker er regulation + spread tomar strategy e thik ache kina dekho.
  6. **Confirm the firm is not on our Scam Watch** — Active scam alert ribbon thakle skip koro. Refund policy + dispute resolution chesta korar age clear thaka uchit.
- Heading text variant-based:
  - broker: `Before you deposit at {brokerName}` (current)
  - prop-firm: `Before you buy a challenge at {brokerName}`

### 2. `src/pages/BrokerDetail.tsx`
- `<BeforeYouDepositChecklist>` call e `variant={broker.type === "prop-firm" ? "prop-firm" : "broker"}` pass korbo.

## Technical notes
- Single file component, no DB/style changes. Tokens unchanged.
- Mobile + desktop same — collapsible card already responsive.
- (9/6) counter bug ta amar scope na, alada — eta plan e thik korte hole bolen, korbo.
