# Reality Check + 9.5/10 Push Plan

## Part 1 — What the research missed (already built ✅)

The research scored NAFT against generic competitors but didn't see what's actually shipped. Verified in code:

| Research said "missing" | Actual NAFT status |
|---|---|
| AI broker assistant / chatbot | ✅ `AIChatButton` + `naft-assistant` edge function |
| AI personalised broker matching | ✅ `/match` page + `broker-matcher` edge function with quiz |
| Verified trader community / forum | ✅ `Forum` + `ForumThread` + reactions + reports |
| Side-by-side comparator | ✅ `/compare` (up to 4 brokers) |
| Annual awards program | ✅ `Awards` + `AwardsResults` + admin |
| Multi-language support | ✅ 15 languages with RTL |
| Verified signal groups | ✅ Audited win-rates in Signals service |
| Real withdrawal proof + scam alerts | ✅ MT4/MT5 ID + photo upload, scam alert system |
| Live data (prices, news, sports) | ✅ 3 edge functions live |
| Mobile install (PWA) | ✅ `InstallAppPrompt` |

**Honest re-score:** NAFT today is closer to **78/100**, not 61. The big remaining gaps are **visibility** (trust badges hidden), **monetisation** (Pro pending), and **polish** (mobile + speed).

---

## Part 2 — 9.5/10 Push (what to actually build)

Five focused workstreams. Each maps directly to a low-scoring research category.

### Workstream A — Trust Visibility (research: trust 70 → 95)
Make the moat *visible* without inventing new infra.

- **"Verified Depositor" chip** on reviews where MT4/MT5 ID + screenshot exist (already in DB). Auto-derived; no new schema.
- **Trust Score breakdown popover** on broker cards: Regulation / Reviews / Complaints / Last Verified — pulled from existing `brokers` columns.
- **"Last verified [date]"** stamp on every broker card (column exists: `last_verified_at`).
- **Withdrawal Proof Wall** section on `BrokerDetail` listing review screenshots tagged as proof.

### Workstream B — Broker Sentiment + Health Strip (research: data tools 40 → 75)
Lite version, no external scraping.

- **Sentiment chip** per broker, computed from internal signals: avg review rating (last 90d), complaint velocity, scam alert count. Display: 🟢 Bullish / 🟡 Mixed / 🔴 Cooling. Pure SQL view.
- **Health strip** on `BrokerDetail`: Reviews (30d), Complaints (30d), Avg Rating Δ vs prior 30d, Last verified. All from existing tables.
- New DB view `broker_health_metrics` (read-only, RLS public-select).

### Workstream C — Mobile + Visual Polish (research: design 58 → 90, mobile 48 → 85)
Frontend only, no backend churn.

- Audit all top-3 routes (`/`, `/brokers`, `/brokers/:slug`) at 375px viewport — fix overflow, tap targets, sticky CTAs.
- Hero: stronger contrast badge, better headline rhythm, animated trust counter ("12,483 verified reviews · 287 brokers tested · $4.2M in withdrawal proofs").
- Broker cards: redesign to surface trust score + sentiment + last-verified chip in one glance.
- Add subtle glass-card depth + grain texture on dark theme; tighten light-theme spacing.
- Mobile bottom nav for top 4 routes.

### Workstream D — AI Discoverability (research: UX 62 → 85)
The AI tools exist but no one finds them.

- Promote **AI Broker Matcher** to a hero-adjacent CTA on `/` ("Find my broker in 60 seconds").
- Add **suggested prompts** to `AIChatSheet` ("Best broker for $500 scalping in UK", "Is XM regulated in my country?").
- New `/ask` landing page that embeds the chat full-screen + showcases sample Q&As — SEO target for "best broker for X" long-tail.
- Persistent "Ask NAFT AI" pill on `BrokerDetail` pages: "Ask anything about [Broker]".

### Workstream E — SEO + Speed (research: SEO 55 → 85, speed 45 → 85)
Technical hygiene pass.

- JSON-LD `Review`, `AggregateRating`, `Organization`, `BreadcrumbList` on broker/promo/scam-alert pages.
- Sitemap.xml generator (edge function or static at build) with all broker/promo/article slugs.
- `<link rel="preconnect">` for Supabase + image CDNs in `index.html`.
- Convert hero/broker logos to `loading="lazy"` + explicit width/height to kill CLS.
- Route-level chunk audit: ensure dashboard + admin chunks aren't pulled on public pages.
- OpenGraph image generator (edge function returning dynamic PNG per broker/article).

### Workstream F — (Deferred) Pro Paywall
You rejected Stripe last time. Still open whenever you want monetisation 35 → 80. Not in this build cycle.

---

## Order of execution

```text
Day 1   A. Trust Visibility (DB view + chips)
Day 1   B. Sentiment + Health strip
Day 2   C. Mobile + visual polish (hero, cards, bottom nav)
Day 2   D. AI discoverability (Match CTA, /ask page, prompt chips)
Day 3   E. SEO + speed (JSON-LD, sitemap, OG generator)
```

No new auth, no new Stripe, no new external APIs. Everything builds on existing tables and edge functions.

---

## What this plan does NOT include

- Pro paywall / Stripe (you rejected it — flag remains open)
- Native iOS/Android apps (Lovable is web; PWA already exists)
- On-chain reputation, voice search, spatial/VR charts, biometric login (speculative — not 25-year worthwhile in 2026)
- Sentiment scraping from Twitter/Reddit (needs paid APIs + legal review — defer)
- Video reviews (needs storage + moderation pipeline — separate phase)

---

## Open question before I build

**Workstream priority** — should I do all five (A→E) sequentially in one go, or pick the top 2 first so you can review impact before continuing? Top-2 recommendation if cherry-picking: **A (Trust Visibility) + C (Mobile + Visual Polish)** — biggest perceived-quality lift per hour of work.
