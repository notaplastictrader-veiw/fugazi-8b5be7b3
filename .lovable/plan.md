## Changes Plan

### 1. Nav>more>Ideas>change to Share Ideas and then Move Price Ticker to Bottom (Fixed)

- **TickerBar**: Change from top fixed position to `fixed bottom-0` — visible immediately when site opens, stays at same place on scroll
- **MainLayout**: Remove TickerBar from the top fixed stack. Add it as a fixed bottom element. Reduce padding-top from 124px to 92px (34px promo + 58px nav)
- Keep the scrolling animation (ticker-track CSS)

### 2. Update Eyebrow Taglines

Replace current eyebrow items with the requested ones:

- "World's Most Trusted review platform" (highlight: "Most Trusted", gold)
- "Built for real traders, not plastic ones" (highlight: "plastic ones", lime)
- "Not your typical 'Lambo trader' platform" (highlight: "Lambo trader", red)

### 3. Theme Toggle Fix — Double Check

- The toggle works (verified: Dark → Light → Dasara cycles correctly)
- No fix needed — all 3 themes function properly

### 4. Signal Channel — Side by Side Cards

- Change `SignalChannel` right column from `space-y-4` (stacked vertically) to a 2-column grid layout
- Free and Premium cards displayed side by side on desktop, stacked on mobile

### 5. Community Reviews — Right-to-Left Horizontal Scroll

- Add `ticker-track-slow` CSS class (currently missing — bug fix)
- Direction: right-to-left continuous horizontal scroll (like a marquee)
- Add more reviews mixing good and bad
- Add photo URLs to review data and display circular avatar images instead of initials

### 6. Broker Join Section — Highlight Contact Us

- "Featured + Verified" tier: Make the "Contact Us →" button highlighted with accent background (primary CTA style)
- Middle tier ("Verified Partner"): Keep it simple/ghost style
- Both "Contact Us" buttons get more visual emphasis

### 7. Footer Social Icons — Real SVG Icons

- Replace text labels (𝕏, in, ▶, tg, fb, ig, tk) with proper Lucide icons or branded SVG icons with correct brand colors
- Use: Twitter/X icon, Linkedin, Youtube, Send (Telegram), Facebook, Instagram, Music (TikTok) from lucide-react
- Add "Contact Us" link highlighted in accent color in the Company column

### Files to Edit


| File                                            | Changes                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/index.css`                                 | Add `ticker-track-slow` class with reverse scroll, add bottom ticker padding |
| `src/components/layout/MainLayout.tsx`          | Move TickerBar to bottom fixed, adjust padding                               |
| `src/components/sections/HeroSection.tsx`       | Update eyebrow taglines                                                      |
| `src/components/sections/SignalChannel.tsx`     | Side-by-side cards layout                                                    |
| `src/components/sections/CommunityReviews.tsx`  | Right-to-left ticker scroll, add photos                                      |
| `src/data/reviews.ts`                           | Add photo URLs, add more mixed reviews                                       |
| `src/components/sections/BrokerJoinSection.tsx` | Highlight Contact Us buttons                                                 |
| `src/components/layout/Footer.tsx`              | Real social icons with colors, highlight Contact link                        |
