

# Current Progress & Remaining Work

## Completed (Phase 1-4 Core)
- Static pages, themes, SEO foundations
- Dynamic content with Supabase (brokers, signals, news, forecasts, etc.)
- User Dashboard (`/dashboard`) with Overview, Reviews, Complaints, Watchlist, Settings
- Global Search (Cmd+K palette)
- Sitemap + robots.txt
- RBAC: `useUserRole` hook + permission matrix
- `ProtectedAdminRoute` with `requiredRoles` support
- Role-filtered `AdminSidebar`
- `audit_log` table + Audit Log viewer page
- Enhanced Approval Queue with tabs, notes, expand/collapse
- `AccessDenied` page

---

## Phase 4 -- Incomplete Items

### 1. Broker Portal (personalized for `broker` role users)
Current `BrokerDashboard` is a generic admin stats page. It does NOT:
- Filter to show only the logged-in broker's own listing
- Allow broker to edit their profile (with approval queue submission)
- Show complaints filed against their specific broker
- Display lead/inquiry data

### 2. Signal Provider Portal (personalized for `signal_provider` role users)
Current `SignalDashboard` is also generic admin stats. It does NOT:
- Show only the logged-in provider's signal group
- Allow editing signal group info (via approval queue)
- Show subscriber/member analytics for their group

### 3. Missing `ProtectedSection` component
Plan mentioned a wrapper component for role-gating individual sections within pages -- not yet created.

### 4. Content submission auto-queue
When `content_ops` creates content, it should auto-insert into `approval_queue` with `pending` status. This flow is not wired into the admin CRUD pages (BrokersAdmin, NewsAdmin, etc.).

---

## Phase 5 -- Not Started
- Affiliate/referral tracking system
- Regional expansion (multi-language, geo-targeted content)

---

## Recommendation: Complete Phase 4 Gaps First

Build the remaining Phase 4 items in this order:

1. **Personalized Broker Portal** -- filter data by `created_by = user.id`, add profile edit form that submits to `approval_queue`, show own complaints
2. **Personalized Signal Provider Portal** -- same pattern for signal groups
3. **Auto-queue on content creation** -- when any admin CRUD page creates/edits content, auto-insert into `approval_queue`
4. **ProtectedSection wrapper** -- reusable component for inline role-gating

### Files to modify/create
- `src/pages/admin/BrokerDashboard.tsx` -- rewrite with user-scoped data
- `src/pages/admin/SignalDashboard.tsx` -- rewrite with user-scoped data
- `src/components/admin/ProtectedSection.tsx` -- new wrapper
- Admin CRUD pages (BrokersAdmin, NewsAdmin, etc.) -- add approval queue insertion on create/edit

