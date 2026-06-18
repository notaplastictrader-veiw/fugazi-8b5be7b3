## Fix: "Unsupported provider: provider is not enabled" on Google sign-in

### Root cause

Login page calls Google OAuth, but Google provider is not enabled in Lovable Cloud auth settings. Supabase rejects with `validation_failed`.

### Fix

1. Enable Google as a social auth provider via Lovable Cloud (`configure_social_auth` with `providers: ["google"]`). Keep email/password enabled.
2. Verify `src/pages/Login.tsx` uses the correct sign-in call (`lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` or the existing supabase call) — adjust only if needed.
3. Test on the published URL — preview env may behave differently for OAuth.

### Files touched

- Possibly `src/pages/Login.tsx` / `src/pages/Signup.tsx` if the OAuth call needs adjustment. Most likely zero code changes — just enabling the provider.

No DB migrations needed.