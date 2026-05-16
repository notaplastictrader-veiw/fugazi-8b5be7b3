## Move stats into left column — plain inline style

Stats row ke broker header card er **left column er vitore** nibo, niche dewa style ta v1 prototype er moto plain inline (border box nai, label uppercase tiny, value bold).

### Single change in `src/pages/BrokerDetail.tsx`

**1. Stats row ke left column er vitore move korbo**
- Currently lines ~622-643 e stats row main `grid-cols-[1fr_auto]` er **baire**, card er full width nicche
- New: stats row left column (`<div className="min-w-0 flex-1">` — ja logo er pashe shob meta info hold kore) er **shesh element** hishabe boshbe, "Claim This Profile / Verified 2 days ago" pill row er thik niche
- Right side e NAFT Trust Score panel jemon ase tai thakbe — left column lomba hoye gele right side empty space ta natural vabe fill hoye jabe

**2. Tile styling simplify korbo (v1 prototype match)**
- Remove: `border border-border bg-background/40 rounded-xl px-3 py-2` box
- Remove: `text-center` (left-align)
- Change container: `grid grid-cols-5 gap-4` → `flex flex-wrap gap-y-4 gap-x-8` (better readability, breathing room)
- Label: `text-[10px] font-mono uppercase tracking-widest text-muted-foreground` (unchanged tokens)
- Value: `text-base font-display font-extrabold text-foreground mt-0.5` (no border, no bg)

**3. Bonus banner thakbe full-width below entire grid (jemon ekhon ase)**

### Visual result

```text
┌─ Header card ─────────────────────────────────────────┐
│ ┌─ Left column ─────────────┐  ┌─ Right column ─────┐ │
│ │ Logo  Exness · Verified   │  │ NAFT Trust Score   │ │
│ │ ★★★★½ 4.3 · Trusted · FX  │  │   81/100           │ │
│ │ Regulated By: chips       │  │ Broker Health 100  │ │
│ │ Last updated: …           │  │                    │ │
│ │ [Claim] [Verified 2d]     │  │ [Open Account]     │ │
│ │                           │  │ [Review][Compl.]   │ │
│ │ MIN DEP  AVG SPREAD  …    │  │                    │ │
│ │  $10      0.3 pips        │  │                    │ │
│ └───────────────────────────┘  └────────────────────┘ │
│ ──── Claim 100% Bonus banner (full width) ────        │
└───────────────────────────────────────────────────────┘
```

### Out of scope
Trust score panel, action buttons, bonus banner, page-level disclaimer, any other section — kichui change hobe na.
