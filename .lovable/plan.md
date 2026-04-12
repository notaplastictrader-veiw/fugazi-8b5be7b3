

# Hero Section — Reduce Top Padding & Shrink Headline

## Problem
Too much empty space above "Not a Fugazi Trader" badge, and the headline is too tall — stats bar gets pushed below the fold on 770px viewport.

## Changes in `src/components/sections/HeroSection.tsx`

### 1. Reduce top padding
- Line 60: `pt-20 md:pt-28` → `pt-14 md:pt-20` (saves ~40-60px at top)

### 2. Shrink headline font size
- Line 92: `clamp(44px, 7vw, 88px)` → `clamp(36px, 5.5vw, 68px)`
- This keeps the 3-line structure but makes each line shorter, saving ~60-80px total height

### 3. Reduce headline bottom margin
- Line 92: `mb-3` → `mb-2`

Everything else (badge, eyebrow, subtitle, search, chips, stats) stays exactly as-is.

## File to modify
- `src/components/sections/HeroSection.tsx`

