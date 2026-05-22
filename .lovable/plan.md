## Goal
Apnar pochondo kora "Side-rail Minimal" direction-ta `BrokerCard.tsx`-e implement korbo. Shob existing field thakbe — shudhu visual hierarchy clean korbo (bigger type, more spacing, fewer competing borders/colors).

## What changes

**File**: `src/components/broker/BrokerCard.tsx` (BrokerTrustHub er `PropFirmCard`-eo same pattern apply korbo, so both grids consistent thake)

New card structure:
```
┌─┬─────────────────────────────┐
│ │ [logo] BROKER NAME  [pill]  │   ← Barlow Condensed 2xl, uppercase
│ │ CYSEC · ASIC · DFSA +6      │   ← regulators as inline meta text
│L│                              │
│I│ [● Not a Fugazi] [✓Featured]│   ← compact status row
│M│                              │
│E│ AVG SPREAD  LEVERAGE  MIN   │   ← 3-col, Barlow Condensed 2xl values
│ │   0.8 pips   1:1000   $5    │
│R│                              │
│A│ TRUST SCORE         8.2/10  │   ← lime score number
│I│ ▰▰▰▰▰▰▰▰▱▱                  │   ← 1px slim bar
│L│                              │
│ │ ✓ Verified by NAFT  ● 282 vw│   ← micro meta
│ ├─────────────────────────────┤   ← divider + subtle bg tint
│ │ [CLAIM $30 BONUS         →] │   ← OfferRail (kept as-is)
│ │ ★★★★☆ (142)    READ REVIEW↗│
└─┴─────────────────────────────┘
```

## Specific changes

1. **Wrap**: `flex` container with 1.5px lime left rail (`bg-primary w-1.5`) + dark card body. Replace `glass-card rounded-xl p-5` shell.
2. **Header**: logo + name in Barlow Condensed `text-2xl font-bold uppercase`. Regulators move from chip-row to single inline meta line (`CYSEC · ASIC · DFSA +6 more`) under the name — removes the heaviest visual noise.
3. **Status row**: Keep "Not a Fugazi" pill (lime tinted) + "Featured" as a slim check-mark label. Watchlist heart stays top-right, muted until hover.
4. **Metrics**: 3-col grid, labels in `text-[10px] tracking-wider text-muted-foreground/60`, values in `font-display text-2xl`. Bigger, scannable.
5. **Trust score**: label left / `font-display text-xl text-primary` right + 1px slim bar. Removes the chunky 2-line block feel.
6. **Meta line**: "Verified by NAFT" + "282 viewing" as tiny uppercase micro-text in single row.
7. **Action footer**: Separated by `border-t border-border/40` + faint `bg-white/[0.02]` tint. Contains OfferRail (unchanged) + stars/review-count + "Read Full Review" / complaints warning (existing logic preserved).
8. **PropFirmCard**: Same skeleton, accent rail uses `bg-accent` instead of `bg-primary`. Keeps Instant Funding row in metrics meta zone.

## Theme compliance
- All colors via semantic tokens (`primary`, `card`, `border`, `muted-foreground`) — works across Dark, Light, Sentinel themes.
- Fonts: `font-display` (Barlow Condensed) for name/metrics, `font-sans` (DM Sans) for body.
- No new tokens needed.

## Out of scope
- No data fields removed/added.
- No DB or API changes.
- OfferRail component itself untouched.
- Grid layout (`sm:grid-cols-2 lg:grid-cols-3`) unchanged.

After approval, I'll edit `BrokerCard.tsx` + `PropFirmCard` block in `BrokerTrustHub.tsx`, then screenshot the result for QA.