## Goal

Tomar deya 4 ta area (Auth, Profile, Reviews/Complaints/Watchlist, Admin+RLS) A-to-Z verify korbo, ar **profile photo update na howar bug** fix korbo.

---

## 1. Profile photo bug — root cause + fix

### Ki dhorlam (code review)

`src/pages/dashboard/ProfileSettings.tsx`:
- Upload kaj korche (ImageUpload → Supabase Storage → public URL)
- Save click korle `profiles.avatar_url` update hochhe ✅
- `supabase.auth.updateUser({ data: { avatar_url } })` o call hochhe ✅
- React Query invalidate o hochhe (`my-profile`, `profile`, `public-profile`) ✅

### Real problem (2 ta layer)

**A. Auth session refresh hoy na**
`supabase.auth.updateUser()` server a metadata update kore, kintu **client side `user.user_metadata` purono thake** jotokkhon na page reload hoy ba `refreshSession()` call hoy. Result: `user.user_metadata.avatar_url` purono dekhay (Navbar, Overview, etc. ei field use kore).

**B. Browser image cache + Supabase Storage URL**
ImageUpload upload korar somoy `cacheControl: "3600"` set kore. Filename `${Date.now()}-...` unique, taile new URL, kintu jodi ekta image `<img src>` re-render na hoy (component memoized), browser update na korte pare. CDN-level cache o thakte pare.

### Fix

1. **`updateUser` er pore `supabase.auth.refreshSession()` call koro** → fresh `user.user_metadata` AuthContext a propagate hobe.
2. **AuthContext a `USER_UPDATED` event handle koro** → onAuthStateChange a `_event === "USER_UPDATED"` hole o `setSession` call hoy (ekhon already shob event a hoy, kintu confirm korbo).
3. **Image upload e `cacheControl: "0"`** + **cache-busting query param** (`?v=${Date.now()}`) URL er sathe attach kore save koro → browser/CDN guaranteed fresh image dekhabe.
4. **ProfileHeader, dashboard, navbar** — shobjaiga profile query theke avatar nilo, `user.user_metadata` use kore na — ei consistency confirm korbo.

---

## 2. Auth flow QA (Signup / Login / Google / Reset)

- `/signup` — email+password + Google button, `handle_new_user` trigger profile create kore ✅ (DB function ase)
- `/login` — email+password + Google
- `/forgot-password` + `/reset-password` route exist + flow check
- Google OAuth — `configure_social_auth` configured kina verify, redirect URL check
- Session persistence — refresh korle logged in thake kina

**Action:** Code path read-only review, supabase auth_logs query, edge case (existing email, weak password) note korbo.

---

## 3. User dashboard QA

- **Overview** — stats load, links kaj kore
- **My Reviews** — RLS: user own reviews dekhe (currently `reviews` table a "Public can view published" ase, kintu nijer pending/draft o dekhar policy ase kina verify)
- **My Complaints** — similar RLS check
- **Watchlist** — table exist, insert/delete RLS
- **Notification Preferences** — insert/update working
- **Profile photo update** — ↑ fix er por test

---

## 4. Admin + RLS audit

- Run `supabase--linter` for security findings
- `has_role()` SECURITY DEFINER properly use hocche shob admin policy te ✅ (confirmed in db functions)
- Admin pages load (Brokers, Reviews, Approvals, Users, Referral Analytics)
- 4-tier RBAC working (super_admin, content_ops, broker_ops, viewer)
- Check `user_roles` table grant + RLS

---

## Deliverable

1. **Code change** — `src/pages/dashboard/ProfileSettings.tsx` (refreshSession + cache-bust) + `src/components/admin/ImageUpload.tsx` (cacheControl: "0", optional return cache-busted URL)
2. **Read-only QA report** — chat a likhe debo prottek section a ki paisi (✅ working / ⚠️ minor / ❌ broken)
3. Konno broken thakle alada plan/fix proposal

---

## Out of scope

- New features / UI redesign
- Email template change
- Performance tuning
- Edge function rewrite (shudhu read-only check)

Confirm korle code change + QA shuru korbo.