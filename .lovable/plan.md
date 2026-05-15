## Full Site Audit — Findings & Fix Plan

DB scan + code scan korar pore eta dekhlam. User-driven empty tables (watchlist, trade_journal, referral_codes, follows, pro_subscriptions, ad_enquiries, newsletter_subscribers ityadi) skip korlam — egulo real users theke fill hobe. Focus shudhu **public-facing gaps** ar **pending wiring** er upor.

### 🔴 Critical gaps (visible to visitors)

1. **`news_articles` = 0 rows**
   - `/news` page khali dekhabe
   - Sitemap e `/news/<slug>` entries asbe na
   - Homepage news section o khali
   - **Fix:** 8 ta realistic published news article seed (forex/crypto/regulation mix, recent dates, proper excerpts + content)

2. **`forum_threads` = 0 rows**
   - `/forum` page completely empty
   - Homepage "Top Traders" / forum widget khali
   - **Fix:** 6 ta sample threads seed (existing verified profile user diye), categories: general, brokers, signals, scams. Sathe 2-3 ta replies prottek e.

### 🟡 Pending UI wiring (code exists but not connected)

3. **`ExitIntentModal`** — component file `src/components/ExitIntentModal.tsx` exists but never imported anywhere
   - **Fix:** Mount in `MainLayout.tsx` so it shows on all public pages

4. **Sitemap regenerate** — news seed korar por sitemap script abar run korte hobe (predev e auto run hobe but verify)

### 🟢 OK as-is (no action)
- All user-driven tables (correct to be empty until users interact)
- `signal_profiles` empty but `signal_groups` populated (groups is the public surface)
- `profile_claims` (1), `applications` (1), `support_messages` (2) — admin workflow data, low volume expected

### Implementation steps

1. **Seed news_articles** — 8 published articles via insert (bn/en mix not needed, single-locale fine)
2. **Seed forum_threads + replies** — use first verified user_id from profiles, 6 threads + ~15 replies
3. **Wire ExitIntentModal** — add `<ExitIntentModal />` mount inside `MainLayout`
4. **Verify sitemap** — confirm news entries appear after seed

### What I will NOT do
- Won't seed user PII tables (referrals, watchlist, journals, subscriptions)
- Won't touch existing seeded tables (brokers, education, calendar, awards, scams, forecasts ityadi — already populated)
- Won't add new features — shudhu fill the gaps in existing built features

Approve korle implement kori.