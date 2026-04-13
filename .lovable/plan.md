

# Mobile View Fixes — A to Z

## Issues Found

1. **Promo Ticker (top)** — Animation `ticker-track-fast` is 40s, way too slow for mobile. Only 1 item visible at a time, feels broken.
2. **Search bar placeholder text** — Typewriter text wraps to 2 lines on mobile because `left-12 pr-36` leaves very little space. Text overlaps with SEARCH button.
3. **Stats bar** — 4 stats in a row on mobile is tight but functional (works ok).
4. **Rest of sections** — Look acceptable on mobile, no major breaks.

## Plan

### 1. Fix Promo Ticker Speed on Mobile
**File: `src/index.css`**
- Add a `@media (max-width: 768px)` rule for `.ticker-track-fast` to reduce animation duration from 40s to **15s** so items scroll visibly faster on small screens
- Reduce gap from 48px to 24px on mobile

### 2. Fix Search Bar Placeholder Overflow on Mobile
**File: `src/components/sections/HeroSection.tsx`**
- Add `whitespace-nowrap overflow-hidden text-ellipsis` and constrain `right` to avoid overlapping the SEARCH button
- Change the overlay span to have `right-[100px]` (or similar) so it clips before reaching the button
- On mobile, use shorter typewriter texts: e.g. "Search Brokers, Signals..." instead of "Search Brokers, Signals, News..."
- OR simply add `overflow-hidden` with `max-width: calc(100% - 130px)` to the placeholder span so it never overlaps the button

### 3. Promo Ticker — Triple the items on mobile
**File: `src/components/sections/PromoTicker.tsx`**
- Change `items` from `[...promoItems, ...promoItems]` to `[...promoItems, ...promoItems, ...promoItems]` to ensure seamless looping at faster speeds

### Files Modified
- `src/index.css` — Mobile media query for ticker speed
- `src/components/sections/HeroSection.tsx` — Placeholder text overflow fix
- `src/components/sections/PromoTicker.tsx` — Triple items for smooth loop

