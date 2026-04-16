

# Email Validation Fix — Signup Forms

## সমস্যা
"Fugazi@06" এর মতো invalid email দিয়ে account create করা যাচ্ছে — কোনো warning নেই। Browser এর built-in `type="email"` validation যথেষ্ট না, আর Supabase ও মাঝে মাঝে invalid email accept করে ফেলে।

## সমাধান
দুইটা signup form এ (Signup.tsx + AuthModal.tsx) proper email validation যোগ করবো — submit এর আগেই check করবো:

**Regex validation:**
```typescript
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

এটা check করবে:
- `@` আছে কিনা
- Domain part এ `.` আছে কিনা (e.g. `.com`, `.net`)
- "Fugazi@06" reject হবে কারণ `06` এ dot নেই

**Toast error:** "Please enter a valid email address"

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Signup.tsx` | `handleSignup` এ email regex check যোগ, invalid হলে toast দেখাবে |
| `src/components/modals/AuthModal.tsx` | `handleSignup` ও `handleLogin` এ same email validation যোগ |

