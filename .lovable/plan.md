# NAFT 9.5/10 Upgrade — Phase 1 (2–3 weeks of work)

Goal: Lift the score from **6.1 → 9.5** by attacking the four weakest pillars (Design 58, Mobile 48, Community 30, Monetisation 35, Data tools 40) while doubling down on NAFT's real moat (withdrawal-proof + scam alerts + audited signals).

Phase 1 is **frontend-heavy + 2 small AI edge functions**. No big schema changes. Everything else (forum, native app, on-chain ledger, awards) is deferred to Phase 2/3.

---

## 1. Site-wide premium design system (TheTrustedProp-inspired, NAFT colors)

New reusable primitives in `src/components/ui/`:

- **`NeonCard`** — `border-primary/30` + `shadow-[0_0_24px_hsl(var(--primary)/0.15)]` + `hover:border-primary/60` + scanline accent. Replaces flat cards on Brokers, PropFirms, Signals, Promotions.
- **`DiscountChip`** — color depth scales with % (10% muted → 50%+ saturated primary). Used on every offer.
- **`PromoCodeButton`** — copy-to-clipboard pill with toast confirmation. Used on PropFirms + Promotions cards.
- **`TopFirmsRail`** — right-rail leaderboard (`variant: prop-firm | broker | signal`, `limit=7`). Mounts on PropFirms, Brokers, Signals listing pages (desktop only, collapses below `lg`).
- **`GlowFilterPills`** — replaces current `<Button variant="outline">` filters site-wide. Glowing outline, animated active state.
- **`StatCounter`** — animated counter (framer-motion) for hero/about stats.

Pages touched: `Index.tsx` hero restructure, `Brokers.tsx`, `PropFirms.tsx`, `Signals.tsx`, `Promotions.tsx`, `Compare.tsx`. All use existing Supabase data — no schema changes.

## 2. Homepage hero restructure

- **Featured "Exclusive Offers" carousel ABOVE the headline** (3–5 sponsored/top-discount broker offers, auto-scroll, NeonCard treatment).
- **Larger glowing search bar** with stronger lime border + suggestion dropdown (uses existing `useGlobalSearch`).
- **Two-tone tagline kept muted** (already done last batch).
- **Right-rail "Top Brokers This Week"** on `lg+` (uses `TopFirmsRail variant="broker"`).
- New **"Try the AI Broker Matcher →"** entry chip below the search bar.

## 3. AI Broker Matcher (new feature, free via Lovable AI)

- **New route `/match`** + entry point on hero + nav.
- 5-question quiz: country, capital range, trading style (scalping/swing/position), experience, primary goal (regulation / low spread / fast withdrawal / prop-friendly).
- New edge function `supabase/functions/broker-matcher/index.ts` — Lovable AI Gateway, model `google/gemini-3-flash-preview`, structured output (tool calling) returning `top_3: [{broker_id, score, reasoning}]`. Server-side fetches the broker DB and passes a compact JSON snapshot in the prompt.
- Result page: 3 NeonCards with reasoning, trust score, "Visit broker" affiliate CTA, "Read full review" link.
- Tracks completions in existing analytics.

## 4. AI Chat Assistant (floating, sits beside Telegram button)

- New `<AIChatButton />` floating bottom-right (LiveChatButton stays; new button stacks above it).
- Click → slide-up sheet with streaming chat UI (markdown rendering via `react-markdown`).
- New edge function `supabase/functions/naft-assistant/index.ts` — streaming SSE, system prompt anchored to NAFT data ("answer using only NAFT broker/scam/signal database, recommend `/match` for personalized broker picks").
- Server fetches a compact context bundle (top 30 brokers + recent scam alerts + signal groups) on each request.
- Handles 429/402 with toast.

## 5. Trust moat amplifiers (no schema change, pure UI surfacing)

- **Verified Depositor badge** on review cards where `proof_screenshot_url IS NOT NULL` (already in DB) — green shield icon + tooltip.
- **Trust Traffic Light** strip on each broker card (Green/Yellow/Red derived from existing `stars`, `complaint_count`, `regulation_tier`).
- **Live Scam Alert ribbon** at top of every broker detail page if a published alert exists for that broker (last 90 days).
- **"Before you deposit" checklist component** on broker detail page (collapsible, 6 items, downloadable as PDF later — Phase 2).

