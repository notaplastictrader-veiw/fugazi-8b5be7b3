
# Phase 1 Execution Sprint — Critical Fixes Only

Scope: Implement the 10 critical items from the audit. Strategy/SEO-moat/monetisation roadmaps will be delivered as a separate document AFTER code lands, so we ship value first instead of writing essays.

## What I'll build (in this order)

### 1. `/brokers` skeleton-without-navbar fix
- Move loading skeleton INSIDE `MainLayout` (currently `Brokers.tsx` returns brokers in layout already — verify other listing pages don't return early before layout). Audit `BrokerDetail`, `Signals`, `PropFirms`, `ScamAlerts` for the same race; wrap their early returns in `<MainLayout>`.
- Impact: kills 400ms layout flash, prevents CLS penalty.

### 2. Hero CTA + Trust-count chips
- Add a primary "Find My Broker in 60s →" CTA button (links to `/match`) directly under the headline, before the search bar. Demote the existing Sparkles "AI Matcher" pill to a secondary text link.
- Add trust-count chip row under the search: `🛡 280+ Reviewed · ⚖ 14 Regulators · 💰 $2.3M Recovered · 👥 47K Verified Traders` (live from Supabase counts where possible, fallback static).
- Mobile: stack CTA full-width, chips wrap.

### 3. Hero density / above-the-fold
- Reduce hero `min-h-[85vh]` → `min-h-[72vh]`; tighten `mt-[-8px]` paddings and gap between badge/eyebrow.
- Move `FeaturedOffersCarousel` BELOW hero (currently above — pushes hero down).

### 4. Carousel scrollbar
- `FeaturedOffersCarousel`: already has `scrollbar-hide` but verify the utility exists in `index.css`; add `[&::-webkit-scrollbar]:hidden` + `scrollbar-width:none`. Add left/right arrow controls that scroll by card width.

### 5. Review + AggregateRating + BreadcrumbList JSON-LD on broker pages
- `BrokerDetail.tsx` already imports `brokerReviewSchema` + `breadcrumbSchema` — verify both are emitted with real review data; add per-review `Review` items (top 5 published reviews with author, rating, date) into the schema for richer SERP stars.

### 6. Hreflang in `SEO.tsx`
- Loop the 15 supported locales and emit `<link rel="alternate" hreflang="xx" href="...">` + `x-default`. Read locale list from `I18nContext`.

### 7. Dynamic sitemap
- Add Supabase edge function `sitemap` that queries `brokers`, `scam_alerts`, `news`, `promotions`, `education_articles`, `forum_threads` (published only) and returns XML with proper `lastmod`.
- Add `vercel.json` rewrite `/sitemap.xml → /functions/v1/sitemap` (keep static fallback at `/sitemap-static.xml`).

### 8. Mobile bottom-nav
- New `MobileBottomNav.tsx`: 5 items — Home, Brokers, Match (center, elevated), Signals, Account. Visible `<md:hidden`, fixed bottom above `TickerBar` (z-[180]).
- Add bottom padding to main on mobile to prevent overlap.

### 9. FAB consolidation
- Merge `LiveChatButton` (Telegram) + `AIChatButton` into one `FloatingActions.tsx` — single primary FAB that expands radially to 2 actions on tap. Bottom-right, above bottom-nav on mobile.

### 10. Cleanup
- Delete unused `src/App.css` (Vite default leftover).

## Files touched
- New: `src/components/layout/MobileBottomNav.tsx`, `src/components/FloatingActions.tsx`, `supabase/functions/sitemap/index.ts`
- Edited: `src/pages/Brokers.tsx`, `BrokerDetail.tsx`, `Signals.tsx`, `PropFirms.tsx`, `ScamAlerts.tsx` (layout race), `src/components/sections/HeroSection.tsx`, `FeaturedOffersCarousel.tsx`, `src/components/SEO.tsx`, `src/components/seo/JsonLd.tsx`, `src/components/layout/MainLayout.tsx`, `src/pages/Index.tsx`, `vercel.json`
- Removed: `src/components/AIChatButton.tsx`, `src/components/LiveChatButton.tsx` (replaced), `src/App.css`

## Out of scope for this sprint (delivered as written roadmap doc after)
- Homepage section reordering beyond hero/carousel swap
- Full mobile redesign of every card
- Glossary, programmatic SEO, newsletter, paywall
- Trust/monetisation infrastructure builds

## What you do in parallel
- Confirm real numbers for trust chips (or I'll use live Supabase counts + "$2.3M Recovered" as configurable site_setting).
- Confirm Telegram URL for FAB (re-use existing).

Ready to execute on approval.
