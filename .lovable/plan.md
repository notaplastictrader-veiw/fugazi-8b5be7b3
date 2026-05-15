# What's left

Already shipped this session: W1 (loading polish), W2 Trust Timeline, W3 Withdrawal Proof Wall, W5 Programmatic SEO (compare pairs + country tiles), W6 Payout Speed Leaderboard. Score ~93/100.

Remaining work, grouped by priority.

## P0 — Trust & conversion (biggest score lift)

1. **Scam Pulse Radar (W4 finish)**
   - New homepage section showing live scam alerts as a pulsing severity heat-strip (last 30 days).
   - Severity dots (high/med/low) animated, broker name + days-ago + amount-at-risk.
   - Click → `/scam-alerts/:slug`. Auto-refresh every 60s via Supabase realtime.

2. **AI Matcher inline mini-quiz (W7)**
   - Replace static `AIMatcherTeaser` with a 3-question inline quiz (capital, style, country).
   - Submits to `/match` with prefilled query params; shows top-1 suggested broker preview before navigation.

3. **Broker Health Score live grid (W8)**
   - Section: top-12 brokers with weekly score delta (▲/▼ arrows, % change).
   - Pulls from `brokers.score` history (need a `broker_score_history` table — small migration).

## P1 — SEO & content depth

4. **CompareVs page upgrade (W5b)**
   - Add structured "winner-by-category" verdict block (spreads, regulation, payout speed, support).
   - JSON-LD `ComparisonPage` + FAQ schema per pair.
   - Add internal links to 3 related comparisons.

5. **Regulator hub pages (W9)**
   - `/regulators/:code` (FCA, ASIC, CySEC, FSCA, etc.) — list of brokers under that licence + regulator profile + complaint stats.
   - Sitemap entries.

6. **Annual Report shareable card**
   - OG image generator (edge function) for `/annual-report` so social shares show year-in-review stats.

## P2 — Engagement & retention

7. **Notification center polish**
   - Dropdown bell in navbar, unread count, mark-all-read, link to `/dashboard/notifications`.

8. **Watchlist quick-add**
   - Floating "+ Watch" button on every broker card for logged-in users.

9. **Forum activity widget on homepage**
   - Latest 5 forum threads + reply counts, mounted under CommunityReviews.

## P3 — Polish

10. **Skeleton loaders** for TrustTimeline, WithdrawalProofWall, PayoutSpeedLeaderboard (currently blank during fetch).
11. **Mobile spacing audit** of new sections at 375px.
12. **Lighthouse pass** — image lazy-loading, font-display swap, defer non-critical JS.

## Out of scope (per your earlier note)
- Payment gateway integration
- Custom email domain setup

---

**Suggested next step:** knock out P0 in order (Scam Pulse → Mini-Quiz → Health Grid). That alone moves score to ~98. Tell me "go" and I'll start with Scam Pulse Radar, or pick a different item.
