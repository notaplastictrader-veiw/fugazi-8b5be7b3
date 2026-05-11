## NAFT Improvement Plan — Final (Revised v3)

User decisions locked in:
- **Keep `fallbackGroups`** in `SignalHub.tsx` and `Signals.tsx` as-is — user will edit DB later when real groups go live
- **Keep all 4 Hero stats** including "Active traders" — but wire the first 3 to live DB counts, and wire "Active traders" to live `profiles` count (auto-updates as users register)

---

### WEEK 1 — Critical Trust + Bugs

**#1 — Title fix (tab + meta)**
- `index.html` line 6 → `Not A Fugazi Trader | Broker Reviews & Scam Alerts`
- `index.html` lines 55-56 (og:title / twitter:title) → same
- `src/pages/Index.tsx` SEO title → same
- `.lovable/plan.md` updated to reflect

**#2 — Hero stats: real counts from DB**
File: `src/components/sections/HeroSection.tsx`
- Replace hardcoded `defaultStats` with a `useEffect` that runs 4 parallel `supabase` count queries:
  - Verified reviews → `reviews` where `status='published'`
  - Brokers listed → `brokers` where `status='published'`
  - Scam alerts → `scam_alerts` where `status='published'`
  - Active traders → `profiles` count (all rows)
- Format helper: `<1000 → "247"`, `≥1000 → "4.8K+"`, `≥1000000 → "1.2M+"`
- Fallback to current hardcoded values only while loading (skeleton dots, not fake numbers)
- CMS override (`hero_section.stats`) still respected if admin sets it

**#3 — Broken "View Profile" / "View Group" buttons audit**
Files to check + fix:
- `src/components/sections/BrokerTrustHub.tsx` — verify Link to `/brokers/:slug` works
- `src/components/sections/SignalHub.tsx` — verify Link to `/signals/:id` works (currently uses `id`, may need slug)
- `src/components/sections/ScamAlertSection.tsx` — verify scam alert click destination
- `src/pages/Brokers.tsx`, `src/pages/Signals.tsx`, `src/pages/PropFirms.tsx` — card click handlers
- Replace any plain `<button>` with React Router `<Link>` where navigation is intended

**#4 — Branded `og:image`**
- Generate `src/assets/og-image.jpg` (1200×630) with NAFT candlestick logo + tagline "Broker Reviews & Scam Alerts"
- Copy to `public/og-image.jpg`
- Update `index.html` lines 32-34 og:image URLs

**#5 — `vercel.json` fix**
- Exclude `robots.txt`, `sitemap.xml`, `favicon.svg`, `manifest.webmanifest`, `og-image.jpg` from SPA rewrite so crawlers get raw files

**#6 — 404 page upgrade**
- `src/pages/NotFound.tsx` → branded design, link back to home + popular sections (Brokers, Scam Alerts, Signals)

**#7 — Cookie consent verify**
- Confirm `CookieConsent.tsx` is mounted in `App.tsx` and links to `/cookies` + `/privacy`

---

### WEEK 2 — Differentiator + Empty States

**#8 — Complaint flow (PROMOTED to Week 2 per your earlier feedback)**
- New `src/components/modals/FileComplaintModal.tsx`
- Form fields: broker (preselected), complaint type (withdrawal / spread manipulation / account closure / other), description, proof upload (multi-image), email
- Insert into existing `complaints` table (RLS already allows authed user inserts)
- Add "File Complaint" button on `BrokerDetail.tsx` (visible to logged-in users; logged-out → AuthModal)
- Show count of complaints on broker card: `{count} complaints filed`

**#9 — Calendar empty state + debug**
- `src/pages/Calendar.tsx` + `WeekNewsBoard.tsx`: add loading skeleton + "Calendar updating soon — check back shortly" placeholder when 0 events
- Debug `useEconomicCalendar.ts` — check why DB returns nothing (is data published? edge function failing?)

**#10 — Prop Firm filter fix**
- `src/pages/PropFirms.tsx` lines 19-20 — verify `tags` array on `brokers` rows includes filter values like `instant-funding`, `1-step`, `2-step`
- Migration: backfill missing tags on prop firm broker rows
- Filter logic in `PropFirms.tsx` should match against `tags` array

---

### MONTH 1 — Trust Building Layer

**#11 — "How We Review" methodology page**
- New `src/pages/HowWeReview.tsx`
- Sections: scoring weights (regulation 30%, user reviews 25%, withdrawal 25%, complaint history 20%), data sources, update cadence, conflict-of-interest policy
- Add route in `App.tsx` + footer link

**#12 — "Last Verified" badge on broker cards**
- Migration: add `last_verified_at timestamptz` to `brokers` table
- Show `Last verified: 12 days ago` on `BrokerTrustHub.tsx` + `BrokerDetail.tsx`

**#13 — Trust Score breakdown block**
- `BrokerDetail.tsx` — show 4-bar visual breakdown: Regulation / User Reviews / Withdrawal Speed / Complaint History
- Each bar with score + 1-line explanation

---

### Execution Order

```
Week 1: #1 → #2 → #3 → #4 → #5 → #6 → #7
Week 2: #8 → #9 → #10
Month:  #11 → #12 → #13
```

---

### Technical Notes

- **#2 stat counts**: use `supabase.from('x').select('*', { count: 'exact', head: true })` for efficient counts (no row data transfer)
- **#8 complaints table**: already exists with RLS. No migration needed, just insert + storage bucket for `proof_urls`
- **#10 + #12**: only DB migrations needed, no breaking schema changes
- **fallbackGroups stay**: `SignalHub.tsx` and `Signals.tsx` keep hardcoded fallback arrays untouched per your decision
