

# Remaining Work — Final Build

Four items left before full verification.

---

## 1. Branded Auth Email Templates
Set up custom-branded authentication emails (signup confirmation, password reset, magic link) using NAFT branding (dark theme colors, logo).

**Work:**
- Configure email domain via the setup dialog
- Scaffold auth email templates (Edge Function + React Email components)
- Apply NAFT brand colors (#0EA5E9 accent, dark backgrounds) to all 6 templates
- Deploy the `auth-email-hook` Edge Function

## 2. Referral Conversion Tracking
When a new user signs up after visiting with `?ref=CODE`, automatically increment the referral code's `conversions` count.

**Work:**
- Create a DB function `convert_referral(code_text)` that increments `conversions` on `referral_codes` and marks the `referral_clicks` row as `converted = true`
- In the signup flow (`AuthModal.tsx` or `Signup.tsx`), after successful signup, check `sessionStorage` for the stored referral code and call the conversion function
- Add a notification to the referral code owner: "You earned a new referral conversion!"

## 3. Admin Referral Analytics Dashboard
A new admin page showing all users' referral performance.

**Work:**
- Create `src/pages/admin/ReferralAnalyticsAdmin.tsx` with:
  - Summary cards (total clicks, conversions, earnings across all users)
  - Table of all referral codes with user info, clicks, conversions, earnings
  - Filter by date range
- Add route in `App.tsx` and sidebar link in `AdminSidebar.tsx`

## 4. Expand Translation Coverage
Currently only Navbar, Hero, Footer, and DashboardSidebar use `t()`. Extend to more pages.

**Work:**
- Add translation keys for: Brokers page, Signals page, Login/Signup forms, Search palette, Compare page headers
- Update `I18nContext.tsx` translations object with keys for all 15 languages
- Wire `useI18n().t()` into those components

---

### Implementation Order
1. Referral conversion tracking (DB function + signup hook)
2. Admin referral analytics dashboard
3. Branded auth email templates
4. Expanded translations

### Files to create/modify
- DB migration for `convert_referral` function
- `src/pages/Signup.tsx` or `src/components/modals/AuthModal.tsx` — conversion call after signup
- `src/pages/admin/ReferralAnalyticsAdmin.tsx` — new page
- `src/components/admin/AdminSidebar.tsx` — new link
- `src/App.tsx` — new route
- Auth email templates (scaffolded automatically)
- `src/contexts/I18nContext.tsx` — expanded translations
- Multiple page components — wire `t()` calls

