## Idea
Bhalo idea — unclaimed broker pages e ekta clear callout banner thakle visitors bujhbe je info community-sourced and broker chaile claim korte parbe. Trust + transparency duto bare.

## Where to add
`src/pages/BrokerDetail.tsx` — broker hero card-er thik **niche**, "Quick Stats" / tabs section-er **upore**. Eta most visible spot — user broker name dekhar por porei eta porbe, kintu hero CTA gulo block korbe na.

Alternative spots considered:
- Hero-er moddhe (already crowded with badges, score, claim button)
- Sidebar (kom visible, mobile-e niche chole jay)
- Page-er top (intrusive, ad-banner mone hobe)

→ Hero-er thik niche ekta slim full-width info strip best.

## What it shows (conditional)

**Only render when** `claimStatus === "unclaimed"` — claimed/pending hole hide.

```
┌───────────────────────────────────────────────────────────────┐
│ ⓘ  Unclaimed profile — info sourced from public data &        │
│    community reviews.  Are you from {broker.name}?            │
│    [ Claim this profile → ]                                   │
└───────────────────────────────────────────────────────────────┘
```

- Soft accent background (`bg-accent/5 border-accent/20`)
- Info icon left
- Text uses `broker.name` dynamically
- "Claim this profile →" button reuses existing `handleClaimClick` handler (no new logic)
- If `claimStatus === "pending"` → optionally show a muted variant: "Claim under review" (or skip — simpler is just hide)

## Implementation
1. New small inline JSX block in `BrokerDetail.tsx` right after the hero card closing tag, before the tabs/quick-stats section.
2. Wraps in `{claimStatus === "unclaimed" && (...)}`.
3. Uses existing `handleClaimClick`, `broker.name`, `claimLoading` — no new state, no new handlers, no schema change.
4. Semantic tokens only (`accent`, `muted-foreground`, `border-accent/20`).
5. Responsive: stacks vertically on mobile (`flex-col sm:flex-row`).

## Out of scope
- No DB changes (claim_status already tracked in `broker_profiles`)
- No new component file — small enough to inline
- Hero-er existing "Claim This Profile" badge thakbe (redundant noy — badge = quick signal, banner = explanation)
