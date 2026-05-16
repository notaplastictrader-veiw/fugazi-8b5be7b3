## Problem

Broker detail page-er hero ekhon onek lomba — Broker Health Score™ full card (~200px) ar Trust Score panel duitai same info dichhe (complaints, scam alerts, score), unclaimed banner alada jaiga nichhe, ar 5-tile stat strip + trust amplifiers row mile "Our Verdict" first scroll-er onek niche chole geche. Client landing-er por verdict na dekhe page chere chole jachhe.

## Goal

1194×770 viewport-e (current preview size) page load hole user **Our Verdict** box-er end porjonto dekhte parbe — kichu na scroll kore.

## Changes (UI-only, `src/pages/BrokerDetail.tsx`)

### 1. Health Score — full card → compact pill
Lines 492-501: full `<BrokerHealthScore />` card-er bodole right sidebar-er Trust Score panel-er bhitor ekta compact version dhukabo (`compact` prop already supported). Saves ~180px.

```
┌─ NAFT TRUST SCORE      AVERAGE ─┐
│ 72 /100  ▓▓▓▓▓░░░             │
│ ⚡ Health 100 · Excellent      │  ← new compact line
└────────────────────────────────┘
```

### 2. Unclaimed banner — remove (redundant)
Lines 601-621: hero-er moddhe already "Claim This Profile" pill ache (line 514). Banner-tao same info — duplicate. Remove kore dilam, ekta concise tooltip/hover hero badge-e thakbe.

### 3. Trust amplifiers grid — move below tabs
Lines 623-633 (`BeforeYouDepositChecklist` + `SentimentSparkline`) ekhon hero ar tabs-er majhe boshe verdict-ke push korche. Eta `Overview` tab-er bhitor verdict-er **niche** rakhbo — content-wise more relevant, ar above-the-fold-e jaiga free hobe.

### 4. Stat strip — tighter padding
Line 589-596: `py-3` → `py-2`, `mt-5` → `mt-4`. ~20px save.

### 5. Hero outer padding trim
Hero card outer container-e `mb-6` → `mb-4`, internal section gaps `mt-5` → `mt-4` consistently. ~20px save.

### 6. Tabs — reduce top margin
Line 718: `mt-6 space-y-8` → `mt-4 space-y-6` so verdict box top closer to tabs.

## Out of scope
- No DB / logic changes
- Health Score full card thakbe **admin page-e** (HealthScoreAdmin) — only hero-te compact
- Scam alert investigations section unchanged (critical info)
- Mobile layout already stacks — same compression applies cleanly

## Expected outcome
At 1194×770:
- Hero card (logo, name, score, regulation, claim, CTAs, stats) ≈ 480px
- Tabs bar ≈ 50px
- Verdict heading + box ≈ 180px
- **Total ≈ 710px** → fits within 770px viewport with room for partial peek of Key Facts table.
