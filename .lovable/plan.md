## Navbar Neon Polish — Subtle Bottom Glow

Apply a subtle neon-lime glowing bottom border to the navbar instead of wrapping the whole bar in a heavy box. This matches the existing NAFT dark/lime aesthetic without adding visual clutter on sticky scroll.

### Changes

**File: `src/components/layout/Navbar.tsx`**
- Replace the current plain bottom border of the sticky `<nav>` wrapper with:
  - A 1px gradient line (`transparent → primary/60 → transparent`) sitting at the bottom edge
  - A soft `box-shadow: 0 1px 20px hsl(var(--primary) / 0.15)` glow below the bar
  - Keep existing `bg-background/80 backdrop-blur` so the bar still reads as solid
- Theme-aware: uses `--primary` token, so it auto-switches across Dark (lime), Light (green), and Sentinel (red) themes.
- No layout, height, or spacing changes — purely a border/glow swap.

### Out of scope
- No changes to PromoTicker or TickerBar
- No changes to nav links, dropdowns, mobile menu, or logo
- No new components

If after seeing it you want the bolder **floating pill** version (option 2) instead, we can swap easily.