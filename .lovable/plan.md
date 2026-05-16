## Fix: Tooltip clipped inside stats grid

**Problem:** The stats grid wrapper has `overflow-hidden` (needed for the rounded segmented look), which clips the Radix tooltip popover so the text isn't visible.

**Fix in `src/components/sections/HeroSection.tsx`:**

1. Remove `overflow-hidden` from the grid container. To keep the segmented rounded-corner look, instead clip each tile's hover background by giving the **first/last tiles** appropriate `rounded-*` classes, OR simpler: keep `overflow-hidden` on a separate inner wrapper that only holds the tile backgrounds, and let the Tooltip portal escape.

   Cleanest approach: Radix `TooltipContent` already renders into a portal at `document.body`, so `overflow-hidden` on an ancestor should NOT clip it. The real issue is likely **z-index** — the tooltip is appearing behind the fixed ticker/navbar. Bump `TooltipContent` with `className="z-[300] max-w-[220px] ..."` (above ticker's `z-[200]`).

2. Also add `sideOffset={8}` so the tooltip floats clearly above the icon.

3. Verify by hovering each ⓘ in preview after the fix; tooltip should appear above the tile with full text visible.

No other files change. Layout, stats, ticker, FAB all stay intact.
