

# Phase 6 — Polish, Notifications & Production Readiness

All 5 phases are complete. Phase 6 focuses on wiring everything together, adding missing UX polish, and preparing for production.

---

## 1. Wire i18n into all UI components
Currently `I18nContext` has translations but Navbar, Hero, Footer, and Dashboard sidebar still use hardcoded English strings.

**Work:**
- Update `Navbar.tsx` to use `useI18n().t()` for all nav labels
- Update `HeroSection.tsx` for title, subtitle, search placeholder
- Update `Footer.tsx` for footer text
- Update `DashboardSidebar.tsx` for sidebar labels

## 2. In-App Notification System
Users currently have no way to know when their review is approved, complaint is resolved, or referral converts.

**Work:**
- DB migration: `notifications` table (`user_id`, `type`, `title`, `message`, `read`, `link`, `created_at`)
- RLS: users can read/update own notifications
- `useNotifications` hook with real-time subscription
- Notification bell icon in Navbar with unread count badge
- Notification dropdown/panel showing recent items
- Mark as read on click

## 3. Lazy Loading & Code Splitting
All admin pages and dashboard pages load upfront. Split them for faster initial load.

**Work:**
- Convert all route components to `React.lazy()` with `Suspense` fallback
- Group admin routes into a single lazy chunk
- Add loading skeleton component

## 4. Email Templates (Supabase Auth)
Set up branded email templates for auth flows (confirmation, password reset, magic link).

**Work:**
- Scaffold email templates via Supabase email domain tools
- Brand with NAFT colors and logo

## 5. Update Plan.md
Reflect completed status of all phases.

---

### Files to create/modify
- `src/components/layout/Navbar.tsx` — i18n integration
- `src/components/sections/HeroSection.tsx` — i18n integration
- `src/components/layout/Footer.tsx` — i18n integration
- `src/components/dashboard/DashboardSidebar.tsx` — i18n integration
- `src/hooks/useNotifications.ts` — new hook
- `src/components/NotificationBell.tsx` — new component
- DB migration for `notifications` table
- `src/App.tsx` — lazy loading refactor
- `.lovable/plan.md` — update

### Implementation Order
1. i18n wiring (Navbar → Hero → Footer → Sidebar)
2. Notifications DB + hook + UI
3. Lazy loading refactor
4. Email templates
5. Plan.md update

