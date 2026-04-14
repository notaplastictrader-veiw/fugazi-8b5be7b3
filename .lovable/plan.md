

# Plan: Fix Role-Based Login + Dashboard Access

## Problems Identified

1. **AuthModal (site "Log In" button)** has no role-based redirect — after login it just closes the modal, user stays on the same page. No way to reach admin/broker dashboards from here.

2. **AuthModal lacks role tabs** — the `/login` page has User/Broker/Admin tabs, but the modal (used everywhere on the site) only has Login/Signup tabs with no role awareness.

3. **Dashboard routing works correctly in code** — `Dashboard.tsx` already checks roles and shows the right component (BrokerDashboard, SignalDashboard, ModeratorDashboard, etc.). The issue is users never get routed TO `/admin` after modal login.

## Solution

### 1. Add role-based redirect to AuthModal after login

In `src/components/modals/AuthModal.tsx`, after successful login:
- Fetch the user's roles from `user_roles` table
- Redirect based on role priority:
  - `super_admin` / `content_ops` → `/admin`
  - `moderator` → `/admin`
  - `broker` → `/admin` (Dashboard.tsx will show BrokerDashboard)
  - `signal_provider` → `/admin` (Dashboard.tsx will show SignalDashboard)
  - No admin roles → stay on current page (just close modal)
- Use `useNavigate()` for redirect

### 2. Add "Login as" context to AuthModal

Add a subtle role selector below the Login tab in the AuthModal — 3 small buttons: **User** (default), **Broker/Provider**, **Admin** — matching the `/login` page design. This determines where to redirect after login:
- **User**: close modal, stay on page (or go to `/dashboard`)
- **Broker/Provider**: redirect to `/admin` (broker/signal dashboard auto-selects)
- **Admin**: redirect to `/admin`

### 3. Verify sidebar filtering is working

The sidebar code already filters items for broker-only and signal-only users (lines 73-86 of AdminSidebar). The Dashboard.tsx routing (lines 256-276) already conditionally renders the correct dashboard. These are working — the missing piece is just getting users TO `/admin` after login.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/modals/AuthModal.tsx` | Add login role tabs (User/Broker/Admin), add post-login redirect logic using `useNavigate`, fetch roles after login to validate access |

## Technical Notes
- The Google OAuth handler in AuthModal also needs the redirect update — set `redirectTo` based on selected login tab
- Dashboard.tsx already handles showing the right dashboard per role — no changes needed there
- AdminSidebar already filters menu items per role — no changes needed there
- One file change solves both issues

