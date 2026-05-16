## Goal
Prop firm broker detail page (`/brokers/:slug` where `type === 'prop-firm'`) er tabs e notun 4 ta tab add korbo: **Rules, Challenges, Payouts, Forum** — and existing tabs shob link-able (URL hash) korbo.

## Current state
`src/pages/BrokerDetail.tsx` te ekta `<Tabs>` ace 6 ta tab niye: Overview, Reviews, Complaints, Promotions, Comparison, Scam Score. Tabs gula URL e sync hoy na, tai shareable na.

## Changes

### 1. Tab order (prop-firm only)
```
Overview · Rules · Challenges · Payouts · Reviews · Complaints · Promotions · Comparison · Score · Forum
```
Regular broker hole purono 6-tab list e thakbe (Rules/Challenges/Payouts/Forum hide).

Detection: `broker.type === 'prop-firm'`.

### 2. URL hash sync (linkable tabs)
- Mount e `location.hash` theke active tab read korbo (e.g. `/brokers/fundednext#payouts`).
- `onValueChange` e `navigate(..., { replace: true })` diye hash update korbo.
- Tabs ekhon directly share/link kora jabe.

### 3. New tab contents (prop-firm)

**Rules tab** — Key trading rules card:
- Max daily loss, max overall drawdown, profit target, min trading days, consistency rule, news trading allowed?, EA allowed?, weekend holding.
- Source: `broker.rules` (jsonb) or fallback demo placeholder text "Rules being verified — check official site."

**Challenges tab** — Challenge plans grid:
- Account sizes ($10k / $25k / $50k / $100k / $200k), fee, profit split, phases (1-step / 2-step / instant).
- Source: `broker.challenges` (jsonb array) or demo cards.

**Payouts tab** — Reuses existing `WithdrawalProofGallery` + `PayoutSpeedLeaderboard` filtered for this broker + payout frequency / min payout / method list.

**Forum tab** — List of forum threads tagged with this broker (query `forum_threads` where `broker_id = broker.id`), with "Start a discussion" CTA linking to `/forum/new?broker=<slug>`. Empty state: "No threads yet — be first."

**Score tab** — Existing "Scam Score" tab renamed to just "Score" (matches user's wording).

### 4. Sticky tab bar
Tabs row ke `sticky top-16 z-20 bg-background/95 backdrop-blur` korbo so jokhon scroll kore tokhono visible thake (mobile + desktop).

## Technical notes
- File touched: `src/pages/BrokerDetail.tsx` only (+ ekta chhoto helper for hash sync).
- `broker.rules` and `broker.challenges` columns DB te thakte pare na — fallback demo content show korbo (user already said "demo add koro jekhane info nai, pore live diye update korbo").
- No DB migration needed unless user wants structured rules/challenges fields. Can do that in follow-up.
- All semantic tokens from index.css; mobile-first responsive.
