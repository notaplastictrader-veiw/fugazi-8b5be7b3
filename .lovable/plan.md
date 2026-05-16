## Prop-firm Overview tab — full rewrite plan

Scope: `BrokerDetail.tsx` Overview tab (lines 771–1060) when `isProp === true`. Broker variant stays untouched. No DB changes.

### What changes section-by-section

| # | Section | Broker (today) | Prop-firm (new) |
|---|---|---|---|
| 1 | Our Verdict | broker description / verdict | same — copy already works |
| 2 | Trust Amplifiers | BeforeYouDeposit + SentimentSparkline | same — checklist already has prop-firm variant ✓ |
| 3 | Key Facts | spreads, deposit, leverage | **Replace**: Account sizes, Challenge fee from, Phases, Profit split, Payout cycle, Refundable fee, Drawdown model, Underlying broker, Year founded, HQ |
| 4 | Regulation & Safety | "X holds licenses from…" | **Replace** with "Firm Structure & Safety" — HQ entity, underlying broker(s) (the actually-regulated party), refund policy, dispute resolution |
| 5 | Trading Conditions table | Account / MinDep / Spread / Lev / Comm | **Replace** with Challenge Programs table: Program / Phases / Profit Target / Max DD / Daily DD / Fee → links to Challenges tab |
| 6 | Platforms | MT4/MT5/WebTrader | keep (FundedNext supports MT4, MT5, cTrader, Match-Trader) |
| 7 | Deposits & Withdrawals | bank/card/crypto deposits | **Replace** with Payout Methods (USDT TRC20, USDT ERC20, Bank Wire, Rise, Deel) + payout cycle + minimum payout |
| 8 | Customer Support | live chat / email / phone / telegram | same (just confirm 24/7) |
| 9 | Pros & Cons | review.pros / review.cons | same — content already prop-firm specific in data file |
| 10 | Best For / Not Ideal For | same | same |
| 11 | Trust Score Breakdown | regulation / reviews / withdrawal / complaints | **Replace** weights with prop-firm relevant ones: Payout History 35%, User Reviews 25%, Rule Fairness 20%, Complaint History 20% |
| 12 | How to Open Account | KYC + deposit flow | **Replace** with "How to Get Funded": pick challenge → pay fee → pass phase 1 → pass phase 2 → get funded → request payout |

### The "Regulated By" question

Prop firms aren't broker-regulated. Three options for what to show in the header chip row + Overview section:

- **A. Underlying Broker / Liquidity Provider** (recommended)  
  Header chip: `LIQUIDITY BY: Eightcap (ASIC), GBE Brokers (BaFin)`  
  Why: that's the actually-regulated entity holding trader funds. Most useful for trust signal.

- **B. HQ / Legal Entity address**  
  Header chip: `HQ: FundedNext FZCO · Dubai, UAE`  
  Why: shows physical presence + jurisdiction. Good but doesn't answer "are my orders safe?"

- **C. Both** (chips on two lines)  
  `HQ: Dubai, UAE` + `LIQUIDITY BY: Eightcap, GBE Brokers`  
  Why: cleanest — covers entity + execution. Slight risk of clutter on mobile.

My pick: **C** — keeps the header informative without losing the "trust at a glance" feel. If you want minimum noise pick A.

### Implementation approach

- Introduce a small helper block at top of overview render: `if (isProp) return <PropOverview ... />` else current jsx. Keeps the diff readable.
- Hardcode FundedNext-specific values inline for now (same approach as the header card stats fix). When you add a second prop firm we'll extract to `src/data/brokers.ts` fields.
- All semantic tokens (`text-foreground`, `text-muted-foreground`, `bg-primary/10`, `glass-card`) — no hex.
- No new files; everything inline in `BrokerDetail.tsx` to match current pattern.

### One question before I build

Pick the regulation chip option: **A** (underlying broker only), **B** (HQ only), or **C** (both)?

Reply with just the letter and I'll ship sections 3–12 + the chip update in one pass.