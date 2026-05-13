## Phases 7 → 10 — "Ace" Sprint Plan

The roadmap doc only defines phases 2–6. Phases 4 (affiliate + paywall) was deferred and several items from the original Phase 5/6 (community depth, awards, AI matcher, digests, perf) are still open. I'm packaging the remaining high-impact work into four focused phases. Each phase is self-contained — you can stop after any one.

---

### PHASE 7 — Community Depth & Verified Profiles v2

Make NAFT a place users return to daily.

- **Public Trader Profile v2** (`/profile/:username`)
  - Pinned reviews, journal stats (win rate, total trades, best pair) — opt-in
  - Badge showcase + reputation tier prominent
  - Follower system (`profile_follows` table) with follower count
- **Forum upgrades**
  - Pin/lock controls for mods, "Best answer" marking by thread author
  - Trending threads widget on `/forum`
- **Trader of the Month** rail on homepage (top reputation, last 30d)
- **Reputation v2:** add weight for forum helpfulness votes, decay inactive scores

Tables: `profile_follows`, `forum_thread_best_answer` (column).

---

### PHASE 8 — AI Matcher v2 + Saved Searches + Digests

Retention loop powered by personalisation.

- **Matcher v2:** smarter quiz scoring (deposit/leverage/regulator weighted), result diversity, "why this broker?" explanation per match
- **Saved Matches:** logged-in users save a match set, get notified when a new broker enters their criteria
- **Saved Searches:** save filtered broker/scam-alert queries
- **Weekly Digest** (edge function, cron): top brokers, new scam alerts, signal performance, personalised matches → email via Resend (will need RESEND_API_KEY) or in-app notification only as fallback
- **Notification preferences** page in dashboard settings

Tables: `saved_matches`, `saved_searches`, `notification_preferences`.

---

### PHASE 9 — Awards Engine + Annual Report

Authority play.

- **Awards 2026 cycle:** open nominations, voting windows, results page
- **Category management** in admin (already have `awards` admin — extend with cycle/window controls)
- **Voting integrity:** 1 vote per user per category, captcha on submit
- **Results page:** winner showcase, permanent badge on broker cards
- **"State of Brokers" annual report** generator: edge function builds a public report page from aggregate scores → static `/reports/2026` page

Tables: extend `award_cycles`, add `voting_windows` if missing.

---

### PHASE 10 — Performance, SEO Polish & Reliability

Ship-ready hardening.

- **Image pipeline:** swap remaining `<img>` for lazy-loaded responsive variants, add `loading="lazy"` audit, generate WebP for hero/broker logos
- **Lighthouse pass:** code-split heavy admin chunks, defer analytics, preconnect critical origins
- **JSON-LD audit:** Organization, BreadcrumbList everywhere, Product/Review on broker pages, FAQPage on glossary
- **Sitemap regen** trigger on broker/scam publish
- **Sentry-style error capture** lite: edge function `log-client-error` + global error boundary reporting
- **Rate limiting** on public edge functions (`naft-assistant`, `broker-matcher`) using IP hash + Postgres counter

Tables: `client_error_log`, `edge_rate_limits`.

---

### What I will NOT touch (still deferred per your earlier call)

- Stripe paywall + paid signal subscriptions (Phase 4.2 / 4.5)
- Affiliate link tracking system (Phase 4.1)
- Education paid courses with payment

These stay parked until you say "go monetisation."

---

### Order of execution

I'll build Phase 7 → 8 → 9 → 10 in sequence, one migration set per phase, each shipped with admin controls where relevant. After each phase I'll pause briefly so you can sanity-check before the next one starts.

Confirm and I'll start with Phase 7.