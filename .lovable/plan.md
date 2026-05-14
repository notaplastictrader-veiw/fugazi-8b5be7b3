
# NAFT — Unified 95/100 Master Plan (Plan 1 + Plan 2 merge)

> দুটো plan-এর সেরা অংশগুলো এক করা হলো। Plan 1-এর strategic positioning + monetization spine, Plan 2-এর technical audit + sequencing + 2050-proof moat।

---

## ০. POSITIONING (Plan 1 থেকে — অপরিবর্তিত spine)

NAFT = **"Trader Protection Infrastructure"** (broker review site নয়)।  
Target persona: **Bloomberg + Trustpilot + TradingView + Reddit** for retail traders।  
প্রতিটি ফিচার অবশ্যই এই **৫ Pillar**-এর একটিকে শক্তিশালী করবে — না করলে build করব না:

| Pillar | উদ্দেশ্য | বরাদ্দ |
|---|---|---:|
| Trust | scam expose, verified reality | 25% |
| Intelligence | decision-helping AI/data | 25% |
| Community | retention + UGC | 25% |
| Utility | calculators, compare, AI tools | 12.5% |
| Data Moat | proprietary broker behaviour history | 12.5% |

---

## ১. SCORE লক্ষ্য

| Area | Now | Target |
|---|---:|---:|
| UX | 7.0 | 9.5 |
| Mobile | 5.5 | 9.5 |
| Trust | 7.5 | 9.8 |
| SEO | 6.5 | 9.7 |
| Monetisation | 6.0 | 9.5 |
| Community | 7.0 | 9.3 |
| Product Vision | 8.5 | 9.9 |
| **Overall** | **64** | **95** |

---

## ২. ৮-Wave রোডম্যাপ (Plan 1 phases + Plan 2 emergency layer)

```text
W0 (5d)  Emergency      64 → 68
W1 (2w)  Hero/IA/Mobile 68 → 75
W2 (3w)  Broker Trust   75 → 81
W3 (4w)  Trust Moat     81 → 85
W4 (3w)  AI Layer       85 → 88
W5 (6w)  SEO + i18n     88 → 91
W6 (4w)  Monetization   91 → 94
W7 (∞)   2050-Proof     94 → 95+
```

---

### WAVE 0 — Emergency Fixes (5 দিন) → +4

1. **Typo:** "NAPT" → "NAFT" সর্বত্র (BrokerDetail disclaimer, footer ছিলো)।
2. **Fake content off:** CommunityReviews fallback Unsplash faces, Signals "Gold Pulse" dummy, Brokers/Pros/Cons/Platforms hardcoded — DB খালি হলে section hide।
3. **Footer hardcoded broker links** dynamic top-3 prop থেকে pull।
4. **Hero stat** "Active traders" → "Registered members" honest label।
5. **noindex** `/auth/callback`, `/dashboard/*`, `/admin/*`, `/portal/*`।
6. **/brokers skeleton** MainLayout-এর ভেতরে wrap (navbar-less flash বন্ধ)।
7. **body::before** fullscreen candlestick SVG শুধু hero route-এ।

---

### WAVE 1 — Hero, IA, Mobile (২ সপ্তাহ) → +7

**Homepage Hero rebuild (Plan 1 formula):**
- LEFT: Headline = "Find Brokers You Can Actually Trust." / Sub = "Reviews, scam alerts, withdrawal proof, AI matching — built by traders, not marketers." / Primary CTA "Find My Broker →" / Secondary "Browse Trusted Brokers"।
- RIGHT: **Live Trust Panel** — latest scam alert, verified withdrawal today, community trust pulse, top trusted broker। (Supabase realtime)
- বাদ: rotating eyebrow + grunge headline duplication + 4 trust chips + rotating chip groups + 4-stat strip। সব নিচের section-এ সরাও।

**Homepage section কাটছাঁট:** ১৫ → ৭ section. Order: Hero → Live Trust Panel → BrokerTrustHub → AIMatcherTeaser → ScamAlerts → CommunityReviews → HowItWorks।

