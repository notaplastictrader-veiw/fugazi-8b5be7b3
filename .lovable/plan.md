

# Hero Section — Compact Stats & Remove Badge Emoji

## Changes in `src/components/sections/HeroSection.tsx`

### 1. Remove emoji from static badge
Change `"Not a Fugazi Trader 😉"` → `"Not a Fugazi Trader"`

### 2. Make the stats bar more compact
The stats bar currently shows 4 stats (Verified reviews, Brokers listed, Scam alerts issued, Active traders). These are visible immediately when the page opens — reduce spacing and font sizes to make it feel tighter:

- Reduce stat value font: `text-xl md:text-2xl` → `text-lg md:text-xl`
- Reduce stat label font: `text-[11px]` → `text-[10px]`
- Reduce padding: `px-5 md:px-8` → `px-4 md:px-6`
- Reduce card padding: `px-2 py-4` → `px-2 py-3`

### 3. Reduce chips section spacing
- Reduce bottom margin: `mb-12` → `mb-8`

These changes will tighten the bottom portion so the stats/chips don't take up excessive space, letting the headline dominate.

## File to modify
- `src/components/sections/HeroSection.tsx`

