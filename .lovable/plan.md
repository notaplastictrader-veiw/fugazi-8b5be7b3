

# Hero Section — New Copy & Layout Update

## Overview
Restructure the Hero section with new messaging hierarchy: static badge on top, new headline, new subtitle, and keep the rotating eyebrow below the badge.

## Layout (top to bottom)

```text
┌─────────────────────────────────────┐
│   [ Not a Fugazi Trader 😉 ]        │  ← static glass pill badge
│                                     │
│   [ rotating eyebrow badges ]       │  ← existing rotating system stays
│                                     │
│   BROKER REVIEWS                    │  ← grunge-text (foreground color)
│   THAT ACTUALLY                     │
│   MATTER.                           │  ← grunge-text-accent (primary color)
│                                     │
│   We Test Brokers. You Trade        │  ← single-line subtitle
│   Smarter.                          │
│                                     │
│   [ Search bar ]                    │
│   [ Chips ]                         │
│   [ Stats ]                         │
└─────────────────────────────────────┘
```

## Changes in `src/components/sections/HeroSection.tsx`

### 1. Add static badge (new element above rotating eyebrow)
A glass pill with "Not a Fugazi Trader 😉" — static, always visible. Uses `glass-card` styling with rounded-full, small text, subtle border.

### 2. Move rotating eyebrow below the static badge
Keep all existing rotating logic and eyebrow items. Just reorder in JSX so it sits between the static badge and headline. Reduce margin between them.

### 3. Update headline text
Replace:
```
"Not A Fugazi" / "Trader."
```
With:
```
"Broker Reviews" / "That Actually" (grunge-text, foreground)
"Matter." (grunge-text-accent, primary color)
```
Same Barlow Condensed font, same grunge-high mask, same massive clamp sizing.

### 4. Update subtitle
Replace the two-line paragraph with a single clean line:
**"We Test Brokers. You Trade Smarter."**

### 5. Update i18n keys
Update the `t()` fallback strings for `hero.subtitle` and `hero.subtitle2` (or consolidate into one key).

## Grunge styling
The uploaded images are **reference only** — they show the grunge typography aesthetic already implemented via the `grunge-text` / `grunge-high` CSS mask system. No font changes needed; the existing grain mask treatment already achieves this look.

## Files to modify
- `src/components/sections/HeroSection.tsx` — all changes in this single file