**Top nav simplify:**
- Primary (always visible): **Broker Reviews · Prop Firms · Scam Alerts · Compare · AI Match**
- More dropdown grouped: Tools (Calculator, Glossary, Calendar) | Community (Forum, Ideas, Awards) | Resources (News, Education, Promotions) | Company

**Mobile rebuild:**
- Bottom nav: **Home · Brokers · Match (FAB) · Scam · Account**
- TickerBar mobile-এ disable; PromoTicker dismissable। Top chrome 92→64px scroll-shrink।
- Mobile golden rule: প্রতি স্ক্রিনে "What do I do next?"-এর উত্তর ২ সেকেন্ডে স্পষ্ট।

---

### WAVE 2 — Broker Pages = Trust Dashboards (৩ সপ্তাহ) → +6

আমার আগের ৫-step broker detail plan + Plan 1-এর "Trust Dashboard" framing:

1. **Header dedup:** একটাই Trust Score scale (/100), badge merge, prop vs broker stat split (DB কলাম: `account_size`, `profit_split`, `payout_time`, `challenge_fee`)।
2. **TOC + Sticky CTA bar** (Overview · Regulation · Conditions · Reviews · Complaints · Compare)।
3. **Honest fallback:** Platforms/Payments/Pros/Cons render-only-if-data; placeholder বন্ধ।
4. **Peer Comparison Rail** + DB-driven FAQ (FAQPage schema)।
5. **NAFT Trust Timeline™** (Plan 1's moat): complaints timeline, payout timeline, spread changes, regulation changes, sentiment graph — proprietary data view।
6. **Schemas:** Product, Offer, AggregateRating, FAQPage, BreadcrumbList; per-route og-image edge function।

---

### WAVE 3 — Trust Infrastructure Moat (৪ সপ্তাহ) → +4

1. **Live Trust Activity Ticker** (homepage + global mini-bar): "✔ Verified: FTMO • 1h ago / ⚠ Complaint: ABC • 3h ago / 📝 Review: Pepperstone • 5h ago" — Supabase realtime।
2. **Verified Withdrawal Proof Gallery** — user uploads screenshot/PDF/MT5 proof → admin verify badge → public gallery। **এটাই platform-এর সবচেয়ে valuable dataset**।
3. **Open Methodology page** — scoring weight publicly auditable, monthly recalc log, "brokers cannot pay to change score" claim পেছনে proof।
4. **Entity Graph** — same legal owner, multiple brand visualisation।
5. **Affiliate disclosure** FTC-grade সব affiliate link পাশে।

---

### WAVE 4 — AI Layer (৩ সপ্তাহ) → +3

1. **AI Broker Matcher v2:** country, budget, style, leverage, scalp/swing, asset → top 3 + reasoning + comparison + affiliate CTA + downloadable PDF "Trust Audit" (email-gated lead magnet)।
2. **Ask NAFT v2:** **DB-only RAG** (broker, review, complaint, scam) — হ্যালুসিনেশন zero, source citation।
3. **NAFT Sentinel agent** (edge function, daily cron): broker website + regulator register + reddit/telegram scrape → auto-draft alert → moderation queue।
4. **Personalised home** (logged-in): watchlist alerts + recommended brokers + follow-feed।

---

### WAVE 5 — SEO + i18n explosion (৬ সপ্তাহ) → +3

1. **Programmatic SEO** (Plan 1's huge lever):
   - `{broker} vs {peer}` (auto, all pairs)
   - `{country} best brokers` (60+ countries)
   - `Is {broker} safe/legit/regulated?` (per broker)
   - `{broker} review {year}`
   - Glossary topical authority: slippage, margin call, drawdown, ECN, liquidity provider — depth article each।
2. **hreflang fix:** `?lang=` → proper `/{locale}/...` paths; 15-language correct alternates।
3. **AI translation pipeline** (Lovable AI gemini-flash) on-publish for broker desc, review, news।
4. **Sitemaps split:** broker, scam, news, image, hreflang separate XML।
5. **Meta descriptions** per-route unique (currently many fallback)।
6. **RSS/Atom** (news, forum, ideas)।

---

### WAVE 6 — Monetization Stack (৪ সপ্তাহ) → +3

| Stream | Type | Notes |
|---|---|---|
| Affiliate (CPL/CPA) | exists | improve tracking + cohort analytics |
| **NAFT Pro** subscription ($9–29/mo) | NEW | advanced compare, hidden risk alerts, AI reports, ad-free |
| **Verified by NAFT badge** (broker embed) | NEW | recurring SaaS — brokers pay monthly to embed widget |
| Broker Premium Tier (claimed) | NEW | priority placement, video embed, response-SLA badge, ad-budget |
| **API + MCP server** | NEW | trust scores, scam alerts → fintech/CRM B2B; Free/Pro/Enterprise |
| Lead-gen auction | NEW | matched user (anonymized) → brokers bid per qualified click |
| Annual Report Pro PDF | NEW | institutional paywall |
| Course/eBook store | exists (CoursesAdmin) | activate Stripe checkout |
| Awards naming rights | NEW | annual sponsorship pack |
| **Strict rule:** never allow paid score manipulation — destroys moat |

---

### WAVE 7 — 2050-Proof Moat (চলমান) → 95+

- **Broker Health Score™** real-time (payout delays, complaints, regulation changes, spread anomalies) — credit-score for brokers।
- **On-chain Trust Ledger:** review hash anchored publicly → "reviews cannot be secretly edited" verifiable claim। 25-বছর-proof।
- **ZK-Withdrawal Proof:** privacy-preserving evidence।
- **Voice/Multi-modal "Talk to NAFT"** — voice + image (deposit screenshot upload → instant risk verdict)।
- **Live broker latency world-map**, **embedded paper-trading sandbox**, **auto TTS podcast** weekly digest।
- **Trader Reputation Token** (off-chain, optional on-chain mirror)।
- **Regulator Sync Engine** (FCA/ASIC/CySEC API cron)।
- **Video media layer** (daily market recap)।

---

## ৩. কেন এই unified plan Plan 1 বা Plan 2 আলাদাভাবে চেয়ে ভালো

| বৈশিষ্ট্য | Plan 1 | Plan 2 | **Unified (এটা)** |
|---|:-:|:-:|:-:|
| Strategic positioning (5 pillar) | ✅ | ❌ | ✅ |
| Concrete technical audit | ❌ | ✅ | ✅ |
| Wave 0 emergency fixes | partial | ✅ | ✅ |
| Monetization stack | ✅ | partial | ✅ |
| 2050-future moat (ZK, on-chain) | partial | ✅ | ✅ |
| Programmatic SEO | ✅ | partial | ✅ |
| NAFT Trust Timeline™ | ✅ | ❌ | ✅ |
| Verified Withdrawal Proof gallery | ✅ | partial | ✅ |
| RAG-only Ask AI | ✅ | ✅ | ✅ |
| Cumulative score path | অস্পষ্ট | partial | ✅ (per-wave) |

**Verdict:** Plan 1 vision দিচ্ছে, Plan 2 execution দিচ্ছে — Unified plan দুটোই দিচ্ছে এবং স্পষ্ট 64 → 95 path।

---

## ৪. Acceptance criteria (95-পয়েন্ট = "shipped" কখন বলব)

- Mobile Lighthouse (Brokers, /, /brokers/ftmo) — Performance ≥ 90, A11y ≥ 95, SEO = 100।
- Live Trust Ticker realtime update দেখাচ্ছে।
- প্রতি broker page-এ Trust Timeline + ≥1 verified withdrawal proof।
- 60+ programmatic SEO পেজ Google-এ indexed (Search Console verified)।
- ≥1 paying NAFT Pro subscriber, ≥1 broker embedded "Verified by NAFT" widget।
- Ask NAFT-এ source citation 100%, hallucination tested 0/50 prompts।
- 8 ভাষায় translated broker description live।

---

## ৫. কোথা থেকে শুরু — সিদ্ধান্ত চাই

আমি Wave 0 এখনই শুরু করতে পারি (৫ দিন, ৭টা concrete fix)। তারপর সরাসরি Wave 1 (Hero rebuild + Mobile bottom nav + nav simplify)। এই দুটোই combined ~১১ পয়েন্ট তুলবে — ৩ সপ্তাহে 64 → 75।

**Approve পেলে Wave 0 আজই শুরু করি — এক বার্তায় ৭টা fix ship।**
