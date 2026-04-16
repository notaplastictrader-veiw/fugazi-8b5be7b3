

# Disable Auto-Confirm — Require Email Verification Before Login

## সমস্যা
Signup করার সাথে সাথেই login হয়ে যাচ্ছে — email verification হচ্ছে না। Auth logs এ দেখা যাচ্ছে `"immediate_login_after_signup": true`। এর মানে auto-confirm enabled আছে।

## সমাধান

### 1. Auto-confirm disable করবো
`cloud--configure_auth` tool দিয়ে email auto-confirm বন্ধ করবো। এতে signup এর পর user কে verification email পাঠাবে, এবং verify করার আগে login করতে পারবে না।

### 2. Signup.tsx — Success message update
Signup success হলে এখন dashboard এ redirect করে। পরিবর্তে:
- Redirect বন্ধ করবো
- Toast দেখাবো: "Check your email to verify your account before signing in"
- Form reset করবো

### 3. AuthModal.tsx — Same treatment
Modal এর signup flow তেও same change — success এ redirect না করে verification message দেখাবো।

### 4. Login.tsx — Handle unverified login attempt
User যদি verify না করে login করতে চায়, Supabase "Email not confirmed" error দেয়। সেটা catch করে user-friendly message দেখাবো।

## Files Changed

| File | Change |
|------|--------|
| Auth config | `configure_auth` — disable auto-confirm email |
| `src/pages/Signup.tsx` | Success এ redirect বন্ধ, verification message দেখাবে |
| `src/components/modals/AuthModal.tsx` | Same — signup success এ verify message |
| `src/pages/Login.tsx` | "Email not confirmed" error handle করে friendly message |

