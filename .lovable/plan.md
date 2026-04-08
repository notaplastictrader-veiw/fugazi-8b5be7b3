

## Not A Plastic Trader — Phase 1 Build Plan

Build the complete homepage with all 13 sections from your HTML template, plus the futuristic dark design system.

### Step 1: Design System Setup

**Files**: `index.html`, `src/index.css`, `tailwind.config.ts`

- Add Google Fonts: Outfit (body) + Space Mono (data/numbers)
- Set dark theme as default with custom CSS variables:
  - Background: deep navy `#04070f`
  - Mint accent: `#4af4c8`
  - Gold accent: `#f0c040`
  - Red/danger: `#ff4757`
  - Card backgrounds: `rgba(255,255,255,0.03)` glassmorphic
- Add custom Tailwind colors: `mint`, `gold`, `danger`
- Add ticker scroll animation keyframes
- Add subtle body grid overlay pattern
- Update page title and meta tags

### Step 2: Shared Data Constants

**File**: `src/data/brokers.ts`, `src/data/signals.ts`, `src/data/forecasts.ts`, `src/data/reviews.ts`

Static TypeScript data for all sections — broker cards (Exness, IC Markets, XM, Quotex, Pepperstone, FTMO), signal groups, forecasts, community reviews. This keeps components clean and makes future database migration easy.

### Step 3: Layout Components

**Files**: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/MainLayout.tsx`

- **Navbar**: Fixed top, blur backdrop, logo, full menu with dropdowns (Brokers with sub-menu, Prop Firms, Betting, Signals, Promotions, Education, More dropdown), dark/light toggle, language icon, Login dropdown (User/Broker/Admin), "Join Free" dropdown, mobile hamburger
- **Footer**: 5-column layout, social links (X, LinkedIn, YouTube, Telegram, Facebook + Instagram, TikTok), risk warning, copyright
- **MainLayout**: Wraps pages with Navbar + Footer + sticky tickers

### Step 4: All 12 Homepage Sections

Each as a separate component in `src/components/sections/`:

| # | Component | Key Details |
|---|-----------|-------------|
| 1 | `PromoTicker` | Fixed top, auto-scrolling promo strip with color-cycling background |
| 2 | `HeroSection` | Rotating eyebrow badge, big title, rotating search placeholder, broker chips, stats bar, radial glow background |
| 3 | `TickerBar` | Sticky scrolling price ticker — 8 pairs (XAUUSD, EURUSD, etc.), green/red coding, CSS animation loop |
| 4 | `BrokerTrustHub` | Filter buttons + 6 broker cards with scores, badges, ratings, review counts |
| 5 | `ScamAlertSection` | 2-column: 3 live alerts (pulsing red dots) + scam score engine with weighted progress bars |
| 6 | `SignalHub` | 3 signal group cards with win rate, RR, members, track record |
| 7 | `SignalChannel` | 2-column: Free tier + Premium ৳499/mo cards |
| 8 | `ForecastSection` | Tabbed (Forex/Gold/Crypto/Sports) forecast cards with bull/bear indicators |
| 9 | `HowItWorks` | 4-step numbered cards |
| 10 | `CommunityReviews` | Auto-scrolling review ticker, 6 review cards with avatars, stars, broker badges |
| 11 | `BrokerJoinSection` | CTA + 3 pricing tiers (Free, $199/mo, $499/mo) |
| 12 | `BottomTicker` | Fixed bottom price ticker |

### Step 5: Assemble Homepage

**File**: `src/pages/Index.tsx`, `src/App.tsx`

Wire all sections into Index.tsx wrapped in MainLayout. Dark class applied to html element by default.

### Gaps from your list that will be fixed:
- Instagram & TikTok social links added to Footer
- Mobile hamburger menu with full dropdown support
- All section tags (// TRUST HUB, // SCAM WATCH, etc.) included as styled labels

### Technical Notes
- All data starts as static TypeScript constants for speed; database integration comes in Phase 2
- Components use Tailwind + CSS variables, no external CSS frameworks
- Lucide React for all icons
- Framer Motion NOT used initially to keep bundle small; CSS animations for tickers and transitions
- Responsive: mobile-first with breakpoints at sm/md/lg/xl

