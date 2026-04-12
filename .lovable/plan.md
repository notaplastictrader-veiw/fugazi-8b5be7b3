

# Hero Section — Match Reference Spacing, Enhance Search Bar

## Problem
Current hero section has too much vertical space between elements, pushing chips and stats below the fold. Search bar isn't prominent enough. Need to match the reference image layout exactly.

## Changes in `src/components/sections/HeroSection.tsx`

### 1. Reduce section padding
- `pt-14 md:pt-20` → `pt-10 md:pt-14` — less empty space above badge

### 2. Tighten all vertical margins to match reference
| Element | Current | New |
|---------|---------|-----|
| Badge margin | `mb-2` | `mb-1.5` |
| Eyebrow margin | `mb-4` | `mb-3` |
| Headline margin | `mb-2` | `mb-2` (keep) |
| Subtitle margin | `mb-4` | `mb-3` |
| Search bar margin | `mb-3` | `mb-2.5` |
| Chips margin | `mb-4` | `mb-3` |
| Section bottom padding | `pb-10 md:pb-14` | `pb-8 md:pb-10` |

### 3. Make search bar more visible
- Add a stronger border: `border border-border/60` on the search container
- Slightly increase input padding: `py-3` → `py-3.5`
- Add subtle background: `bg-card/50` to make it stand out from the dark background
- Make the search icon slightly brighter

### 4. Keep chips style as-is
The rotating Top Brokers / Top Prop Firms / Top Crypto chips with their current styling remain unchanged — only spacing around them tightens.

## File to modify
- `src/components/sections/HeroSection.tsx`

