

# Diagnosis: Login redirects to homepage instead of admin dashboard

## Problem

In `src/pages/Login.tsx` line 26, after successful login the code always runs `navigate("/")`, sending every user — including super_admins — back to the homepage. There is no role-aware redirect logic.

Additionally, the Google OAuth redirect (line 32) uses `window.location.origin` which also lands on `/`.

## Plan

### 1. Add role-aware redirect after login (`src/pages/Login.tsx`)

After successful email/password login, fetch the user's roles and redirect accordingly:
- If user has any admin role (`super_admin`, `content_ops`, `moderator`) → redirect to `/admin`
- If user has `broker` role → redirect to `/admin/broker-dashboard`
- If user has `signal_provider` role → redirect to `/admin/signal-dashboard`
- Otherwise → redirect to `/dashboard` (user dashboard)

### 2. Fix Google OAuth redirect URL

Change the OAuth `redirectTo` from `window.location.origin` to `window.location.origin + "/dashboard"` so Google login users also land somewhere useful. The admin redirect for OAuth users can be handled by a post-login check in the `AuthContext` or on the dashboard page itself.

### 3. Optional: Add a post-auth redirect hook

Create a small utility that checks roles after auth state changes and navigates admins to `/admin` if they land on `/`. This handles the OAuth flow where we can't do the redirect inline.

## Files involved
- `src/pages/Login.tsx` — main change: role-aware redirect after login
- Possibly `src/contexts/AuthContext.tsx` or a new redirect component for OAuth flow

## Technical notes
- The `user_roles` query uses RLS, so it must run after the session is established
- The role fetch is a quick single-table query, so the redirect delay will be minimal

