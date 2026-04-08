

# Admin Panel & Dynamic CMS — Full Plan

## Current State
- All content (brokers, signals, forecasts, reviews) is **hardcoded** in `src/data/*.ts` files
- Database is **completely empty** — no tables exist
- Auth exists (Supabase email/password + Google OAuth) but no roles/profiles
- The uploaded governance document defines a 4-tier hierarchy: Owner > Team > Approval Queue > Public

## What We Will Build

### Phase 1: Database Foundation
Create all core tables so the website reads from the database instead of hardcoded files.

**Tables to create:**
1. `user_roles` — role enum (`super_admin`, `content_ops`, `moderator`, `user`, `broker`, `signal_provider`) with `has_role()` security definer function
2. `brokers` — name, slug, type, tags, regulation, score, spread, leverage, min_deposit, stars, review_count, complaints, badge, logo_url, status (`draft`/`pending`/`published`/`rejected`), created_by
3. `signal_groups` — name, win_rate, monthly_signals, avg_rr, track_record, members, verified, status, created_by
4. `forecasts` — title, type (forex/sports), prediction, confidence, result, status, created_by
5. `reviews` — broker_id, user_id, rating, content, status, created_by
6. `complaints` — broker_id, user_id, content, proof_urls, status, created_by
7. `site_settings` — key/value store for homepage layout, promo ticker items, stats, featured brokers
8. `approval_queue` — polymorphic queue linking to any content type with status tracking, reviewer notes
9. `scam_alerts` — broker_id, severity, description, status

**RLS policies:** Super admin gets full access. Content ops/moderators can insert (as `pending`). Public users see only `published` content.

### Phase 2: Admin Panel UI

**Route:** `/admin` (protected, super_admin only)

**Sidebar navigation:**
- Dashboard (overview stats, pending items count)
- Brokers (CRUD table with inline edit, publish/reject)
- Signal Groups (CRUD)
- Forecasts (CRUD)
- Reviews (moderate, approve/reject)
- Complaints (view, resolve)
- Scam Alerts (manage)
- Approval Queue (unified pending items view — one-click approve/reject)
- Site Settings (edit homepage content, ticker, stats, promos)
- Users & Roles (assign roles, ban users)
- Revenue (placeholder dashboard for affiliate/ad tracking)

**UI pattern:** Shadcn sidebar + data tables with filters, search, and bulk actions.

### Phase 3: Make Frontend Dynamic
Replace all hardcoded `src/data/*.ts` imports with Supabase queries that fetch only `status = 'published'` content. This means the homepage, broker listings, signals, forecasts — everything reads from DB.

### Phase 4: Role-Based Access
- Super admin: full CRUD + approve/reject + site settings
- Content ops: can submit content (goes to pending queue)
- Moderator: can review user submissions, flag content
- Broker accounts: can claim/edit their own listing (pending approval)
- Signal providers: can manage their own group listing
- Regular users: can submit reviews/complaints

---

## Technical Details

### Database Migration (single migration)
- Create `app_role` enum
- Create `user_roles` table with RLS
- Create `has_role()` security definer function
- Create all content tables with `status` column defaulting to `draft`
- Create `site_settings` key-value table
- Seed initial data from current hardcoded files
- RLS: public SELECT where `status = 'published'`, admin full access via `has_role()`

### Admin Route Protection
- `ProtectedRoute` component checks `has_role(uid, 'super_admin')` via an RPC call
- Redirects non-admins to homepage

### Admin Panel Components
- `/admin` layout with `SidebarProvider` + collapsible sidebar
- Each section uses Shadcn `DataTable` with columns, sorting, filtering
- Inline status badges (draft/pending/published/rejected)
- Edit modals with form validation
- Approval queue: unified list with content type filter, one-click approve/reject buttons

### Site Settings (No Code Updates Needed)
The `site_settings` table stores:
- `hero_stats` — the 4 stat numbers on homepage
- `promo_ticker` — promo text items
- `ticker_pairs` — forex/crypto ticker data
- `featured_brokers` — which brokers appear on homepage
- `scam_alert_banner` — current scam alert text

Frontend reads these from DB, so you edit in admin panel and homepage updates instantly.

### File Count Estimate
- ~1 migration SQL file
- ~15-20 new components (admin layout, sidebar, pages, tables, modals)
- ~5 custom hooks (useAdminBrokers, useAdminSignals, etc.)
- ~3 modified existing components (to read from DB instead of hardcoded data)

---

## Implementation Order
1. Database migration (roles + all content tables + site_settings + seed data)
2. `has_role()` function + role assignment for your account
3. Admin layout + route protection
4. Admin Dashboard page
5. Brokers CRUD page
6. Signal Groups CRUD page
7. Forecasts CRUD page
8. Reviews & Complaints moderation
9. Approval Queue (unified view)
10. Site Settings editor
11. Users & Roles management
12. Replace frontend hardcoded data with DB queries

This is a large build. I recommend we tackle it in 3-4 batches to keep each change manageable and testable.

