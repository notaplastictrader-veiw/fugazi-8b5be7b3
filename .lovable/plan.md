

## What you're asking (5 issues)

1. **Promotions → "Read More"** opens a stub (data-file fallback). Needs real DB-driven detail page + admin fields for full description / how-to-claim / terms / referral link / broker name.
2. **Promotions → "Claim Offer"** does nothing because `link_url` isn't filled in DB. Need admin UI to add affiliate/referral URL per promo.
3. **Navbar → "Broker Reviews" dropdown categories** (CFD/Forex, Crypto, Binary, ECN…) all dump you on the same `/brokers` page — the `?type=crypto` query is ignored. Need to read the query and pre-filter, plus add a "View All" / category chip strip on the page.
4. **Broker detail → "Open Account" button** is dead because `website_url` is empty in DB. Admin form already has the field — just need to make the CTA actually use it (and hide/disable when empty).
5. **Prop Firms** — too few cards, mixed with broker-style layout. Add more seed firms and ensure the page only shows `type='prop-firm'` (it already filters but DB is thin).
6. **Scam Alerts → individual page** currently shows only title + severity + short reason + report. You want:
   - A new **"Repeat Offender" / red tag** when a broker collects too many complaints
   - A **"Full Report" rich block** that admin toggles ON per alert and writes a long-form red-highlighted report
   - Show this report on both the scam alert detail AND on the broker's own profile page if the broker is linked

---

## Plan

### A. Database migrations

1. **`promotions`** — add columns:
   - `slug text unique` (auto-from-title)
   - `full_description text` (long-form)
   - `how_to_claim text[]` (steps)
   - `terms text[]` (T&Cs)
   - `broker_name text` (display label, separate from `broker_id`)
   - `referral_url text` (affiliate link, distinct from `link_url`)

2. **`scam_alerts`** — add columns:
   - `is_repeat_offender boolean default false` (admin toggle → red "REPEAT OFFENDER" tag)
   - `show_full_report boolean default false` (admin toggle to expose the long report)
   - `full_report text` (long-form, rendered with red highlight)
   - (`broker_id` already exists — we'll just use it to surface report on broker page)

3. Seed ~6 more **prop-firm** broker rows (FTMO, FundedNext, MFF, The5ers, Apex, Topstep) so the page isn't empty.

### B. Frontend changes

**Promotions**
- `PromotionsAdmin.tsx`: wire the new fields (slug, full_description, how_to_claim textarea→array, terms textarea→array, broker_name, referral_url). Save them.
- `Promotions.tsx`: pull these new fields into the list mapper. "Claim Offer" → `referral_url || link_url`; disable if both empty.
- `PromotionDetail.tsx`: switch from `getPromoBySlug` (data file) to a **Supabase query by slug**, fall back to data file only if not found. Render `full_description`, `how_to_claim` (numbered list), `terms` (bullets), countdown, broker name. CTA uses `referral_url`.

**Broker categories**
- `Brokers.tsx`: read `?type=` from URL on mount → set initial filter. Show **category chips** (Forex / Crypto / Binary / ECN / All) at top, persistent regardless of how user landed. Clicking a chip updates URL (`setSearchParams`).

**Broker detail "Open Account"**
- Find the CTA in `BrokerDetail.tsx` and bind to `broker.website_url`. If empty, show muted "Coming soon" pill. Open in new tab with `rel="noopener noreferrer sponsored"`.

**Prop Firms**
- Already filters `type='prop-firm'` correctly — the issue is empty DB. Migration above seeds 6 firms.

**Scam Alerts**
- `ScamAlertsAdmin.tsx`: add toggles `is_repeat_offender`, `show_full_report`, plus a `full_report` Textarea. Optional broker picker (link to existing broker).
- `ScamAlertDetail.tsx`: 
  - Show **"REPEAT OFFENDER" red badge** when `is_repeat_offender`
  - When `show_full_report && full_report`, render the long-form text inside a `bg-destructive/5 border-destructive/30 rounded-xl` block with the heading "FULL INVESTIGATION REPORT" in red
  - Add a **"View Broker Profile →"** CTA when `broker_id` is set
- `ScamAlerts.tsx` list: show small "REPEAT" tag on the card when flagged
- `BrokerDetail.tsx`: if any `scam_alerts` row exists for this broker with `show_full_report=true`, render the same red-highlighted block in a new "Investigation" tab (or above Reviews)

### C. Files touched
- 1 SQL migration (promotions cols + scam_alerts cols)
- 1 data insert (6 prop-firm rows)
- `src/pages/admin/PromotionsAdmin.tsx`
- `src/pages/Promotions.tsx`
- `src/pages/PromotionDetail.tsx`
- `src/pages/Brokers.tsx`
- `src/pages/BrokerDetail.tsx` (open-account CTA + scam report block)
- `src/pages/admin/ScamAlertsAdmin.tsx`
- `src/pages/ScamAlertDetail.tsx`
- `src/pages/ScamAlerts.tsx` (REPEAT chip on cards)

### Out of scope
- Per-user referral commissions / tracking on promo clicks (referral system already exists separately)
- Rich-text WYSIWYG for `full_report` / `full_description` — plain textarea with line breaks rendered via `whitespace-pre-line`
- Auto-detecting "repeat offender" from complaint count — admin toggles it manually for now

