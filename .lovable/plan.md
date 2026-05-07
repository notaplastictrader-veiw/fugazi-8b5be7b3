## Goal
1. **Login modal (AuthModal)**: Remove the User / Broker / Provider / Admin tab switcher (same security & UX rationale as the standalone Login page). Login = single form, role-based redirect from DB.
2. **Signup modal**: Keep the 4 role tabs (Trader / Signal Provider / Broker / Betting Site) — they ARE functionally needed (different forms, different application flows, different approval queues). Add a clear contextual helper message under the active tab so users know what they're signing up for.

## Why login tabs go but signup tabs stay
- **Login**: Role is already in DB (`user_roles`). Tab adds zero info, just exposes attack surface (esp. Admin tab).
- **Signup**: Role is what the user is *declaring* — the backend can't guess if someone wants a Trader account vs. Broker application. Different fields (telegram, company, license) are collected per role.

## Changes

### 1. `src/components/modals/AuthModal.tsx`
**Login side:**
- Remove `LoginContext` type, `loginContextConfig`, `loginContext` state.
- Remove the 3-button context selector grid (lines ~314-338).
- Remove "context description" line and admin styling on submit button.
- Replace `redirectAfterLogin` with role-based version (mirror `AuthCallback`):
  - super_admin / content_ops / moderator → `/admin`
  - broker → `/portal/broker`
  - signal_provider → `/portal/signal`
  - betting_site → `/portal/betting`
  - else → close modal (stay on current page) OR go to `/dashboard` — close modal feels right here since it's a popup.
- Update `handleGoogle` `redirectTo` → `/auth/callback` (already handles role routing).
- Remove `Shield`, `BarChart3`, `User` icon imports if unused after.

**Signup side:**
- Keep the 4 role tabs.
- Add a helper card/message **directly below the role tab strip** that changes per selected role:
  - **Trader**: "Join as a Trader — review brokers, share experiences, build reputation."
  - **Signal Provider**: "Join as a Signal Provider — list your channel and reach traders. Application reviewed in 24–48h."
  - **Broker**: "Join as a Broker — claim or list your brokerage. Application reviewed in 24–48h."
  - **Betting Site**: "Join as a Betting Site — list your sportsbook. Application reviewed in 24–48h."
- Style: small `text-xs text-muted-foreground` line + a subtle `bg-primary/5 border-primary/20` rounded box, ~2 lines tall. Icon (User / Signal / Building / Trophy) on the left.

### 2. Touch-ups
- Update memory `mem://ui/navigation-logic` if it references the removed admin/broker login tabs (will check & update).

## Files to edit
- `src/components/modals/AuthModal.tsx` (main change)

## Files NOT touched
- `src/pages/Login.tsx` — already simplified
- Signup flow logic — only adding a helper message, no field/validation changes
- DB / RLS — no changes

## Out of scope
- Splitting signup into multi-step wizard
- Changing application approval flow
