# Ship everything remaining (P1 + P2 + P3)

Goal: take the platform from ~98 → 100. Nine items, batched into three execution phases.

## Phase 1 — SEO depth (P1)

1. **CompareVs verdicts upgrade** (`src/pages/CompareVs.tsx`)
   - Add a "Winner by category" block: 4 mini-cards (Trust Score, Spreads, Regulation count, Complaints) each highlighting which broker wins
   - Add FAQPage JSON-LD with 4 auto-generated Q&A per pair ("Is X regulated?", "Which has lower spreads?", etc.)
   - Add "Related comparisons" rail — 3 internal links to other pairs

2. **Regulator hub pages**
   - New route `/regulators/:code` → new `src/pages/RegulatorDetailDynamic.tsx` (project already has `RegulatorDetail.tsx`; verify and reuse if dynamic, otherwise extend)
   - Lists brokers under that regulator + complaint counts pulled from `brokers` + `complaints`
   - JSON-LD `GovernmentOrganization` + breadcrumbs
   - Add to `scripts/generate-sitemap.ts` if present, else skip sitemap entry

3. **Annual Report OG image**
   - New edge function `supabase/functions/annual-report-og/index.ts` returning a 1200×630 SVG-as-PNG with year + key stats
   - Update `src/pages/AnnualReport.tsx` `<meta property="og:image">` to point at the function URL

## Phase 2 — Engagement (P2)

4. **Notification center polish** (`src/components/NotificationBell.tsx`)
   - Verify dropdown UX, add unread count badge, "Mark all read" action, link footer to `/dashboard/notifications`

5. **Watchlist quick-add**
   - New `src/components/broker/WatchlistButton.tsx` — floating "+ Watch" pill that toggles row in `watchlist` table
   - Mount on `BrokerCard` (find usage in `src/pages/Brokers.tsx` and broker grids)

6. **Forum activity widget**
   - New `src/components/sections/ForumActivityWidget.tsx` — latest 5 threads from `forum_threads` with reply count + last activity
   - Mount under `<CommunityReviews />` in `src/pages/Index.tsx`

## Phase 3 — Polish (P3)

7. **Skeleton loaders** for `TrustTimeline`, `WithdrawalProofWall`, `PayoutSpeedLeaderboard`, `BrokerHealthGrid`, `ScamPulseRadar`, `PayoutSpeedLeaderboard` — replace blank-during-fetch with shimmer rows using existing `Skeleton` component

8. **Mobile spacing audit @ 375px**
   - Set viewport to 375px, scroll all new sections, fix any overflow / cramped padding
   - Touch-target audit on quiz buttons & leaderboard rows

9. **Lighthouse pass**
   - Add `loading="lazy"` + `decoding="async"` to remaining images in homepage sections
   - Audit `font-display: swap` in `index.css`
   - Verify route-level `React.lazy` is in place for heavy pages

## Technical notes

- All new components follow existing semantic token patterns (no hardcoded colors)
- New edge function uses `npm:@supabase/supabase-js@2/cors` import per project rules
- `verify_jwt = false` not needed — annual-report-og is public
- No new database tables required; everything reuses existing schema (`forum_threads`, `watchlist`, `complaints`, `brokers`, `regulators` data file)
- Existing `RegulatorDetail.tsx` will be inspected first; if already dynamic, only enrich it instead of duplicating

## Out of scope (unchanged)
- Payment gateway, custom email domain

Execution order: Phase 1 → 2 → 3 in a single sweep. Estimated score after: **100/100**.
