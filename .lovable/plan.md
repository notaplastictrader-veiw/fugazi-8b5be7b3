

## Fix Grunge Text: Clean Dasara-Style Texture (No Blur)

### Problem
The current implementation creates a blurry, washed-out effect. The Dasara reference has **sharp, crisp text with dry dust/dirt texture baked into the letterforms** -- no blur, no glow, no soft shadows. The texture looks like cracked earth or dried mud on the surface of the letters.

### Key Differences (Current vs Dasara Reference)
- Current: blurry text-shadows, soft glow, low contrast noise -- looks foggy
- Dasara: sharp edges, high-contrast grainy dirt texture clipped inside letters, no blur at all

### Approach
Remove all blur-based text-shadows. Use a **high-contrast, coarse noise texture** clipped to the text with `background-clip: text`. The `::before` pseudo-element provides the solid base color behind the textured layer -- but with **zero blur** in its text-shadow (only hard-offset shadows for a stamped/printed feel).

### Files to Change

**1. `src/index.css`** -- Rewrite `.grunge-text` and `.grunge-text-accent`

- Remove all `blur` values from text-shadow (use `0px` blur radius only)
- Increase noise `baseFrequency` to `0.8` and `opacity` to `0.55` for coarser, more visible grain
- Bump `contrast()` to `1.8` and drop `brightness` to `0.7` for that dark, gritty dirt look
- `::before` gets hard-offset shadows only (e.g. `2px 2px 0px`) -- no soft glow
- Remove the `0px 0px 20px` and `0px 0px 30px` blur shadows entirely
- Same treatment for `.grunge-text-accent` with primary color

**2. `src/components/sections/HeroSection.tsx`** -- No structural changes needed, just ensure `data-text` attributes are present (they already are)

### Result
Sharp, clean letterforms with visible dry-dust grain texture inside -- matching the Dasara movie poster aesthetic. No blur, no glow, no fog.

