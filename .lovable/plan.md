

## Goal
Full A-to-Z audit of the platform — check every feature, page, admin panel, and integration to identify what's working and what's broken. Then deliver a clear status report.

## Approach
Read-only investigation across all major areas:

### 1. Database & Data Health
- Query row counts for every table: `brokers`, `signal_groups`, `betting_sites`, `promotions`, `sports_predictions`, `news_articles`, `forecasts`, `calendar_events`, `scam_alerts`, `reviews`, `complaints`, `courses`, `education_articles`, `profiles`, `user_roles`, `notifications`, `referral_codes`, `applications`, `approval_queue`, `tier_upgrades`, `profile_claims`, `betting_profiles`, `broker_profiles`, `signal_profiles`
- Check `site_settings` keys (navbar, promo_ticker, ticker_pairs, etc.)
- Verify storage buckets exist and have files (logos, media, avatars)

### 2. Frontend Pages — Data Source Audit
For each public page, verify whether it reads from DB or uses static fallbacks:
- `/` (Index) — homepage sections
- `/brokers`, `/prop-firms`, `/brokers/:slug` — brokers data
- `/signals`, `/signals/:id` — signal_groups
- `/sports` — sports_predictions + betting_sites
- `/promotions`, `/promotions/:id` — promotions
- `/news`, `/calendar`, `/forecasts` — respective tables
- `/scam-alerts`, `/scam-alerts/:id` — scam_alerts
- `/education`, `/education/:slug` — courses + education_articles
- `/compare`, `/ideas`, `/profile/:username`

### 3. Auth & User Dashboard
- Signup/Login/ForgotPassword/ResetPassword flows
- `/dashboard` Overview, MyReviews, MyComplaints, Watchlist, Referrals, ProfileSettings
- Profile avatar upload, navbar dropdown sync

### 4. Admin Panels — CRUD Status
For every admin page check: load data, create, edit, delete, image upload, status toggle:
- BrokersAdmin, SignalsAdmin, BettingSitesAdmin, PromotionsAdmin
- NewsAdmin, ForecastsAdmin, CalendarAdmin, ScamAlertsAdmin
- ReviewsAdmin, ComplaintsAdmin, CoursesAdmin, EducationAdmin
- UsersAdmin, ApplicationsAdmin, ApprovalQueueAdmin, BrokerClaimsAdmin
- TierUpgradesAdmin, SubmissionsAdmin, AuditLog, ReferralAnalyticsAdmin
- SiteSettingsAdmin, SiteContentAdmin, SectionEditor, SportsAdmin, TradingIdeasAdmin
- Per-role dashboards: BrokerDashboard, SignalDashboard, BettingDashboard, SportsDashboard, UserDashboard, ModeratorDashboard

### 5. Cross-cutting Features
- i18n (15 languages) — check translation coverage
- Theme switching (Dark/Light/Sentinel)
- Global search (⌘K)
- Notifications real-time
- Referral tracking
- Cookie consent
- SEO + JSON-LD
- Live chat button
- Mobile responsiveness

### 6. Security & Storage
- RLS policy gaps
- Storage bucket policies
- Edge function (`admin-users`) status
- Linter warnings

## Deliverable Format
A categorized report with three columns per item:
- ✅ **Working** — feature fully functional with DB-backed data
- ⚠️ **Partial** — works but has gaps (e.g., uses static fallback, missing fields, no realtime)
- ❌ **Broken** — non-functional, missing data, RLS blocked, or stub

Grouped by:
1. Public Pages (15 routes)
2. Auth & User Dashboard (8 areas)
3. Admin Panels (~25 panels)
4. Backend/Infra (DB, Storage, RLS, Edge functions)
5. Cross-cutting (i18n, themes, search, notifications, SEO)

Plus a **Top Priority Fix List** at the end ranked by user impact.

## Files to Read (no edits)
- All public page sources to confirm DB vs static reads
- All admin page sources to confirm CRUD wiring
- Run `psql` count queries on every table
- Storage bucket file lists
- `supabase--linter` for warnings

## Out of Scope
- Any code fixes (this is audit only)
- Performance profiling
- Browser-based functional testing (would require interactive runs)
- Mobile device testing

After audit completes, you'll get one clean report — then we can pick what to fix next together.

