

## Issue
User signs up → super admin approves in DB → user clicks email verification link → redirected to homepage but **NOT logged in** → tries to login → "Please verify your email to complete your sign up" error.

## Root Cause Investigation Needed
Need to check:
1. `AuthModal.tsx` signup flow — what `emailRedirectTo` is set?
2. Is there any URL handler in `App.tsx` / `main.tsx` to process the auth callback (`access_token` in URL hash)?
3. Is `email_confirmed_at` actually getting set after click?

Most likely cause: `emailRedirectTo` either missing or pointing to `/` without proper session-handling. Supabase auth tokens come back in URL hash (`#access_token=...`). React Router doesn't auto-process this; Supabase JS client does it via `detectSessionInUrl: true` (default) — BUT only if the page actually loads with that hash.

If `emailRedirectTo` is set to a Lovable preview URL or a path that does redirect/strip the hash before Supabase client initializes, the session is never established → `email_confirmed_at` may also stay NULL.

## Plan

### Step 1: Read current code (no changes)
- `src/components/modals/AuthModal.tsx` — check `signUp` `emailRedirectTo` value
- `src/App.tsx` & `src/main.tsx` — confirm Supabase client init order
- Check if any redirect/Navigate strips URL hash before Supabase processes it

### Step 2: Verify in DB
Query `auth.users` for the user `ishaqzaade.im@gmail.com` to confirm whether `email_confirmed_at` got set after the user clicked the verification link.

### Step 3: Fix (after diagnosis)
Likely fixes (will confirm after Step 1+2):

**A. AuthModal signup — set proper redirect:**
```ts
await supabase.auth.signUp({
  email, password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: { full_name, ... }
  }
});
```

**B. Add `/auth/callback` route** that:
- Lets Supabase client process the URL hash (auto via `detectSessionInUrl`)
- Waits for session
- Redirects to `/dashboard` (or role-based destination)
- Shows a brief "Verifying…" spinner

**C. Update Supabase URL Config**
Site URL + Additional Redirect URLs must include the preview & published domains so the verification link actually carries the access token back. (User must approve via Cloud settings — I'll flag it.)

### Step 4: Manual super-admin approval flow
If user was already manually marked verified by super admin in DB but `email_confirmed_at` is still NULL, instruct on the proper way (run `UPDATE auth.users SET email_confirmed_at = now()`). Will check current DB state first.

## Out of Scope
- Custom branded email templates (separate request)
- Switching to magic-link signup
- Phone OTP

## Files to Touch (estimate)
- `src/components/modals/AuthModal.tsx` (1 small change)
- New `src/pages/AuthCallback.tsx`
- `src/App.tsx` (add 1 route)
- Possibly 1 SQL migration if `email_confirmed_at` needs backfill for the stuck user

