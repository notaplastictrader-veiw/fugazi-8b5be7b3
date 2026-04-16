

# Fix: Signup Still Auto-Logging In Despite Auto-Confirm Off

## সমস্যা
Auto-confirm disable করা হয়েছে, কিন্তু signup এর পর এখনও user login হয়ে যাচ্ছে। কারণ: Supabase কিছু ক্ষেত্রে (বিশেষ করে repeated signup বা edge cases এ) `signUp` call এর পরেও একটা session return করে, আর `AuthContext` এর `onAuthStateChange` সেই session ধরে ফেলে auto-login করিয়ে দেয়।

## সমাধান
Signup success এর পর explicitly `supabase.auth.signOut()` call করবো — এতে কোনো session যদি create হয়েও যায়, সেটা সাথে সাথে destroy হবে। User কে login page এ পাঠাবো verification message সহ।

### Changes:

**Signup.tsx (line ~96-119):**
- Signup success এর পর, profile update ও referral logic শেষে `await supabase.auth.signOut()` call
- তারপর toast ও navigate to `/login`

**AuthModal.tsx (line ~208-227):**
- Same — regular user signup success এর পর `await supabase.auth.signOut()` call
- Toast দেখাবে "Check your email to verify"

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Signup.tsx` | Add `supabase.auth.signOut()` after signup success, before navigate |
| `src/components/modals/AuthModal.tsx` | Add `supabase.auth.signOut()` after regular user signup success |

