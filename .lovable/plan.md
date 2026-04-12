

# Add NAFT Logo Across the Website

## Logo Selection Strategy

Based on your preferences, I'll use **two logos**:
- **Candlestick "N" logo** — primary brand mark for Navbar, Footer, and Favicon (theme-aware: lime for dark, green for light, red for sentinel)
- **Broadcast logo** — as a decorative accent in the Hero section or loading screen

## Logo Variants by Theme
| Theme | Logo File |
|-------|-----------|
| Dark (default) | `naft-candlestick-dark-lime.svg` |
| Light | `naft-candlestick-light-green.svg` |
| Sentinel | `naft-candlestick-dark-red.svg` |

## Implementation

### 1. Copy logo files to project
Copy all 4 SVGs to `public/images/`:
- `naft-candlestick-dark-lime.svg`
- `naft-candlestick-light-green.svg`
- `naft-candlestick-dark-red.svg`
- `naft-broadcast.svg`

### 2. Navbar logo (primary placement)
Replace the text-only brand in `Navbar.tsx` with a compact logo image (32x32) next to the text. Use `useTheme()` to swap the SVG source based on active theme.

### 3. Footer logo
Same approach in `Footer.tsx` — add the theme-aware candlestick logo beside the brand name.

### 4. Favicon
Copy `naft-candlestick-dark-lime.svg` as `/public/favicon.svg` and update `index.html` to reference it. Remove old favicon.ico if present.

### 5. Hero section accent
Add the broadcast logo as a subtle background or decorative element in `HeroSection.tsx`.

### Files to modify
- `public/images/` — 4 new SVG files
- `public/favicon.svg` — new favicon
- `index.html` — favicon reference
- `src/components/layout/Navbar.tsx` — add logo image
- `src/components/layout/Footer.tsx` — add logo image
- `src/components/sections/HeroSection.tsx` — broadcast accent (optional)

