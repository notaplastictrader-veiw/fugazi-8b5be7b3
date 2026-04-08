

## Hero & Ticker Cleanup Plan

### Changes Summary

**1. Remove BottomTicker — keep only TickerBar (static, non-scrolling)**
- Delete `BottomTicker` component usage from `Index.tsx`
- Update `TickerBar` to be a static horizontal bar (no CSS animation), displaying prices in a clean row with proper spacing — similar to FXView's bottom ticker but positioned below the hero

**2. Move PromoTicker content into the eyebrow badge area**
- Remove the fixed top `PromoTicker` component from `Index.tsx`
- In `HeroSection`, replace the eyebrow badge's rotating slogans with the promo items (Exness Bonus, FTMO Off, etc.) — auto-rotating inside the badge pill
- Move `Navbar` to `top-0` since the promo ticker no longer sits above it

**3. Move the slogans elsewhere**
- Place the 3 rotating slogans ("South Asia's Most Trusted...", etc.) as a subtle line below the subtitle, or as a small rotating text above the stats bar

**4. Cleaner typography — FXView-inspired**
- Switch from Outfit to **Inter** (clean, modern, FXView-style sans-serif) for body/headings
- Keep Space Mono for data/numbers
- Clean up hero title weight and letter-spacing for a more premium feel

### Files to Edit
| File | Change |
|------|--------|
| `index.html` | Replace Outfit font with Inter |
| `tailwind.config.ts` | Update `fontFamily.sans` to Inter |
| `src/index.css` | Remove `promoColorCycle` keyframe, remove ticker-track animation from TickerBar usage |
| `src/pages/Index.tsx` | Remove `PromoTicker` and `BottomTicker` imports/usage |
| `src/components/sections/HeroSection.tsx` | Replace eyebrow slogans with promo items rotation; move slogans below subtitle; refine typography |
| `src/components/sections/TickerBar.tsx` | Make static (no animation), clean horizontal layout with even spacing |
| `src/components/layout/Navbar.tsx` | Change `top-8` to `top-0` |

