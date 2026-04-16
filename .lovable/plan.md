

# Fix: Signup Toast Message Text Change

## Change
`src/pages/Signup.tsx` এর success toast message এ "before signing in" → "to complete your sign up" change করবো।

**Current:** "Please verify your email before signing in."
**New:** "Please verify your email to complete your sign up."

Also check `AuthModal.tsx` for similar message.

## File
| File | Change |
|------|--------|
| `src/pages/Signup.tsx` | Toast description text update |
| `src/components/modals/AuthModal.tsx` | Same text update if present |

