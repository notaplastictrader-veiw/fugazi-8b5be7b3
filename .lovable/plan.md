## Issues identified

1. **Stats tiles** — number + dot inline, label wraps to 2 lines, left-aligned. User wants: centered, number on top, label single line below, no pulsing dot.
2. **Install App FAB overlap** — desktop FAB sits at `bottom-6` but the live ticker bar is `fixed bottom-0` (~32px tall) with `z-[200]`, so the FAB overlaps the ticker. Same risk for the floating "+" action button.
3. **"Live Trust Activity" not visible on first load** — Hero `min-h-[68vh]` + centered flex pushes the stats + activity strip below the fold on 1194×770. Need to tighten hero vertical rhythm so stats and the activity row land above the fold.
4. **Other overlap audit** — verify nothing else is hidden behind the fixed top (PromoTicker + Navbar = 92px) or fixed bottom (TickerBar 32px desktop / MobileBottomNav ~70px mobile).

## Changes (UI/CSS only — no logic, no backend)

**`src/components/sections/HeroSection.tsx`**
- Stats tile: center-aligned column. Number (large, primary) on top, label single line directly below in mono uppercase. Remove the ping/pulse dot beside number. Use `whitespace-nowrap` so labels never wrap. Keep the 4-tile grid layout, segmented borders, and hover glow.
- Reduce hero vertical rhythm: drop `min-h-[68vh]` to `min-h-0` (or `min-h-[56vh]`), trim `py-10` → `py-6`, so the stats row + Live Trust Activity sit above the fold on a 770px viewport.

**`src/components/InstallAppPrompt.tsx`**
- FAB: change desktop position from `md:bottom-6` to `md:bottom-12` (clears the 32px ticker bar with breathing room). Mobile `bottom-24` already clears MobileBottomNav, leave as-is.

**`src/components/FloatingActions.tsx`** (the floating "+" button)
- Same fix: raise desktop `bottom` so it doesn't sit on the ticker bar.

## Out of scope
- No changes to ticker bar, navbar, footer, or any data/queries.
- Stat numbers/labels stay as approved (590+, 50K+, 140+, 1.2M+).