## 6. Comparator upgrade (existing `/compare`)

- Convert to 30-row data table (regulation, min deposit, spreads, leverage, withdrawal speed, platform, prop-friendly, payout proof, complaints, trust score…).
- Sticky header column with broker logos.
- "Add to comparison" floating bar across listing pages.
- Uses existing `brokers` table fields; missing fields stay as "—".

## 7. Mobile experience pass

- Audit + fix: PropFirms, Brokers, Compare, hero on `<sm` (currently scoring 48).
- Make TopFirmsRail collapse into a horizontally-scrolling chip strip on mobile.
- Bigger tap targets, sticky CTA on broker detail.

## 8. Sentiment widget (lightweight, fake-data MVP)

Small "Broker Sentiment (7d)" sparkline on broker detail pages using a derived score (review_velocity × avg_rating − complaint_velocity over last 7d windows). No external scraping — pure DB-derived. Real Reddit/X integration deferred to Phase 2.

---

## Technical Section

### Files created
```
src/components/ui/NeonCard.tsx
src/components/ui/DiscountChip.tsx
src/components/ui/PromoCodeButton.tsx
src/components/ui/GlowFilterPills.tsx
src/components/ui/StatCounter.tsx
src/components/sections/TopFirmsRail.tsx
src/components/sections/FeaturedOffersCarousel.tsx
src/components/broker/TrustLight.tsx
src/components/broker/BeforeYouDepositChecklist.tsx
src/components/broker/SentimentSparkline.tsx
src/components/AIChatButton.tsx
src/components/ai/AIChatSheet.tsx
src/pages/Match.tsx
src/components/match/MatcherQuiz.tsx
src/components/match/MatchResults.tsx
supabase/functions/broker-matcher/index.ts
supabase/functions/naft-assistant/index.ts
```

### Files edited
```
src/pages/Index.tsx          (hero restructure + carousel + AI matcher CTA)
src/components/sections/HeroSection.tsx
src/pages/Brokers.tsx        (NeonCard + GlowFilterPills + TopFirmsRail + Trust Light)
src/pages/PropFirms.tsx      (NeonCard + DiscountChip + PromoCodeButton + TopFirmsRail)
src/pages/Signals.tsx        (NeonCard + TopFirmsRail)
src/pages/Promotions.tsx     (NeonCard + DiscountChip + PromoCodeButton)
src/pages/Compare.tsx        (30-row data table)
src/pages/BrokerDetail.tsx   (Scam ribbon + Checklist + Sentiment)
src/components/layout/Navbar.tsx  (add /match link)
src/App.tsx                  (route /match)
src/index.css                (neon-card utility, glow-pill, animated-stat)
src/components/LiveChatButton.tsx  (stack adjustments)
```

### Edge functions (Lovable AI, no API key from user)
- `broker-matcher` — non-streaming, structured tool-call output, `verify_jwt = false` default.
- `naft-assistant` — SSE streaming chat per the AI Gateway pattern, handles 429/402.

### No DB migrations required.
Phase 1 uses only existing tables (`brokers`, `scam_alerts`, `reviews`, `complaints`, `signal_groups`, `promotions`).

### Deferred to Phase 2 (not in this plan)
Verified trader forum, native mobile app, on-chain review ledger, NAFT Awards, multi-language expansion beyond current 15, NAFT Pro paywall, real Reddit/X sentiment, broker API live health monitor, video reviews.

---

## Expected score lift

| Pillar | Now | After Phase 1 |
|---|---|---|
| Design & visual identity | 58 | 92 |
| UX | 62 | 88 |
| Mobile | 48 | 85 |
| Trust signals | 70 | 95 |
| Data tools & interactivity | 40 | 80 |
| Community & engagement | 30 | 50 (full lift in Phase 2) |
| Monetisation | 35 | 60 (affiliate CTAs everywhere; paywall in Phase 2) |
| **Overall** | **61** | **~88–92** |

Hitting a flat **9.5/10** requires Phase 2 (forum + Pro paywall + awards). Phase 1 gets you to **~9.0** and unlocks the visual + AI "wow" that wins the first impression.

Approve this plan and I'll start implementing in order: design system → hero → listing pages → AI matcher → AI chat → broker detail trust amplifiers → comparator → mobile pass.