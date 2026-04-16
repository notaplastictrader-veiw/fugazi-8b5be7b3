

# Signup.tsx — Add Required Fields (Full Name, Phone, Terms)

## সমস্যা
Signup page এ শুধু email, password আর country দিয়ে account create হয়ে যাচ্ছে। Full Name, Phone Number, আর Terms acceptance ছাড়াই signup হচ্ছে। AuthModal এ এসব field আছে কিন্তু standalone Signup page এ নেই।

## সমাধান
AuthModal এর মতো Signup.tsx তেও mandatory fields যোগ করবো:

1. **Full Name** — required text input
2. **Phone Number** — country dial code + phone input (country selector already exists)
3. **Terms & Conditions checkbox** — must accept before signup

### Validation (submit এর আগে)
- Full Name খালি থাকলে → toast error
- Phone খালি থাকলে → toast error  
- Country select না করলে → toast error
- Terms accept না করলে → toast error

### Data passing
`supabase.auth.signUp` এর `data` তে `full_name` পাঠাবো। Signup success এর পর `profiles` table এ `phone`, `country_code`, `country` update করবো — ঠিক AuthModal যেভাবে করে।

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Signup.tsx` | Add `fullName`, `phone`, `acceptedTerms` state। Form এ 3টা নতুন field। Validation + profiles update after signup |

