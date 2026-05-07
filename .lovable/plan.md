## Goal
Login page theke "Broker/Provider" and "Admin" tab remove kore single unified login banano. Role-based redirect backend (DB `user_roles`) theke automatically hobe — jeta already `AuthCallback.tsx` e implement ache.

## Why
- **Security:** Public ly "Admin login" expose kora attackers ke target dey (brute force / credential stuffing). Generic login = role disclosure kom.
- **UX:** User ke role choose korte hobe na, backend nije bujhe niye dashboard e pathabe.
- **Code:** ~100 line kom, ekta source of truth (role → route map).

## Changes

### 1. `src/pages/Login.tsx` — simplify
- Remove `LoginTab` type, `TAB_CONFIG`, tab selector UI, "isHud" admin styling branch.
- Remove `getDefaultTab`, `redirectByTab`.
- Add a single `redirectByRole(userId)` helper that mirrors `AuthCallback.tsx`:
  - super_admin / content_ops / moderator → `/admin`
  - broker → `/portal/broker`
  - signal_provider → `/portal/signal`
  - betting_site → `/portal/betting`
  - default → `/dashboard`
- Google OAuth `redirectTo` → `window.location.origin + "/auth/callback"` (callback already handles role routing).
- Single clean card style (current "user" variant), keep email/password + Google button + Forgot password link.

### 2. Routes — backward compatibility
In `src/App.tsx` (or wherever routes live), keep `/login/admin` and `/login/broker` paths but render the same `<Login />` component (no behavior change), OR redirect them to `/login`. Recommend redirect via `<Navigate to="/login" replace />` so old bookmarks still work.

### 3. Remove "Admin Login" / "Broker Login" links
Audit and remove any UI links pointing to `/login/admin` or `/login/broker` (e.g., footer, navbar dropdown). Replace with single "Log In".

### 4. (Optional, recommended) Rate-limit hint
Add a small note in code comment: admin protection now relies on `ProtectedAdminRoute` + RLS `has_role('super_admin')`. No UI change needed — already enforced.

## Files to edit
- `src/pages/Login.tsx` (major simplification)
- `src/App.tsx` (route redirects for `/login/admin`, `/login/broker`)
- Any component linking to those old paths (grep `/login/admin`, `/login/broker`)

## Files NOT touched
- `AuthCallback.tsx` — already correct
- `useUserRole.ts`, `ProtectedAdminRoute.tsx` — role gating unchanged
- DB / RLS — no migration needed

## Out of scope
- 2FA, captcha, IP whitelist for admin (can be added later if needed)
- Changing role assignment flow (still DB-driven via `user_roles` table)
