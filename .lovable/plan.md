## Problem

1. **Overlap**: The scrolling price track is a sibling of the LIVE chip but has no clip region of its own — when items translate left, they visually slide under/over the LIVE chip.
2. **Wrong colors**: `+%` uses `text-primary` and `−%` uses `text-destructive`. These map to theme accents:
   - Dark theme → primary is **lime** (ok-ish for up) / destructive is red (ok)
   - Light theme → primary is **brown-orange** (not green!)
   - Sentinel theme → primary is **red** AND destructive is **red** → both +% and −% appear red

User wants: **+% always green, −% always red, in every theme.**

## Changes

### 1. Add theme-independent market tokens — `src/index.css`

Add `--bull` (green) and `--bear` (red) HSL variables to all three theme blocks (`:root/[data-theme="dark"]`, `[data-theme="light"]`, `[data-theme="sentinel"]`). Slightly tuned per theme for contrast, but always green/red:

- Dark: `--bull: 142 70% 50%; --bear: 0 85% 60%;`
- Light: `--bull: 142 65% 38%; --bear: 0 75% 45%;`
- Sentinel: `--bull: 142 70% 48%; --bear: 0 85% 58%;`

### 2. Register tokens in Tailwind — `tailwind.config.ts`

Add to the `colors` block alongside `teal`/`coral`/`purple`:
```ts
bull: "hsl(var(--bull))",
bear: "hsl(var(--bear))",
```
Enables `text-bull` / `text-bear` / `bg-bull` utilities.

### 3. Fix overlap + apply new colors — `src/components/sections/TickerBar.tsx`

Wrap `.ticker-track` in a `<div className="flex-1 min-w-0 overflow-hidden">` so the scrolling row is clipped to its own region, preventing visual overlap with the LIVE chip. Swap `text-primary`/`text-destructive` for `text-bull`/`text-bear` on the change column.

### 4. Same fix in `src/components/sections/BottomTicker.tsx`

Identical wrapper + color swap (this is the fixed bottom ticker — same bug).

## Notes

- LIVE chip color stays `text-primary` (it's a brand element, should follow theme).
- Only the +%/−% change column moves to bull/bear. Pair name and price stay theme-driven.
- Pure CSS/structural fix — no logic changes, no new dependencies.

## Files
- `src/index.css` — add `--bull` / `--bear` tokens to 3 theme blocks
- `tailwind.config.ts` — register `bull` / `bear` color utilities
- `src/components/sections/TickerBar.tsx` — wrap track in clip container, use `text-bull`/`text-bear`
- `src/components/sections/BottomTicker.tsx` — same fix
