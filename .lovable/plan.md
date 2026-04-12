

# Hero Section — Compact to Fit Above the Fold

## Goal
Make everything in the reference image (badge → eyebrow → headline → subtitle → search → chips → stats) visible on first load without scrolling on a ~770px viewport.

## Changes in `src/components/sections/HeroSection.tsx`

### 1. Remove `min-h-screen` and vertical centering
- Line 60: Replace `min-h-screen flex items-center justify-center` with `pt-20 md:pt-28 pb-10 md:pb-14`
- This removes forced full-viewport height and uses compact padding instead

### 2. Tighten spacing throughout
| Element | Current | New |
|---------|---------|-----|
| Static badge margin | `mb-4` | `mb-2` |
| Eyebrow margin | `mb-8` | `mb-4` |
| Headline font clamp | `clamp(64px, 9vw, 120px)` | `clamp(44px, 7vw, 88px)` |
| Headline margin | `mb-6` | `mb-3` |
| Subtitle margin | `mb-8` | `mb-4` |
| Search bar margin | `mb-5` | `mb-3` |
| Chips section margin | `mb-8` | `mb-4` |

### 3. Compact search bar
- Reduce input padding: `py-4` → `py-3`

These reductions should bring the total hero height to roughly 700-720px, fitting badge through stats comfortably in a 770px viewport (minus navbar).

## File to modify
- `src/components/sections/HeroSection.tsx`

