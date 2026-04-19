

## What you're asking
On the Signup page (`/signup`), there's no way to go back to the homepage or the previous page. User wants a "Back" / "Home" option on the signup form.

Same likely applies to Login + ForgotPassword for consistency.

## Plan

### Add a back link to auth pages
On `src/pages/Signup.tsx` (and matching `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` for consistency), add a small back control above the glass-card:

- **"← Back to Home"** link, top-left, subtle muted styling
- Uses `react-router-dom` `Link` to `/` (always reliable)
- Optional: also a smaller "Go back" using `navigate(-1)` if there's history — but a single "Back to Home" link is cleaner and won't break if user landed directly

### Layout
```
[← Back to Home]            ← new, top-left, muted text
   ┌─────────────────┐
   │  Not A Fugazi…  │
   │   Join Free     │
   │   ...form...    │
   └─────────────────┘
```

Placed inside the centering wrapper but above the glass-card, with `mb-4` spacing. On mobile it stays left-aligned within the same max-width container.

### Files touched
- `src/pages/Signup.tsx` — add back link
- `src/pages/Login.tsx` — add back link
- `src/pages/ForgotPassword.tsx` — add back link
- `src/pages/ResetPassword.tsx` — add back link

### Out of scope
- Adding a full navbar to auth pages (would clutter the focused form)
- Browser-history-aware smart back button (sticking with simple "Back to Home")

