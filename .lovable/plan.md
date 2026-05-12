# Finish the Remaining Sequence

Two items left from the original research: **Pro paywall** and **complete i18n**. Doing #3 first, then #4.

---

## Step 3 — Pro Paywall (Stripe)

**Pricing (already decided):** $49/mo, $399/yr

### Backend (Lovable Cloud)
- Add Stripe secret key via secrets tool (`STRIPE_SECRET_KEY`).
- New table `subscribers`:
  - `user_id`, `email`, `stripe_customer_id`, `subscribed` (bool), `subscription_tier` ('monthly' | 'yearly'), `subscription_end` (timestamptz)
  - RLS: user can read own row; edge functions write via service role.
- Three edge functions (all `verify_jwt = false` for Stripe webhooks; checkout/portal verify JWT inside):
  1. `create-checkout` — creates Stripe Checkout session for monthly or yearly price; returns URL (open in new tab).
  2. `check-subscription` — queries Stripe for current user, upserts `subscribers` row, returns `{ subscribed, tier, end }`.
  3. `customer-portal` — opens Stripe billing portal for managing/cancelling.

### Frontend
- New page `/pricing` with two-tier card UI (Monthly / Yearly — highlight yearly "Save 32%"), themed via existing tokens, **Subscribe** buttons → call `create-checkout`.
- New hook `useSubscription()` — calls `check-subscription` on mount + every 60s; exposes `{ isPro, tier, loading, refresh }`.
- Wrap Pro-only routes/sections with existing `<ProtectedSection>` pattern, but gated on `isPro` instead of role:
  - **Premium signals** (already have free/premium tier in Signals service)
  - **Forecast Engine — advanced category** (optional; confirm scope)
- Add **Upgrade to Pro** CTA in user dashboard sidebar + locked-state banners on premium signals cards.
- Success redirect → `/dashboard?upgraded=1` triggers `refresh()` + toast.
- Add `/pricing` link to Navbar (between Awards and Join Free).

---

## Step 4 — Complete i18n for Forum + Awards (15 languages)

Currently only 7 languages have `nav.forum` / `nav.awards`. Need to add for the remaining **8 languages** plus expand keys beyond just nav labels.

### Languages to fill in
DE, IT, PT, RU, ZH, JA, ID, TR (the 8 missing from the 15-language set).

### Keys to add for Forum + Awards (all 15 languages, not just nav)
- `nav.forum`, `nav.awards`
- **Forum:** `forum.title`, `forum.newThread`, `forum.reply`, `forum.report`, `forum.reportReason`, `forum.reactions.like|fire|flag`, `forum.verifiedOnly`, `forum.empty`
- **Awards:** `awards.title`, `awards.vote`, `awards.voted`, `awards.viewResults`, `awards.winner`, `awards.runnerUp`, `awards.votes`, `awards.closed`

### Files to touch
- `src/contexts/I18nContext.tsx` — add the new keys for all 15 locale dictionaries.
- `src/components/forum/ReactionBar.tsx` — replace hardcoded English with `t('forum.reactions.*')`, `t('forum.report')`, etc.
- `src/pages/ForumThread.tsx`, `src/pages/Forum.tsx` — replace hardcoded strings.
- `src/pages/Awards.tsx`, `src/pages/AwardsResults.tsx` — replace hardcoded strings.
- RTL check: AR + UR Forum thread layout (reactions row, report dialog) — use existing `dir="rtl"` aware classes.

---

## Order of execution
1. Stripe migration (`subscribers` table + RLS).
2. Add `STRIPE_SECRET_KEY` secret.
3. Deploy 3 edge functions.
4. Build `/pricing` page + `useSubscription` hook + Pro gates.
5. Expand i18n dictionaries (15 langs × ~12 keys).
6. Swap hardcoded strings in Forum/Awards components.
7. Smoke test: subscribe flow (test mode), reactions in AR (RTL), AwardsResults in JA.

---

## Open questions before I start
- **Stripe mode:** test keys first, or go straight to live? (Recommend test.)
- **What exactly is gated behind Pro?** Confirm: Premium Signals only — or also Forecast advanced + something else?
- **Yearly discount badge copy:** "Save 32%" / "2 months free" / custom?
