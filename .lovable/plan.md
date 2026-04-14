

# Plan: Role-Specific Dashboards + Login Page Tabs

## Problem
Currently, all roles see the super_admin dashboard. Only super_admin and content_ops/moderator routing works. There's no moderator-specific dashboard, no user dashboard in admin, and no betting site dashboard (note: "betting_site" is not a role in the DB — betting sites are managed by content_ops). The Login page has no way to distinguish user vs admin login.

## Current roles in DB
`super_admin`, `content_ops`, `moderator`, `user`, `broker`, `signal_provider`

There is NO "betting_site" role. Betting sites are static data managed by content_ops/super_admin. So we build 5 distinct dashboards (not 6):

1. **super_admin** — already done ✓
2. **moderator** — needs its own HUD dashboard (reviews, complaints, approval queue focus)
3. **broker** — already done ✓ (but needs sidebar filtering so they only see their items)
4. **signal_provider** — already done ✓ (same)
5. **user** — regular users who somehow reach /admin should be redirected to /dashboard

## Changes

### 1. Login Page — Add role tabs (`src/pages/Login.tsx`)
Add 3 tabs at the top: **User**, **Broker / Provider**, **Admin**
- **User** tab: default, redirects to `/dashboard` after login
- **Broker / Provider** tab: same form, redirects to `/admin/broker-dashboard` or `/admin/signal-dashboard` based on role
- **Admin** tab: HUD-styled variant, redirects to `/admin`
- All tabs use the same email/password form — the tab only changes the post-login redirect and visual styling
- URL routes `/login/user`, `/login/broker`, `/login/admin` already exist — use path to set default tab

### 2. Moderator Dashboard (`src/pages/admin/Dashboard.tsx`)
Create a `ModeratorDashboard` component inside Dashboard.tsx:
- HUD-styled with scanline effects
- Stats: Pending Reviews, Pending Complaints, Approval Queue count, Published Today
- Quick links to Reviews, Complaints, Approval Queue
- Recent activity feed from approval_queue

### 3. User role redirect (`src/pages/admin/Dashboard.tsx`)
If user has only the "user" role (no admin roles), redirect them to `/dashboard` instead of showing a blank admin page.

### 4. Sidebar filtering for broker/signal_provider (`src/components/admin/AdminSidebar.tsx`)
- Broker-only users: show only Dashboard + Broker Dashboard in sidebar
- Signal-only users: show only Dashboard + Signal Dashboard in sidebar
- Hide all other admin menu items they can't access

### 5. ProtectedAdminRoute update (`src/components/admin/ProtectedAdminRoute.tsx`)
- Add "user" role to `canAccessAdmin` check is NOT needed — users without admin/broker/signal roles already get redirected away

## Files to modify

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Add 3 login tabs (User / Broker-Provider / Admin) with different styling and redirect logic |
| `src/pages/admin/Dashboard.tsx` | Add ModeratorDashboard component; add user-role redirect to /dashboard |
| `src/components/admin/AdminSidebar.tsx` | Filter sidebar items more strictly for broker/signal_provider-only users |

## Technical notes
- Login tabs are cosmetic + redirect logic only — authentication is identical for all roles
- The `/login/user`, `/login/broker`, `/login/admin` routes already exist in App.tsx — we use `useLocation` to determine default tab
- No DB migration needed — all 6 roles already exist in the `app_role` enum

