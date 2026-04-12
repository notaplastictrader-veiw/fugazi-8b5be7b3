

# Hero Section — New Copy + Compact Layout

## Goal
Replace the current hero copy with the new messaging, add a static badge, and make the title smaller so that **everything from badge to stats is visible on first load** without scrolling.

## Changes to `src/components/sections/HeroSection.tsx`

### 1. Add static badge above the rotating eyebrow
A simple glass pill: **"Not a Fugazi Broker 😉"** — static, always visible. Placed above the rotating eyebrow.

### 2. Replace the main headline
Change from the massive "Not A Fugazi / Trader." to a smaller, compact title:
```
Broker Reviews
That Actually Matter.
```
Reduce font size from `clamp(64px, 9vw, 120px)` to `clamp(36px, 6vw, 72px)` so the entire hero fits in viewport.

### 3. Replace the subtitle
Change from the two-line "Real reviews..." paragraph to:
**"We Test Brokers. You Trade Smarter."** — single line, slightly larger text (18-19px), bold feel.

### 4. Keep everything else
- Rotating eyebrow stays (below the static badge)
- Search bar stays visible
- Chip groups stay
- Stats bar stays

### 5. Reduce vertical spacing
- Change section from `min-h-screen` to `min-h-[85vh]` so content is more compact
- Reduce `mb-10` on eyebrow to `mb-4`
- Reduce `mb-6` on h1 to `mb-3`
- Reduce `mb-8` on subtitle to `mb-5`
- Reduce `mb-12` on chips to `mb-6`

This ensures badge → eyebrow → title → subtitle → search → chips → stats all fit on a 770px viewport.

### Files to modify
- `src/components/sections/HeroSection.tsx`

